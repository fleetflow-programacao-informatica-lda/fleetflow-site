/* Porta-automóveis da secção "Transporte de veículos" (#transporte-veiculos), 24/11.
   O desenho aprovado pelo founder: camião rígido com 2 lugares (sobre a cabine e no estrado) + reboque de lança
   com 6 (3 em cima, 3 em baixo). Dados de exemplo: 8 carros de 4 clientes, sem nomes de empresas.
   Ciclo: lugares vazios (fantasmas com o código) → os carros acendem um a um com a cor do cliente → em rota
   (rodas e estrada mexem) → entrega: cada carro volta a fantasma com o visto verde → pausa → repete.
   Só anima com a secção à vista; com "reduzir movimento" fica o camião carregado, parado.
   Os textos vêm de spans escondidos com data-i18n (cv.rig.*), que o i18n da página traduz. Sem bibliotecas. */
(function () {
  'use strict';
  var root = document.querySelector('#transporte-veiculos');
  var host = root && root.querySelector('[data-rig]');
  if (!host) return;

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // ── Dados de exemplo ──────────────────────────────────────────────────────
  var CLIENTS = { A: '#0E8F6A', B: '#2F6FDB', C: '#D49406', D: '#7A5AF0' };
  // Lugares: x = traseira do carro, y = linha das rodas, rot = inclinação (+ desce para a frente)
  var SLOTS = {
    H1: { x: 792, y: 104, rot: 5 },     // sobre a cabine
    G1: { x: 652, y: 186, rot: 6 },     // estrado do camião
    U1: { x: 515, y: 139, rot: 0 },     // reboque, em cima
    U2: { x: 355, y: 139, rot: 0 },
    U3: { x: 190, y: 147, rot: -8.5 },  // reboque, rampa de cima
    L1: { x: 490, y: 214, rot: 0 },     // reboque, em baixo
    L2: { x: 330, y: 214, rot: 0 },
    L3: { x: 152, y: 197, rot: 12.5 }   // reboque, rampa de baixo
  };
  var CARS = [
    { type: 'estate', client: 'A', slot: 'H1' },
    { type: 'suv', client: 'A', slot: 'U1' },
    { type: 'hatch', client: 'B', slot: 'U2' },
    { type: 'estate', client: 'B', slot: 'U3' },
    { type: 'suv', client: 'C', slot: 'G1' },
    { type: 'hatch', client: 'C', slot: 'L1' },
    { type: 'sedan', client: 'D', slot: 'L2' },
    { type: 'sedan', client: 'A', slot: 'L3' }
  ];
  var LOAD_ORDER = ['H1', 'G1', 'U1', 'U2', 'U3', 'L1', 'L2', 'L3'];
  var UNLOAD_ORDER = ['L3', 'L2', 'L1', 'U3', 'U2', 'U1', 'G1', 'H1'];
  var TOTAL = CARS.length;

  // Mistura uma cor com preto (contorno mais escuro da cor do cliente), sem depender de color-mix().
  function darken(hex, keep) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.round(((n >> 16) & 255) * keep), g = Math.round(((n >> 8) & 255) * keep), b = Math.round((n & 255) * keep);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // ── Carros em linha técnica (frente à direita; comprimento 140; rodas assentam em y=51) ──
  var ARCH = 'L126,41 A14,14 0 0 0 98,41 L42,41 A14,14 0 0 0 14,41 L4,41';
  var BODY = {
    estate: 'M4,41 L3,29 C3,25 5,23 9,22 L14,11 C15,8 17,7 21,7 L90,6 C95,6 98,7 101,9 L113,20 C124,21 133,23 137,26 C139,28 140,31 140,35 L140,41 ' + ARCH + ' Z',
    sedan: 'M4,41 L3,30 C3,26 6,24 10,23 L27,22 L39,10 C41,8 43,7 46,7 L86,7 C91,7 94,8 97,10 L112,21 C124,22 133,23 137,26 C139,28 140,31 140,35 L140,41 ' + ARCH + ' Z',
    hatch: 'M4,41 L3,27 C3,20 6,12 11,9 C13,8 15,7 18,7 L84,6 C89,6 92,7 95,9 L110,20 C123,21 133,23 137,26 C139,28 140,31 140,35 L140,41 ' + ARCH + ' Z',
    suv: 'M4,41 L3,24 C3,18 5,10 9,6 C10,4 12,3 15,3 L92,2 C97,2 100,4 103,6 L115,18 C126,19 134,21 137,24 C139,27 140,30 140,34 L140,41 ' + ARCH + ' Z'
  };
  var GLASS = {
    estate: 'M18,11 L20,9 L88,8.5 C92,8.5 95,9.5 97,11 L106,19.5 L16,20 Z',
    sedan: 'M41,11 C43,9.5 45,9 47,9 L85,9 C89,9 92,10 94,11.5 L105,20 L32,20.5 Z',
    hatch: 'M12,12 C14,10 16,9 19,9 L83,8.5 C87,8.5 90,9.5 92,11 L103,19.5 L10,20 Z',
    suv: 'M12,8 C13,6 15,5.5 17,5.5 L90,5 C94,5 97,6 99,8 L108,17 L10,17.5 Z'
  };
  var PILLARS = { estate: [54, 78], sedan: [64, 84], hatch: [50, 72], suv: [52, 78] };

  var GROUND = 240;
  var svg = el('svg', { class: 'cv-rig', viewBox: '108 34 852 250', 'aria-hidden': 'true', focusable: 'false' });

  // fundo: colinas, chão e estrada
  var far = el('g', { class: 'cv-rig__far', opacity: '.5' }, svg);
  for (var i = 0; i < 3; i++) {
    var o = 100 + i * 600;
    el('path', { d: 'M' + o + ',' + GROUND + ' C' + (o + 80) + ',206 ' + (o + 170) + ',218 ' + (o + 250) + ',200 C' + (o + 330) + ',186 ' + (o + 420) + ',214 ' + (o + 520) + ',204 C' + (o + 560) + ',200 ' + (o + 585) + ',214 ' + (o + 600) + ',218 L' + (o + 600) + ',' + GROUND + ' Z', fill: '#E1EAE6' }, far);
  }
  el('rect', { x: 100, y: GROUND, width: 870, height: 50, fill: '#E8EDEB' }, svg);
  el('line', { x1: 100, y1: GROUND, x2: 970, y2: GROUND, stroke: '#C7D1CD', 'stroke-width': 1.5 }, svg);
  el('line', { class: 'cv-rig__road', x1: 0, y1: 262, x2: 1100, y2: 262, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-dasharray': '45 45' }, svg);
  el('ellipse', { cx: 545, cy: GROUND, rx: 410, ry: 4, fill: '#000', opacity: '.07' }, svg);

  // o conjunto: "settle" desce com o peso; "body" balança em rota
  var settle = el('g', { class: 'cv-rig__settle' }, svg);
  var body = el('g', { class: 'cv-rig__body' }, settle);
  function line(d, w, parent, color) {
    return el('path', { d: d, fill: 'none', stroke: color || 'var(--rig-steel)', 'stroke-width': w || 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent || body);
  }
  function thin(d, parent) { return line(d, 1.4, parent, 'var(--rig-steel-2)'); }

  // ── REBOQUE (atrás): eixo duplo, rampas traseiras, piso de baixo e trilho de cima ──
  var trailer = el('g', {}, body);
  line('M142,118 L142,222', 3.2, trailer);
  thin('M148,122 L148,218', trailer);
  line('M150,218 L644,218', 3, trailer);
  thin('M168,224 L644,224', trailer);
  for (var tx = 190; tx < 640; tx += 46) el('rect', { x: tx, y: 216, width: 3, height: 10, fill: 'var(--rig-steel-2)' }, trailer);
  line('M332,141 L660,141', 3, trailer);
  thin('M332,145 L660,145', trailer);
  [326, 486, 644].forEach(function (x) { line('M' + x + ',141 L' + x + ',218', 2.2, trailer); });
  thin('M330,205 L352,150'); thin('M490,205 L512,150');
  el('rect', { x: 128, y: 214, width: 18, height: 7, rx: 1.5, fill: 'var(--rig-steel)' }, trailer);
  el('rect', { x: 131, y: 204, width: 7, height: 8, rx: 1.5, fill: '#E35D4F' }, trailer);
  el('path', { d: 'M186,226 C192,210 230,210 236,222 C242,210 280,210 286,226', fill: 'none', stroke: 'var(--rig-steel)', 'stroke-width': 2 }, trailer);
  line('M644,222 L700,226', 3, trailer);
  el('circle', { cx: 700, cy: 226, r: 3.5, fill: 'var(--rig-steel)' }, trailer);

  // ── CAMIÃO (à frente): chassis, estrado inclinado, mastro e rack sobre a cabine ──
  var truck = el('g', {}, body);
  line('M694,226 L946,226', 3.2, truck);
  line('M806,98 L806,226', 3.2, truck);
  thin('M800,150 L812,112', truck);
  line('M944,94 L944,110', 2.4, truck);
  el('rect', { x: 744, y: 206, width: 50, height: 14, rx: 3, fill: 'var(--rig-steel-2)' }, truck);

  // plataformas sob cada lugar (alinhadas com o carro)
  Object.keys(SLOTS).forEach(function (k) {
    var s = SLOTS[k];
    var g = el('g', { transform: 'translate(' + s.x + ',' + (s.y - 51) + ') rotate(' + s.rot + ',70,51)' }, body);
    line('M-6,53 L146,53', 2.6, g);
  });

  // cabine avançada
  var cab = el('g', {}, body);
  el('path', { d: 'M812,114 L922,114 C932,114 938,120 939,131 L942,206 L942,226 L812,226 Z', fill: '#FFFFFF', stroke: 'var(--rig-steel)', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, cab);
  el('path', { d: 'M852,126 L922,126 C927,126 930,129 930,134 L932,166 L852,166 Z', fill: '#D3E4EF', stroke: 'var(--rig-steel-2)', 'stroke-width': 1.2 }, cab);
  el('line', { x1: 846, y1: 122, x2: 846, y2: 218, stroke: 'var(--rig-steel-2)', 'stroke-width': 1.2 }, cab);
  el('rect', { x: 852, y: 176, width: 12, height: 3, rx: 1.5, fill: 'var(--rig-steel-2)' }, cab);
  el('rect', { x: 812, y: 194, width: 130, height: 6, fill: 'var(--rig-brand)' }, cab);
  el('rect', { x: 934, y: 204, width: 9, height: 8, rx: 1.5, fill: '#F4C860' }, cab);
  el('rect', { x: 904, y: 220, width: 42, height: 8, rx: 2, fill: 'var(--rig-steel)' }, cab);
  el('path', { d: 'M940,138 L948,138 L948,160 L944,160', fill: 'none', stroke: 'var(--rig-steel)', 'stroke-width': 2 }, cab);
  el('rect', { x: 830, y: 206, width: 14, height: 3, rx: 1, fill: 'var(--rig-steel-2)' }, cab);

  // rodas
  [211, 261, 722, 892].forEach(function (cx) {
    var r = 20, cy = GROUND - r, g = el('g', { class: 'cv-rig__wheel' }, body);
    el('circle', { cx: cx, cy: cy, r: r, fill: '#1E252C' }, g);
    el('circle', { cx: cx, cy: cy, r: 12.5, fill: '#F3F5F6', stroke: '#C9D0D4', 'stroke-width': 1 }, g);
    el('circle', { cx: cx, cy: cy, r: 4.5, fill: '#8B969E' }, g);
    for (var k = 0; k < 6; k++) {
      var a = k * Math.PI / 3;
      el('circle', { cx: cx + Math.cos(a) * 8.5, cy: cy + Math.sin(a) * 8.5, r: 1.4, fill: '#8B969E' }, g);
    }
  });

  // ── Carros ────────────────────────────────────────────────────────────────
  var carLayer = el('g', {}, body);
  CARS.forEach(function (c) {
    var s = SLOTS[c.slot], hex = CLIENTS[c.client];
    var g = el('g', {
      class: 'cv-rig__car',
      style: '--c:' + hex + ';--c-line:' + darken(hex, 0.7) + ';--c-glass:' + darken(hex, 0.6) + ';--c-trim:' + darken(hex, 0.55),
      transform: 'translate(' + s.x + ',' + (s.y - 51) + ') rotate(' + s.rot + ',70,51)'
    }, carLayer);
    el('ellipse', { class: 'cv-rig__halo', cx: 70, cy: 26, rx: 80, ry: 30 }, g);
    el('path', { class: 'cv-rig__paint', d: BODY[c.type] }, g);
    el('path', { class: 'cv-rig__glass', d: GLASS[c.type] }, g);
    PILLARS[c.type].forEach(function (px) { el('line', { class: 'cv-rig__trim', x1: px, y1: 8, x2: px, y2: 39, 'stroke-width': 1 }, g); });
    el('line', { class: 'cv-rig__trim', x1: 14, y1: 27, x2: 132, y2: 27, 'stroke-width': 0.8, opacity: '.6' }, g);
    el('rect', { class: 'cv-rig__lamp', x: 134, y: 27, width: 6, height: 4, rx: 1.5 }, g);
    el('rect', { x: 4, y: 27, width: 4, height: 4, rx: 1, fill: '#E35D4F', opacity: '.7' }, g);
    [28, 112].forEach(function (wx) {
      el('circle', { cx: wx, cy: 40, r: 11, fill: '#1E252C' }, g);
      el('circle', { cx: wx, cy: 40, r: 6.5, fill: '#EEF1F2' }, g);
      el('circle', { cx: wx, cy: 40, r: 2.2, fill: '#8B969E' }, g);
    });
    var t = el('g', { class: 'cv-rig__tick', transform: 'translate(70,-10)' }, g);
    el('circle', { r: 9, fill: 'var(--rig-brand)' }, t);
    el('path', { d: 'M-4,0 L-1,3 L4,-3', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, t);
    var lab = el('text', { class: 'cv-rig__slot', x: 70, y: 35, 'text-anchor': 'middle' }, g);
    lab.textContent = c.slot;
    c.g = g;
    c.state = 'waiting';
  });
  host.appendChild(svg);

  var bySlot = {};
  CARS.forEach(function (c) { bySlot[c.slot] = c; });

  // ── Estado, contador e textos ─────────────────────────────────────────────
  var statusEl = root.querySelector('[data-rig-status]');
  var occEl = root.querySelector('[data-rig-occ]');
  var occBar = root.querySelector('[data-rig-occbar]');
  var toggle = root.querySelector('[data-rig-toggle]');
  function str(key, vars) {
    var n = root.querySelector('[data-rig-strs] [data-i18n="cv.rig.' + key + '"]');
    var s = n ? n.textContent : '';
    if (vars) for (var k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }
  var status = { key: 'static', vars: null };
  function setStatus(key, vars) {
    status = { key: key, vars: vars || null };
    if (statusEl) statusEl.textContent = str(key, vars);
  }
  function loadedCount() { return CARS.filter(function (c) { return c.state === 'loaded'; }).length; }
  function renderOcc() {
    var n = loadedCount();
    if (occEl) occEl.textContent = str('occ', { n: n, t: TOTAL });
    if (occBar) occBar.style.width = (n / TOTAL * 100) + '%';
    settle.style.transform = 'translateY(' + (n * 0.6).toFixed(1) + 'px)'; // o conjunto assenta com o peso
  }
  function paint(c) {
    c.g.classList.toggle('is-lit', c.state === 'loaded');
    c.g.classList.toggle('is-done', c.state === 'gone');
  }
  function all(state) { CARS.forEach(function (c) { c.state = state; paint(c); }); renderOcc(); }
  function flash(c) {
    c.g.classList.remove('is-flash');
    void c.g.getBBox(); // reinicia a animação do halo
    c.g.classList.add('is-flash');
  }
  function setMoving(on) { svg.classList.toggle('is-moving', on); }

  // ── O ciclo (passos com a sua duração em ms) ──────────────────────────────
  var STEPS = [];
  STEPS.push({ ms: 1400, run: function () { setMoving(false); all('waiting'); CARS.forEach(function (c) { c.g.classList.remove('is-flash'); }); setStatus('empty'); } });
  LOAD_ORDER.forEach(function (slot) {
    STEPS.push({ ms: 800, run: function () {
      var c = bySlot[slot]; c.state = 'loaded'; paint(c); flash(c); renderOcc();
      setStatus('load', { slot: slot });
    } });
  });
  STEPS.push({ ms: 3000, run: function () { setMoving(true); setStatus('route'); } });
  UNLOAD_ORDER.forEach(function (slot, idx) {
    STEPS.push({ ms: 700, run: function () {
      setMoving(false);
      var c = bySlot[slot]; c.state = 'gone'; paint(c); renderOcc();
      setStatus('unload', { slot: slot, n: idx + 1, t: TOTAL });
    } });
  });
  STEPS.push({ ms: 2200, run: function () { setStatus('done'); } });

  var reduceQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var step = 0, timer = null, visible = false, userPaused = false, reduced = false;

  function next() {
    STEPS[step].run();
    var ms = STEPS[step].ms;
    step = (step + 1) % STEPS.length;
    timer = setTimeout(next, ms);
  }
  function sync() {
    var go = !reduced && visible && !userPaused && !document.hidden;
    if (go && !timer) next();
    if (!go && timer) { clearTimeout(timer); timer = null; }
    svg.classList.toggle('is-paused', !go);
  }
  function showStatic() {
    if (timer) { clearTimeout(timer); timer = null; }
    setMoving(false);
    all('loaded');
    setStatus('static');
    step = 0;
  }
  function labelToggle() {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.setAttribute('aria-label', str(userPaused ? 'play' : 'pause'));
    toggle.classList.toggle('is-paused', userPaused);
  }
  function setReduced(on) {
    reduced = on;
    if (toggle) toggle.hidden = on;
    if (on) showStatic();
    sync();
  }

  if (toggle) toggle.addEventListener('click', function () { userPaused = !userPaused; labelToggle(); sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[entries.length - 1].isIntersecting;
      sync();
    }, { threshold: 0.15 }).observe(host);
  } else {
    visible = true;
  }
  if (reduceQ) {
    var onReduce = function () { setReduced(reduceQ.matches); };
    if (reduceQ.addEventListener) reduceQ.addEventListener('change', onReduce);
    else if (reduceQ.addListener) reduceQ.addListener(onReduce);
  }
  // Troca de língua: o i18n muda <html lang> e os spans escondidos; voltamos a escrever os textos.
  new MutationObserver(function () {
    if (statusEl) statusEl.textContent = str(status.key, status.vars);
    renderOcc();
    labelToggle();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // Até entrar no ecrã, mostra-se o camião carregado (é o que se vê também sem animação).
  showStatic();
  labelToggle();
  setReduced(!!(reduceQ && reduceQ.matches));
})();
