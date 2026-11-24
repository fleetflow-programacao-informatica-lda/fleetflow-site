// "Também fazemos" (#servicos), 24/11: os serviços como cartazes num carrossel que dobra (Fold Carousel da HorizonX,
// licença Pro: o motor e os shaders são os deles, passados de React para JS simples; os cartazes são nossos,
// desenhados aqui num canvas — só tipografia e formas, sem fotografias). O cartaz do meio fica plano e os vizinhos
// dobram para os lados com um rasto de luz. Arrastar, deslizar na horizontal, as setas ou o teclado mudam de
// cartaz; por baixo aparece o texto do serviço ativo e o seu "Pedir orçamento". A roda do rato na vertical e o
// gesto vertical no telemóvel continuam a ser da página (js/snap.js). Sem WebGL fica o cartaz plano (2D); o
// three.js (vendor/, do próprio site) só carrega quando a secção se aproxima; com "reduzir movimento" não roda
// sozinho.
(() => {
  'use strict';

  const CARD_H = 1.25001;
  const CAMERA_Z = 3.20001;
  const SEGMENTS = 128;
  const TEX_W = 1024;
  const TEX_H = 1280;
  // A card further than this many slots from the centre is fully off stage.
  const VISIBLE_SPAN = 1.62001;

  // ---------------------------------------------------------------------------
  // Geometry
  //
  // Every card is described by its signed slot offset s (0 = centre, <0 = left).
  // Left side: the card swings about its own LEFT edge (the hinge) like a door
  // opening toward the viewer, 0 -> 180 deg as |s| goes 0 -> 1, while the hinge
  // recedes. At |s| = 1 it lies on the rest "track": a short flat run facing away
  // (so it reads mirrored), then a curl back toward the camera that flares off
  // the side of the stage. Past |s| = 1 the card slides out along that track.
  // The right side is the exact mirror (hinge = the card's own RIGHT edge).
  // ---------------------------------------------------------------------------

  // Rest track (left side), fitted to the silhouettes of the resting neighbours
  // in the reference frames. (x, z) control points.
  const TRACK_POINTS = [
    [-1.13001, -1.66999],
    [-1.39999, -1.66499],
    [-1.52999, -1.60999],
    [-1.56499, -1.44999],
    [-1.527, -1.10999],
    [-1.454, -0.699999],
    [-1.35401, -0.26],
    [-1.24301, 0.159999],
    [-1.12901, 0.530001],
    [-1.03001, 0.95],
    [-1.01999, 1.40001],
    [-1.25001, 2.00],
    [-1.90, 2.45001],
    [-3.19999, 2.74999],
    [-12.0001, 2.95],
    [-60.0001, 3.0]
  ];

  const HINGE_REST = TRACK_POINTS[0];

  // Swing keyframes over t = |s| in [0, 1]: the leaving card is at ~55 deg while
  // the entering one is still folded flat with its flare, and both pass edge-on
  // slightly after the midpoint.
  const KEY_T = [0, 0.3, 0.500001, 0.700001, 1];
  const KEY_ANGLE = [0, 0.299999, 0.514999, 0.919999, 1]; // fraction of 180 deg
  const KEY_HX = [-0.500001, -0.770001, -0.799999, -0.83, HINGE_REST[0]];
  const KEY_HZ = [0, -0.450001, -0.870001, -1.10001, HINGE_REST[1]];
  const KEY_CURL = [0, 0, 0.0200001, 0.849999, 1];

  // Monotone cubic (Fritsch-Carlson) interpolation through the keyframes, so a
  // keyframe never overshoots into a fold the reference does not show.
  function monotone(xs, ys) {
    const n = xs.length;
    const d = [];
    const m = new Array(n);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0];
    m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      const a = m[i] / d[i];
      const b = m[i + 1] / d[i];
      const h = a * a + b * b;
      if (h > 9) { const k = 3 / Math.sqrt(h); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return (x) => {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      let i = 0;
      while (x > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i];
      const t = (x - xs[i]) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i]
        + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  }
  const angleAt = monotone(KEY_T, KEY_ANGLE);
  const hingeX = monotone(KEY_T, KEY_HX);
  const hingeZ = monotone(KEY_T, KEY_HZ);
  const curlAt = monotone(KEY_T, KEY_CURL);

  // Texture parameter p (0..1 over one card, >1 beyond it) -> arc length on the
  // track. The first FLAT_U of the card keeps its size; after that the texture
  // is stretched quadratically, which is what smears it into streaks.
  const FLAT_U = 0.419999;
  const STRETCH = 8;
  function arcOf(p) {
    if (p <= FLAT_U) return p;
    const q = p - FLAT_U;
    return FLAT_U + q + STRETCH * q * q;
  }
  // d(arc)/dp: 1 where the picture keeps its size, growing where it streaks.
  function stretchOf(p) {
    return p <= FLAT_U ? 1 : 1 + 2 * STRETCH * (p - FLAT_U);
  }

  // Dense arc-length table of the Catmull-Rom spline through TRACK_POINTS.
  const track = (() => {
    const pts = [];
    const P = TRACK_POINTS;
    const n = P.length;
    const get = (i) => P[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < n - 1; i++) {
      const p0 = i === 0 ? [2 * P[0][0] - P[1][0], 2 * P[0][1] - P[1][1]] : get(i - 1);
      const p1 = get(i);
      const p2 = get(i + 1);
      const p3 = i + 2 >= n ? [2 * P[n - 1][0] - P[n - 2][0], 2 * P[n - 1][1] - P[n - 2][1]] : get(i + 2);
      const steps = 80;
      for (let k = 0; k < steps; k++) {
        const t = k / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const c = (a, b, cc, d) =>
          0.500001 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
        pts.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    pts.push(P[n - 1]);
    const len = [0];
    for (let i = 1; i < pts.length; i++) {
      len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { pts, len, total: len[len.length - 1] };
  })();

  function trackAt(arc, out) {
    const { pts, len, total } = track;
    const a = Math.min(Math.max(arc, 0), total);
    let lo = 0;
    let hi = len.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (len[mid] <= a) lo = mid; else hi = mid;
    }
    const seg = len[hi] - len[lo] || 1;
    const f = (a - len[lo]) / seg;
    out[0] = pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f;
    out[1] = pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f;
    return out;
  }

  // Rest shape in the hinge's local frame: a = along the card's initial
  // direction (-x at rest), b = toward the camera (+z at rest).
  function restLocal(p, out) {
    trackAt(arcOf(p), out);
    const x = out[0] - HINGE_REST[0];
    const z = out[1] - HINGE_REST[1];
    out[0] = -x;
    out[1] = z;
    return out;
  }

  // Left-side card with t = |s| >= 0. u in [0, 1] from the hinge edge.
  // Writes (x, z, smear) into out.
  const tmp = [0, 0];
  function leftPoint(t, u, out) {
    if (t >= 1) {
      // Slide out along the rest track: a sliver left at t = 1.3, gone by 1.5.
      const p = u + 4.00001 * Math.pow(t - 1, 1.30001);
      trackAt(arcOf(p), out);
      out[2] = stretchOf(p) - 1;
      return out;
    }
    const theta = Math.PI * angleAt(t);
    const curl = curlAt(t);
    // The rigid part of the card swings with the door angle; the curl is added
    // in the rest orientation (toward the camera) so the near-camera flare never
    // swings across the view while the angle is still settling.
    restLocal(u, tmp);
    const bendX = -(tmp[0] - u) * curl;
    const bendZ = tmp[1] * curl;
    out[0] = hingeX(t) + u * Math.cos(theta) + bendX;
    out[1] = hingeZ(t) + u * Math.sin(theta) + bendZ;
    out[2] = (stretchOf(u) - 1) * curl;
    return out;
  }

  // Any card: s = signed slot offset, u in [0, 1] = card-local x (0 = own left
  // edge). Returns [x, z, smear].
  function cardPoint(s, u, out) {
    if (s <= 0) return leftPoint(-s, u, out);
    leftPoint(s, 1 - u, out);
    out[0] = -out[0];
    return out;
  }

  // ---------------------------------------------------------------------------
  // Motion and layout
  // ---------------------------------------------------------------------------

  const wrapIndex = (x, n) => ((x % n) + n) % n;

  // Signed distance of card i from the strip position, on the shorter way round
  // the loop.
  function offsetOf(i, pos, n) {
    let s = wrapIndex(i - pos, n);
    if (s >= n / 2) s -= n;
    return s;
  }

  // Exact solution of a critically damped spring over dt, so it is stable at any
  // frame rate (explicit Euler diverges once omega * dt > 1). Returns [pos, vel].
  function springStep(pos, vel, target, dt, omega) {
    const x = pos - target;
    const e = Math.exp(-omega * dt);
    const c = vel + omega * x;
    let p = target + (x + c * dt) * e;
    let v = (vel - omega * c * dt) * e;
    if (Math.abs(p - target) < 1e-4 && Math.abs(v) < 1e-3) {
      p = target;
      v = 0;
    }
    return [p, v];
  }

  // A released drag lands on the nearest card, nudged at most 0.6 of a slot in
  // the direction of the fling so a flick always goes somewhere.
  function flingTarget(pos, velocity) {
    return Math.round(pos + Math.max(-0.599999, Math.min(0.600001, velocity * 0.12)));
  }

  // A wheel gesture that ends between cards snaps to one; any deliberate gesture
  // (one mouse notch included) moves at least one card.
  function settleWheel(from, target) {
    const moved = target - from;
    if (Math.abs(moved) < 0.0799999) return from;
    return from + Math.sign(moved) * Math.max(1, Math.round(Math.abs(moved)));
  }

  // Stage framing. The reference card is 35.7 % of the stage width and 49.4 % of
  // its height (whichever binds); portrait stages get half the width so the
  // folded neighbours stay legible. The camera's field of view is solved so the
  // centre card is exactly cardPx wide on screen.
  function layoutFor(width, height) {
    const W = Math.max(1, width);
    const H = Math.max(1, height);
    const widthShare = W / H < 0.9 ? 0.499999 : 0.357;
    const cardPx = Math.min(W * widthShare, H * 0.494001);
    const stageW = cardPx / 0.357001;
    return {
      cardPx,
      slotPx: cardPx * 1.24999,
      fov: (2 * Math.atan(H / 2 / cardPx / CAMERA_Z) * 180) / Math.PI,
      // The card centre sits slightly above the stage centre.
      offsetY: cardPx * 0.0440001,
      // Screen x relative to the reference stage, so the fringe follows the
      // geometry at any aspect ratio.
      edgeScale: W / stageW,
      fringe: 0.0219999 * stageW,
      haze: 0.0800001 * stageW
    };
  }

  // ---------------------------------------------------------------------------
  // Shaders
  // ---------------------------------------------------------------------------

  const CARD_VERTEX = /* glsl */`
    attribute float smear;
    varying vec2 vUv;
    varying float vSmear;
    void main() {
      vUv = uv;
      vSmear = smear;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const CARD_FRAGMENT = /* glsl */`
    uniform sampler2D map;
    uniform float radius;
    uniform float smearAmount;
    varying vec2 vUv;
    varying float vSmear;
    void main() {
      vec2 size = vec2(1.0, ${CARD_H.toFixed(3)});
      vec2 p = vUv * size - size * 0.5;
      vec2 q = abs(p) - size * 0.5 + radius;
      float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
      float aa = max(fwidth(d), 1e-5);
      float alpha = clamp(0.5 - d / aa, 0.0, 1.0);
      if (alpha <= 0.0) discard;

      // Horizontal streak smear on the stretched (flared) part.
      float spread = vSmear * smearAmount;
      vec3 col = vec3(0.0);
      for (int i = 0; i < 9; i++) {
        float o = (float(i) / 8.0 - 0.5) * spread;
        col += texture2D(map, vec2(clamp(vUv.x + o, 0.0, 1.0), vUv.y)).rgb;
      }
      col /= 9.0;
      gl_FragColor = vec4(col, alpha);
    }
  `;

  const POST_VERTEX = /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = position.xy * 0.5 + 0.5;
      gl_Position = vec4(position.xy, 0.0, 1.00001);
    }
  `;

  const POST_FRAGMENT = /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float strength;
    uniform float haze;
    uniform float edgeScale;
    uniform vec2 centre;
    uniform vec3 bg;
    uniform float clearStage;
    varying vec2 vUv;
    const int TAPS = 24;
    const int HAZE_TAPS = 14;
    const float HAZE_HUE = -1.22;
    const float HAZE_LIGHT = 0.35;
    const float HAZE_SAT = 1.8;
    const float HAZE_ALPHA = 0.9;
    vec3 spectrum(float t) {
      // t = 0 -> blue, 0.5 -> green, 1 -> red (red is displaced furthest out).
      return max(vec3(
        1.0 - abs(t - 1.0) * 1.9,
        1.0 - abs(t - 0.5) * 2.4,
        1.0 - abs(t) * 1.9
      ), 0.0) + 0.02;
    }
    // Hue rotation about the grey axis (Rodrigues); positive = red -> green.
    vec3 hueRotate(vec3 c, float a) {
      const vec3 k = vec3(0.57735027);
      float ca = cos(a);
      return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
    }
    float isCard(vec3 s) {
      return smoothstep(0.015, 0.05, distance(s, bg));
    }
    vec3 hazeTint(vec3 c) {
      vec3 ghost = hueRotate(c, HAZE_HUE);
      float luma = dot(ghost, vec3(0.299, 0.587, 0.114));
      return clamp(mix(vec3(luma), ghost, HAZE_SAT), 0.0, 1.0);
    }

    // Transparent stage. The cards were drawn over a zero-alpha clear, so the
    // target holds premultiplied colour and coverage lives in alpha; the page
    // behind is unknown, so the haze fades by opacity instead of lifting toward
    // a stage colour, and it is laid under the card rather than over it.
    vec4 clearPass(vec2 c, float k, vec2 dir) {
      vec2 off = dir * strength * k / resolution;
      vec3 acc = vec3(0.0), cover = vec3(0.0), wsum = vec3(0.0);
      for (int i = 0; i < TAPS; i++) {
        float t = float(i) / float(TAPS - 1);
        vec3 w = spectrum(t);
        vec4 s = texture2D(tDiffuse, vUv - off * t);
        acc += s.rgb * w;
        cover += s.a * w;
        wsum += w;
      }
      vec3 col = acc / wsum;
      cover /= wsum;
      // Each channel has its own coverage. The widest one sets the alpha and the
      // channels it leaves uncovered are filled with light, which is what the
      // pale reference stage lends them: the silhouette keeps its warm spectral
      // rim on any page, and the colour stays premultiplied (never above alpha).
      float alpha = max(max(cover.r, cover.g), cover.b);
      col += alpha - cover;

      vec2 hdir = normalize(vec2(c.x * 0.3, c.y) * resolution + 1e-4);
      vec2 hoff = hdir * haze * k / resolution;
      vec3 hc = vec3(0.0);
      float cov = 0.0, wt = 0.0;
      for (int i = 0; i < HAZE_TAPS; i++) {
        float t = (float(i) + 0.5) / float(HAZE_TAPS);
        vec4 s = texture2D(tDiffuse, vUv - hoff * t);
        float w = 1.0 - 0.7 * t;
        float m = smoothstep(0.015, 0.05, s.a) * w;
        hc += s.rgb / max(s.a, 1e-3) * m;
        cov += m;
        wt += w;
      }
      float self = smoothstep(0.015, 0.05, texture2D(tDiffuse, vUv).a);
      if (cov > 0.0) {
        vec3 ghost = hazeTint(hc / cov);
        float a = sqrt(cov / wt) * (1.0 - self) * HAZE_ALPHA * (1.0 - HAZE_LIGHT) * smoothstep(0.25, 0.7, k);
        col += ghost * a * (1.0 - alpha);
        alpha += a * (1.0 - alpha);
      }
      return vec4(col, alpha);
    }

    void main() {
      vec2 c = vUv - centre;
      float ax = abs(c.x) * 2.0 * edgeScale;
      float k = smoothstep(0.34, 1.0, ax);
      k *= k;
      vec2 dir = normalize(c * resolution + 1e-4);
      if (clearStage > 0.5) {
        gl_FragColor = clearPass(c, k, dir);
        return;
      }

      // Thin spectral split: each channel is displaced along dir by a different
      // amount (red furthest).
      vec2 off = dir * strength * k / resolution;
      vec3 acc = vec3(0.0), wsum = vec3(0.0);
      for (int i = 0; i < TAPS; i++) {
        float t = float(i) / float(TAPS - 1);
        vec3 w = spectrum(t);
        acc += texture2D(tDiffuse, vUv - off * t).rgb * w;
        wsum += w;
      }
      vec3 col = acc / wsum;

      // Outer haze: a pale, hue-shifted ghost of the card spilling past its
      // silhouette. The flares open vertically, so the haze spreads mostly away
      // from the horizontal mid-line rather than radially.
      vec2 hdir = normalize(vec2(c.x * 0.3, c.y) * resolution + 1e-4);
      vec2 hoff = hdir * haze * k / resolution;
      vec3 hc = vec3(0.0);
      float cov = 0.0, wt = 0.0;
      for (int i = 0; i < HAZE_TAPS; i++) {
        float t = (float(i) + 0.5) / float(HAZE_TAPS);
        vec3 s = texture2D(tDiffuse, vUv - hoff * t).rgb;
        float w = 1.0 - 0.7 * t;
        float m = isCard(s) * w;
        hc += s * m;
        cov += m;
        wt += w;
      }
      float self = isCard(texture2D(tDiffuse, vUv).rgb);
      if (cov > 0.0) {
        vec3 ghost = hazeTint(hc / cov);
        // Lift toward white on a light stage, toward the stage on a dark one, so
        // the ghost never reads as a glow the reference does not have.
        vec3 lift = dot(bg, vec3(0.299, 0.587, 0.114)) > 0.5 ? vec3(1.0) : bg;
        ghost = mix(ghost, lift, HAZE_LIGHT);
        float a = sqrt(cov / wt) * (1.0 - self) * HAZE_ALPHA * smoothstep(0.25, 0.7, k);
        col = mix(col, ghost, a);
      }
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // ---------------------------------------------------------------------------
  // Our posters (one per service), drawn at runtime on a 1024 x 1280 canvas:
  // only type and simple shapes, no photos, in deep green, blue-violet, red and
  // ink with ivory and the FleetFlow green. The words follow the page language.
  // ---------------------------------------------------------------------------

  const IVORY = '#f2ede3';
  const GREEN = '#31e0a0';
  const RED = '#d6322b';
  const INK = '#121413';
  const GEIST = "Geist, ui-sans-serif, system-ui, 'Segoe UI', sans-serif";

  const POSTERS = {
    pt: [
      { tag: 'Oficina', lines: ['OFICINA', '+ STOCK'], caption: 'Trabalhos, peças e a app da oficina' },
      { tag: 'Sites', lines: ['SITES', 'COM MOVIMENTO'], caption: 'Animação e 3D, como este site' },
      { tag: 'Por medida', lines: ['SOFTWARE', 'À MEDIDA'], caption: 'Ferramentas, portais e agentes de IA' },
      { tag: 'Ligações', lines: ['INTEGRAÇÕES', 'FATURAÇÃO · GPS'], caption: 'Cartrack disponível · outras em validação' },
    ],
    en: [
      { tag: 'Workshop', lines: ['WORKSHOP', '+ STOCK'], caption: 'Jobs, parts and the workshop app' },
      { tag: 'Websites', lines: ['WEBSITES', 'WITH MOTION'], caption: 'Animation and 3D, like this site' },
      { tag: 'Custom', lines: ['SOFTWARE', 'MADE TO FIT'], caption: 'Tools, portals and AI agents' },
      { tag: 'Integrations', lines: ['INTEGRATIONS', 'INVOICING · GPS'], caption: 'Cartrack available · others in validation' },
    ],
    es: [
      { tag: 'Taller', lines: ['TALLER', '+ STOCK'], caption: 'Trabajos, piezas y la app del taller' },
      { tag: 'Webs', lines: ['WEBS', 'CON MOVIMIENTO'], caption: 'Animación y 3D, como esta web' },
      { tag: 'A medida', lines: ['SOFTWARE', 'A MEDIDA'], caption: 'Herramientas, portales y agentes de IA' },
      { tag: 'Conexiones', lines: ['INTEGRACIONES', 'FACTURACIÓN · GPS'], caption: 'Cartrack disponible · otras en validación' },
    ],
  };

  // The largest size (up to max) at which text fits maxWidth.
  function fitFont(ctx, text, maxWidth, max, weight) {
    let size = max;
    ctx.font = `${weight} ${size}px ${GEIST}`;
    const w = ctx.measureText(text).width;
    if (w > maxWidth) size = Math.floor((size * maxWidth) / w);
    ctx.font = `${weight} ${size}px ${GEIST}`;
    return size;
  }

  function spaced(ctx, value) {
    if ('letterSpacing' in ctx) ctx.letterSpacing = value;
  }

  function frame(ctx, W, H, index, total, poster, ink) {
    // Top band: brand, number and the tag in a hairline pill.
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.9;
    ctx.font = `600 28px ${GEIST}`;
    spaced(ctx, '5px');
    ctx.fillText('FLEETFLOW', 72, 112);
    const num = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    ctx.textAlign = 'right';
    ctx.fillText(num, W - 72, 112);
    ctx.textAlign = 'left';
    spaced(ctx, '0px');
    ctx.globalAlpha = 1;
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(72, 146);
    ctx.lineTo(W - 72, 146);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Title: two bold lines filling the width, then the caption.
    const [a, b] = poster.lines;
    const s1 = fitFont(ctx, a, W - 144, 190, 800);
    spaced(ctx, `${-s1 * 0.03}px`);
    ctx.fillStyle = ink;
    ctx.fillText(a, 66, 1040);
    const s2 = fitFont(ctx, b, W - 144, 92, 700);
    spaced(ctx, `${-s2 * 0.02}px`);
    ctx.fillText(b, 70, 1040 + s2 + 18);
    spaced(ctx, '0px');
    ctx.globalAlpha = 0.82;
    ctx.font = `500 34px ${GEIST}`;
    ctx.fillText(poster.caption, 72, H - 72);
    ctx.globalAlpha = 1;
    return s1;
  }

  function strokeIcon(ctx, d, x, y, scale, color, width) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = width / scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(new Path2D(d));
    ctx.restore();
  }

  const MOTIFS = [
    // Workshop: a parts shelf (one part flagged red) and a wrench.
    (ctx) => {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
          const x = 72 + c * 148;
          const y = 220 + r * 140;
          ctx.beginPath();
          ctx.roundRect(x, y, 124, 112, 14);
          const lit = (r * 6 + c) % 5 === 0 || (r + c) % 7 === 3;
          ctx.fillStyle = r === 2 && c === 4 ? RED : lit ? IVORY : 'rgba(242,237,227,0.12)';
          ctx.fill();
        }
      }
      // An open-end wrench across the shelf: handle, ring head and its jaw.
      ctx.save();
      ctx.translate(560, 430);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = GREEN;
      ctx.beginPath();
      ctx.roundRect(-300, -30, 420, 60, 30);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(170, 0, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0c3a2b';
      ctx.beginPath();
      ctx.roundRect(170, -34, 120, 68, 10);
      ctx.arc(170, 0, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    // Websites: a halftone wave, the dots growing where it crests.
    (ctx) => {
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 24; c++) {
          const x = 92 + c * 36.5;
          const base = 230 + r * 40;
          const wave = Math.sin(c * 0.42 + r * 0.55) * 26 + Math.sin(c * 0.13) * 18;
          const k = 0.5 + 0.5 * Math.sin(c * 0.42 + r * 0.55 + 1.2);
          ctx.beginPath();
          ctx.arc(x, base + wave, 3 + k * 9, 0, Math.PI * 2);
          ctx.fillStyle = (r + c) % 11 === 0 ? GREEN : IVORY;
          ctx.globalAlpha = 0.25 + k * 0.75;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    },
    // Custom software: a ruler along the side and a large code mark.
    (ctx) => {
      ctx.fillStyle = IVORY;
      for (let i = 0; i <= 30; i++) {
        const long = i % 5 === 0;
        ctx.globalAlpha = long ? 0.9 : 0.5;
        ctx.fillRect(72, 200 + i * 20, long ? 56 : 28, 3);
      }
      ctx.globalAlpha = 1;
      strokeIcon(ctx, 'M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13', 210, 120, 30, IVORY, 30);
      ctx.beginPath();
      ctx.arc(860, 270, 22, 0, Math.PI * 2);
      ctx.fillStyle = INK;
      ctx.fill();
    },
    // Integrations: FleetFlow in the middle, linked to the software it talks to.
    (ctx, W) => {
      const cx = W / 2;
      const cy = 500;
      const names = ['Cartrack', 'Frotcom', 'Webfleet', 'InvoiceXpress', 'Moloni', 'PHC GO', 'Stripe'];
      ctx.font = `600 30px ${GEIST}`;
      names.forEach((name, i) => {
        const a = (i / names.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * 330;
        const y = cy + Math.sin(a) * 250;
        ctx.strokeStyle = 'rgba(242,237,227,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        const w = ctx.measureText(name).width + 40;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - 28, w, 56, 28);
        ctx.fillStyle = INK;
        ctx.fill();
        ctx.strokeStyle = i === 0 ? GREEN : 'rgba(242,237,227,0.45)';
        ctx.stroke();
        ctx.fillStyle = IVORY;
        ctx.textAlign = 'center';
        ctx.fillText(name, x, y + 10);
        ctx.textAlign = 'left';
      });
      ctx.beginPath();
      ctx.arc(cx, cy, 74, 0, Math.PI * 2);
      ctx.fillStyle = GREEN;
      ctx.fill();
      strokeIcon(ctx, 'M3 9l5 5-5 5M10 9l5 5-5 5M17 9l5 5-5 5', cx - 50, cy - 56, 4, INK, 10);
    },
  ];

  const GROUNDS = [
    (ctx, W, H) => solid(ctx, W, H, '#0d3b2c', '#082a1f'),
    (ctx, W, H) => solid(ctx, W, H, '#4338ca', '#231c7a'),
    (ctx, W, H) => solid(ctx, W, H, '#c8281f', '#951c15'),
    (ctx, W, H) => solid(ctx, W, H, '#15181a', INK),
  ];
  function solid(ctx, W, H, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawPoster(ctx, index, lang) {
    const W = TEX_W;
    const H = TEX_H;
    const list = POSTERS[lang] || POSTERS.pt;
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    GROUNDS[index](ctx, W, H);
    MOTIFS[index](ctx, W, H);
    frame(ctx, W, H, index, list.length, list[index], IVORY);
    ctx.restore();
  }

  function waitForFonts() {
    const fonts = document.fonts;
    if (!fonts?.load) return Promise.resolve();
    const loads = Promise.all([fonts.load(`800 100px ${GEIST}`), fonts.load(`500 34px ${GEIST}`)]).catch(() => {});
    return Promise.race([loads, new Promise((resolve) => setTimeout(resolve, 1500))]);
  }

  // ---------------------------------------------------------------------------
  // Runtime (the HorizonX engine without React; the stage is painted in the
  // section's own colour and repainted when the theme changes)
  // ---------------------------------------------------------------------------

  const html = document.documentElement;
  const pageLang = () => {
    const l = (html.lang || 'pt').slice(0, 2);
    return POSTERS[l] ? l : 'pt';
  };

  function cssColor(el) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    return m && (m.length < 4 || +m[3] > 0) ? m.slice(0, 3).map(Number) : [250, 249, 246];
  }

  function buildFold(root, { count, onChange, autoplay = 6, settle = 10.5, fringe = 1, haze = 0.8, smear = 1 }) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stage = root.querySelector('.fc-gl');
    const live = root.querySelector('.fc-live');
    const still = root.querySelector('.fc-still');
    const ground = root.closest('section') || root;
    const stillCtx = still.getContext('2d');
    still.width = TEX_W;
    still.height = TEX_H;

    let scene = null;
    const motion = { pos: 0, vel: 0, target: 0, dragging: false };
    const index = () => wrapIndex(Math.round(motion.target), count);

    let shown = -1;
    let shownLang = '';
    function changed(speak) {
      const i = index();
      const l = pageLang();
      if (i === shown && l === shownLang) return;
      shown = i;
      shownLang = l;
      // The flat 2D poster is the fallback and what shows before WebGL is ready.
      drawPoster(stillCtx, i, l);
      onChange(i);
      if (speak && live) {
        const p = POSTERS[l][i];
        live.textContent = `${p.lines.join(' ')} — ${i + 1} / ${count}`;
      }
    }

    function go(delta, speak = true) {
      motion.target = Math.round(motion.target) + delta;
      changed(speak);
      scene?.invalidate();
    }

    function goTo(i) {
      go(offsetOf(wrapIndex(Math.round(i), count), Math.round(motion.target), count));
    }

    // --- input -----------------------------------------------------------------
    // Drag (mouse or a sideways swipe), the sideways wheel and the arrow keys move
    // it; a vertical wheel or swipe stays with the page (js/snap.js, scrolling).

    let drag = null;
    root.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || (e.target instanceof Element && e.target.closest('button'))) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, pos: motion.pos, lastX: e.clientX, lastT: performance.now(), v: 0, live: false };
    });
    root.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.live) {
        const dx = Math.abs(e.clientX - drag.x);
        if (dx < 6 || dx < Math.abs(e.clientY - drag.y)) return;
        drag.live = true;
        try {
          root.setPointerCapture(e.pointerId);
        } catch (err) {
          /* synthetic events */
        }
        motion.dragging = true;
        motion.vel = 0;
        root.setAttribute('data-dragging', '');
      }
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1) / 1000;
      const slot = scene?.slotPx() ?? 380;
      const v = -(e.clientX - drag.lastX) / slot / dt;
      drag.v = drag.v * 0.7 + v * 0.3;
      drag.lastX = e.clientX;
      drag.lastT = now;
      motion.pos = drag.pos - (e.clientX - drag.x) / slot;
      scene?.invalidate();
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const wasLive = drag.live;
      const idle = performance.now() - drag.lastT > 120;
      const velocity = idle ? 0 : drag.v;
      drag = null;
      if (!wasLive) return;
      motion.target = flingTarget(motion.pos, velocity);
      motion.vel = velocity;
      motion.dragging = false;
      root.removeAttribute('data-dragging');
      changed(true);
      scene?.invalidate();
    };
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
    root.addEventListener('lostpointercapture', endDrag);

    let wheelTimer = 0;
    let wheelFrom = null;
    root.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical: the page's
        e.preventDefault();
        if (wheelFrom === null) wheelFrom = Math.round(motion.target);
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
        const next = motion.target + (e.deltaX * unit) / ((scene?.slotPx() ?? 380) * 1.2);
        motion.target = Math.max(motion.pos - 1.4, Math.min(motion.pos + 1.4, next));
        scene?.invalidate();
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => {
          motion.target = settleWheel(wheelFrom, motion.target);
          wheelFrom = null;
          changed(true);
          scene?.invalidate();
        }, 140);
      },
      { passive: false },
    );

    root.addEventListener('keydown', (e) => {
      if (e.target !== root || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Home') goTo(0);
      else if (e.key === 'End') goTo(count - 1);
      else return;
      e.preventDefault();
    });

    // --- autoplay: only on screen, never while someone holds it ----------------

    let hovered = false;
    let focused = false;
    let onScreen = false;
    let autoTimer = 0;
    const holder = root.parentElement;
    holder.addEventListener('pointerenter', () => (hovered = true));
    holder.addEventListener('pointerleave', () => (hovered = false));
    holder.addEventListener('focusin', () => (focused = true));
    holder.addEventListener('focusout', () => (focused = false));
    function scheduleAutoplay() {
      clearTimeout(autoTimer);
      if (!autoplay || reducedMotion.matches) return;
      autoTimer = setTimeout(() => {
        if (onScreen && !motion.dragging && !hovered && !focused && !document.hidden) go(1, false);
        scheduleAutoplay();
      }, autoplay * 1000);
    }
    reducedMotion.addEventListener('change', scheduleAutoplay);

    // --- scene -------------------------------------------------------------------

    function fail() {
      root.setAttribute('data-fc-fallback', '');
    }

    function createScene(THREE) {
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
      } catch (err) {
        fail();
        return null;
      }
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      const canvas = renderer.domElement;
      canvas.className = 'fc-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      stage.replaceChildren(canvas);

      const world = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200);
      camera.position.set(0, 0, CAMERA_Z);
      const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4, depthBuffer: true });

      const clear = new THREE.Color();
      const bgUniform = new THREE.Vector3();
      const clearStage = { value: 0 };
      // The stage is the section's colour (light or dark theme).
      function applyBackground() {
        const [r, g, b] = cssColor(ground);
        clear.setRGB(r / 255, g / 255, b / 255, THREE.LinearSRGBColorSpace);
        renderer.setClearColor(clear, 1);
        bgUniform.set(r / 255, g / 255, b / 255);
      }
      applyBackground();

      const post = new THREE.Mesh(
        new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)),
        new THREE.ShaderMaterial({
          uniforms: {
            tDiffuse: { value: target.texture },
            resolution: { value: new THREE.Vector2(1, 1) },
            strength: { value: 1 },
            haze: { value: 1 },
            edgeScale: { value: 1 },
            centre: { value: new THREE.Vector2(0.5, 0.5) },
            bg: { value: bgUniform },
            clearStage,
          },
          vertexShader: POST_VERTEX,
          fragmentShader: POST_FRAGMENT,
          depthTest: false,
          depthWrite: false,
        }),
      );
      post.frustumCulled = false;
      const postScene = new THREE.Scene();
      postScene.add(post);
      const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      function buildGeometry() {
        const cols = SEGMENTS + 1;
        const g = new THREE.BufferGeometry();
        const uv = new Float32Array(cols * 4);
        const idx = [];
        for (let i = 0; i < cols; i++) {
          const u = i / SEGMENTS;
          uv.set([u, 1, u, 0], i * 4);
          if (i < SEGMENTS) {
            const a = i * 2;
            idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
          }
        }
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cols * 6), 3).setUsage(THREE.DynamicDrawUsage));
        g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        g.setAttribute('smear', new THREE.BufferAttribute(new Float32Array(cols * 2), 1).setUsage(THREE.DynamicDrawUsage));
        g.setIndex(idx);
        return g;
      }

      const pt = [0, 0, 0];
      function updateMesh(mesh, s) {
        const g = mesh.geometry;
        const pos = g.attributes.position.array;
        const sm = g.attributes.smear.array;
        const halfH = CARD_H / 2;
        for (let i = 0; i <= SEGMENTS; i++) {
          cardPoint(s, i / SEGMENTS, pt);
          const o = i * 6;
          pos[o] = pt[0];
          pos[o + 1] = halfH;
          pos[o + 2] = pt[1];
          pos[o + 3] = pt[0];
          pos[o + 4] = -halfH;
          pos[o + 5] = pt[1];
          sm[i * 2] = sm[i * 2 + 1] = pt[2];
        }
        g.attributes.position.needsUpdate = true;
        g.attributes.smear.needsUpdate = true;
      }

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      const slots = [];
      for (let i = 0; i < count; i++) {
        const canvas2d = document.createElement('canvas');
        canvas2d.width = TEX_W;
        canvas2d.height = TEX_H;
        const texture = new THREE.CanvasTexture(canvas2d);
        texture.anisotropy = maxAnisotropy;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;
        const material = new THREE.ShaderMaterial({
          uniforms: { map: { value: texture }, radius: { value: 0.036 }, smearAmount: { value: 0.012 * smear } },
          vertexShader: CARD_VERTEX,
          fragmentShader: CARD_FRAGMENT,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: true,
        });
        const mesh = new THREE.Mesh(buildGeometry(), material);
        mesh.frustumCulled = false;
        mesh.visible = false;
        world.add(mesh);
        slots.push({ ctx: canvas2d.getContext('2d'), texture, mesh, lang: '', ready: false });
      }
      // Posters are repainted when the page language changes.
      function paintAll() {
        const l = pageLang();
        waitForFonts().then(() => {
          slots.forEach((slot, i) => {
            if (slot.lang === l) return;
            slot.lang = l;
            drawPoster(slot.ctx, i, l);
            slot.texture.needsUpdate = true;
            slot.ready = true;
          });
          invalidate();
          root.setAttribute('data-fc-ready', '');
        });
      }
      paintAll();

      let layout = layoutFor(1, 1);
      let dpr = 1;
      function resize() {
        const W = Math.max(1, root.clientWidth);
        const H = Math.max(1, root.clientHeight);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(W, H, false);
        layout = layoutFor(W, H);
        camera.aspect = W / H;
        camera.fov = layout.fov;
        camera.setViewOffset(W, H, 0, layout.offsetY, W, H);
        camera.updateProjectionMatrix();
        const bw = Math.round(W * dpr);
        const bh = Math.round(H * dpr);
        target.setSize(bw, bh);
        const u = post.material.uniforms;
        u.resolution.value.set(bw, bh);
        u.edgeScale.value = layout.edgeScale;
        u.centre.value.set(0.5, 0.5);
        u.strength.value = layout.fringe * dpr * fringe;
        u.haze.value = layout.haze * dpr * haze;
        invalidate();
      }
      new ResizeObserver(resize).observe(root);

      function render() {
        const n = slots.length;
        for (let i = 0; i < n; i++) {
          const slot = slots[i];
          const s = offsetOf(i, motion.pos, n);
          const visible = slot.ready && Math.abs(s) < VISIBLE_SPAN;
          slot.mesh.visible = visible;
          if (visible) {
            updateMesh(slot.mesh, s);
            slot.mesh.renderOrder = -Math.round(Math.abs(s) * 100);
          }
        }
        renderer.setRenderTarget(target);
        renderer.render(world, camera);
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCamera);
      }

      // Frames only while something moves or after a change.
      let frame = 0;
      let last = 0;
      function tick(now) {
        frame = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
        last = now;
        const omega = reducedMotion.matches ? 22 : settle;
        if (!motion.dragging) [motion.pos, motion.vel] = springStep(motion.pos, motion.vel, motion.target, dt, omega);
        if (onScreen) render();
        const moving = motion.dragging || motion.pos !== motion.target || motion.vel !== 0;
        if (moving && onScreen) frame = requestAnimationFrame(tick);
        else last = 0;
      }
      function invalidate() {
        if (!frame) frame = requestAnimationFrame(tick);
      }

      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        cancelAnimationFrame(frame);
        frame = 0;
      });
      canvas.addEventListener('webglcontextrestored', () => {
        for (const slot of slots) slot.texture.needsUpdate = true;
        invalidate();
      });

      resize();
      return {
        invalidate,
        slotPx: () => layout.slotPx,
        retheme() {
          applyBackground();
          invalidate();
        },
        relang: paintAll,
      };
    }

    // --- lazy start: three.js (served by the site) only once the section is near --

    let started = false;
    function start() {
      if (started) return;
      started = true;
      import('../vendor/three.min.js')
        .then((THREE) => {
          scene = createScene(THREE);
          if (scene) scheduleAutoplay();
        })
        .catch(fail);
    }
    new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        if (onScreen) {
          start();
          scene?.invalidate();
        }
      },
      { rootMargin: '200px 0px' },
    ).observe(root);

    new MutationObserver((records) => {
      for (const r of records) {
        if (r.attributeName === 'data-theme') scene?.retheme();
        if (r.attributeName === 'lang') {
          changed(false);
          scene?.relang();
        }
      }
    }).observe(html, { attributes: true, attributeFilter: ['data-theme', 'lang'] });

    waitForFonts().then(() => {
      shownLang = '';
      changed(false);
    });
    changed(false);
    return { go, goTo };
  }

  // ---------------------------------------------------------------------------
  // "Também fazemos" (#servicos): the posters, the active service's card below
  // (its text and the "Pedir orçamento" link, js/pedido.js) and the arrows.
  // ---------------------------------------------------------------------------

  const section = document.getElementById('servicos');
  const root = section?.querySelector('.fc-root');
  if (!root) return;
  const items = [...section.querySelectorAll('.srv__card')];
  const counter = section.querySelector('.fold__count');
  const dots = [...section.querySelectorAll('.fold__dot')];
  const carousel = buildFold(root, {
    count: items.length,
    onChange(i) {
      items.forEach((li, k) => (li.hidden = k !== i));
      if (counter) counter.textContent = `${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    },
  });
  section.classList.add('is-fold');
  section.querySelectorAll('[data-fold-step]').forEach((b) => b.addEventListener('click', () => carousel.go(Number(b.dataset.foldStep))));
  dots.forEach((d, k) => d.addEventListener('click', () => carousel.goTo(k)));
})();
