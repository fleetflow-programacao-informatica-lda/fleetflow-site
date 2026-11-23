// Órbitas de quadrados (23/11): 16 quadrados que rodam aos impulsos, com um pequeno ressalto (Pulse Orbit da
// HorizonX, licença Pro: o motor é o deles, adaptado; os quadrados são nossos — só tipografia, nomes em texto e
// nunca logótipos de terceiros). Um só motor, duas órbitas: "O que faz a FleetFlow" (#modulos, os módulos) e
// "Ligações" (#ligacoes, os programas a que nos ligamos). Arrastar para os lados roda; tocar pausa ou retoma;
// Enter/Espaço pausa e as setas esquerda/direita avançam um quadrado.
// Convive com o resto da página: a roda do rato na vertical continua a ser do js/snap.js (só o deslizar na
// horizontal roda a órbita), no telemóvel o gesto vertical continua a fazer scroll (touch-action: pan-y), cada
// órbita só anima com a sua secção à vista, e com "reduzir movimento" fica parada até a pessoa a arrastar.
(() => {
  'use strict';

  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lang = () => {
    const l = (html.lang || 'pt').slice(0, 2);
    return l === 'en' || l === 'es' ? l : 'pt';
  };

  // ---------- Desenho dos quadrados ----------
  // Vermelho, branco, tinta e marfim, com o verde da FleetFlow em pormenores.
  const RED = '#d6322b';
  const WHITE = '#ffffff';
  const INK = '#121413';
  const IVORY = '#f2ede3';
  const GREEN = '#31e0a0';
  const FONT = "Geist, ui-sans-serif, system-ui, 'Segoe UI', Arial, sans-serif";

  // Uma palavra grande: o tamanho sai do número de letras para encher a largura; se for mais estreita do que o
  // quadrado, fica com a sua largura natural (nunca esticada).
  function word(text, y, fill, { max = 64, width = 162, weight = 800, x = 16, outline = false } = {}) {
    const size = Math.min(max, width / (text.length * 0.66));
    const natural = text.length * 0.66 * size;
    const fit = natural > width * 0.9 ? ` textLength="${width}" lengthAdjust="spacingAndGlyphs"` : '';
    const paint = outline ? `fill="none" stroke="${fill}" stroke-width="1.6"` : `fill="${fill}"`;
    return `<text x="${x}" y="${y}" font-size="${size.toFixed(1)}" font-weight="${weight}" letter-spacing="-0.02em" ${paint}${fit}>${text}</text>`;
  }
  const label = (text, fill, { x = 16, y = 30, anchor = 'start', opacity = 1 } = {}) =>
    `<text x="${x}" y="${y}" font-size="10.5" font-weight="600" letter-spacing="0.16em" text-anchor="${anchor}" fill="${fill}" fill-opacity="${opacity}">${text.toUpperCase()}</text>`;
  // Fundo; nos claros, um fio para o quadrado não se perder num fundo claro.
  const tile = (bg, body) => {
    const light = bg === WHITE || bg === IVORY;
    const edge = light ? '<rect x="1.5" y="1.5" width="191" height="191" rx="5" fill="none" stroke="#121413" stroke-opacity="0.1"/>' : '';
    return `<svg viewBox="0 0 194 194" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}"><rect width="194" height="194" fill="${bg}"/>${edge}${body}</svg>`;
  };
  // Peças repetidas nas duas órbitas.
  const flow = () => tile(WHITE, word('FLOW', 66, RED, { max: 60 }) + word('FLOW', 122, RED, { max: 60, outline: true }) + word('FLOW', 178, RED, { max: 60 }));
  const mark = () =>
    tile(
      INK,
      `<g transform="translate(18 34) scale(4.6)" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l5 5-5 5M10 9l5 5-5 5" stroke="${WHITE}"/><path d="M17 9l5 5-5 5" stroke="${GREEN}"/></g>`,
    );
  const orbitTile = () =>
    tile(WHITE, `<g transform="translate(97 74)"><ellipse rx="54" ry="20" transform="rotate(-24)" fill="none" stroke="${INK}" stroke-width="1.6"/><circle r="13" fill="${GREEN}"/></g>` + word('ORBIT', 178, INK, { max: 44 }));
  const plannerBars = `<g stroke="${INK}" stroke-opacity="0.18" stroke-width="1"><path d="M16 34h162M16 58h162M16 82h162M16 106h162"/></g><g fill="${RED}"><rect x="16" y="40" width="92" height="12" rx="2"/><rect x="58" y="64" width="104" height="12" rx="2"/><rect x="30" y="88" width="58" height="12" rx="2"/><rect x="98" y="88" width="64" height="12" rx="2" fill-opacity="0.35"/></g>`;

  // ---------- "Ligações": nomes dos programas (em texto) e o que ligamos ----------
  const LIG = {
    pt: { inv: 'Faturação', pay: 'Pagamentos', invoicing: 'FATURAÇÃO', planner: 'PLANEADOR', workshop: 'OFICINA', exchange: ['BOLSA', 'DE CARGAS'] },
    en: { inv: 'Invoicing', pay: 'Payments', invoicing: 'INVOICING', planner: 'PLANNER', workshop: 'WORKSHOP', exchange: ['LOAD', 'EXCHANGE'] },
    es: { inv: 'Facturación', pay: 'Pagos', invoicing: 'FACTURACIÓN', planner: 'PLANIFICADOR', workshop: 'TALLER', exchange: ['BOLSA', 'DE CARGAS'] },
  };
  function ligacoesTiles(l) {
    const w = LIG[l];
    return [
      tile(RED, label('GPS', WHITE, { opacity: 0.85 }) + word('CARTRACK', 176, WHITE)),
      flow(),
      tile(INK, `<circle cx="172" cy="24" r="6" fill="${GREEN}"/>` + word('GPS', 170, IVORY, { max: 86, weight: 800 })),
      tile(IVORY, label(w.inv, RED) + word('MOLONI', 176, INK)),
      tile(RED, '<path d="M16 22h28" stroke="#fff" stroke-width="2"/>' + `<text x="16" y="176" font-size="19" font-weight="700" fill="${WHITE}">e-CMR</text>`),
      orbitTile(),
      tile(INK, label('GPS', IVORY, { opacity: 0.7 }) + word('FROTCOM', 176, RED)),
      tile(IVORY, plannerBars + word(w.planner, 170, INK, { max: 30 })),
      tile(RED, label(w.inv, WHITE, { opacity: 0.85 }) + word('INVOICE', 128, WHITE) + word('XPRESS', 176, WHITE)),
      tile(WHITE, `<rect x="166" y="16" width="12" height="12" fill="${RED}"/>` + `<text x="16" y="176" font-size="17" font-weight="700" letter-spacing="0.06em" fill="${RED}">${w.invoicing}</text>`),
      mark(),
      tile(RED, label('FleetFlow', WHITE, { opacity: 0.85 }) + word(w.workshop, 176, INK)),
      tile(IVORY, label(w.pay, INK, { opacity: 0.6 }) + word('STRIPE', 176, INK)),
      tile(WHITE, label('GPS', RED) + word('WEBFLEET', 176, RED)),
      tile(INK, word(w.exchange[0], 120, IVORY, { max: 54 }) + word(w.exchange[1], 170, GREEN, { max: 34 })),
      tile(RED, label(w.inv, WHITE, { opacity: 0.85 }) + word('PHC', 128, WHITE, { max: 74 }) + word('GO', 178, WHITE, { max: 56, outline: true })),
    ];
  }

  // ---------- "O que faz a FleetFlow": os módulos ----------
  const MOD = {
    pt: {
      planner: 'PLANEADOR', week: 'SEMANA', loads: 'CARGAS', app: 'App', driver: 'MOTORISTA', manager: 'GESTOR',
      exchange: ['BOLSA', 'DE CARGAS'], workshop: 'OFICINA', stock: 'STOCK', parts: 'Peças', invoicing: 'FATURAÇÃO', draft: 'Rascunho',
      prices: 'PREÇOS', from: 'Desde 150 € + IVA', public: 'Públicos', zones: ['NACIONAL', 'IBÉRICO', 'INTERNACIONAL'], plan: 'Plano', day: 'Dia',
    },
    en: {
      planner: 'PLANNER', week: 'WEEK', loads: 'LOADS', app: 'App', driver: 'DRIVER', manager: 'MANAGER',
      exchange: ['LOAD', 'EXCHANGE'], workshop: 'WORKSHOP', stock: 'STOCK', parts: 'Parts', invoicing: 'INVOICING', draft: 'Draft',
      prices: 'PRICES', from: 'From €150 + VAT', public: 'Public', zones: ['NATIONAL', 'IBERIAN', 'INTERNATIONAL'], plan: 'Plan', day: 'Day',
    },
    es: {
      planner: 'PLANIFICADOR', week: 'SEMANA', loads: 'CARGAS', app: 'App', driver: 'CONDUCTOR', manager: 'GESTOR',
      exchange: ['BOLSA', 'DE CARGAS'], workshop: 'TALLER', stock: 'STOCK', parts: 'Piezas', invoicing: 'FACTURACIÓN', draft: 'Borrador',
      prices: 'PRECIOS', from: 'Desde 150 € + IVA', public: 'Públicos', zones: ['NACIONAL', 'IBÉRICO', 'INTERNACIONAL'], plan: 'Plan', day: 'Día',
    },
  };
  const phone = (stroke) =>
    `<g fill="none" stroke="${stroke}" stroke-width="2"><rect x="134" y="20" width="40" height="70" rx="8"/><path d="M148 80h12"/></g>`;
  function modulosTiles(l) {
    const w = MOD[l];
    return [
      tile(IVORY, plannerBars + word(w.planner, 170, RED, { max: 30 })),
      tile(RED, label(w.plan, WHITE, { opacity: 0.85 }) + word(w.week, 112, WHITE, { max: 44 }) + word('N → S', 172, WHITE, { max: 52, outline: true })),
      tile(INK, `<circle cx="172" cy="24" r="6" fill="${GREEN}"/>` + word(w.loads, 170, IVORY, { max: 46 })),
      tile(WHITE, label('CMR', RED) + word('e-CMR', 172, RED, { max: 52 })),
      tile(RED, phone(WHITE) + label(w.app, WHITE, { opacity: 0.85 }) + word(w.driver, 176, WHITE, { max: 34 })),
      tile(IVORY, phone(INK) + label(w.app, INK, { opacity: 0.6 }) + word(w.manager, 176, INK, { max: 40 })),
      tile(INK, word(w.exchange[0], 120, IVORY, { max: 54 }) + word(w.exchange[1], 170, GREEN, { max: 34 })),
      tile(RED, label('FleetFlow', WHITE, { opacity: 0.85 }) + word(w.workshop, 176, INK)),
      tile(
        WHITE,
        label(w.parts, INK, { opacity: 0.6 }) +
          `<g fill="${INK}" fill-opacity="0.85"><rect x="16" y="104" width="10" height="28"/><rect x="32" y="92" width="10" height="40"/><rect x="48" y="112" width="10" height="20"/><rect x="64" y="84" width="10" height="48" fill="${RED}" fill-opacity="1"/><rect x="80" y="98" width="10" height="34"/></g>` +
          word(w.stock, 176, INK, { max: 46 }),
      ),
      orbitTile(),
      tile(INK, label(w.draft, IVORY, { opacity: 0.7 }) + word(w.invoicing, 176, RED, { max: 34 })),
      tile(RED, label(w.public, WHITE, { opacity: 0.85 }) + word(w.prices, 128, WHITE, { max: 46 }) + `<text x="16" y="172" font-size="14" font-weight="600" fill="${WHITE}">${w.from}</text>`),
      tile(
        IVORY,
        word(w.zones[0], 100, INK, { max: 30, weight: 500 }) + word(w.zones[1], 136, RED, { max: 30, weight: 800 }) + word(w.zones[2], 172, INK, { max: 30, weight: 500 }),
      ),
      mark(),
      flow(),
      tile(RED, `<rect x="16" y="16" width="12" height="12" fill="${WHITE}"/>` + `<text x="16" y="176" font-size="15" font-weight="700" letter-spacing="0.04em" fill="${WHITE}">FleetFlow</text>`),
    ];
  }

  // ---------- O motor (HorizonX Pulse Orbit, adaptado) ----------
  const SCENE = 840; // quadrado da cena; o centro da órbita fica no meio
  const RADIUS = 307;
  const CARD = 194;

  function init(root, tilesFn, { interval = 1.25, hold = 0.34, bounce = 1.2, direction = 1 } = {}) {
    if (!root) return;
    const scene = root.querySelector('.po-scene');
    const orbit = root.querySelector('.po-orbit');

    function pulsePhase(seconds, count) {
      const beat = Math.max(0, seconds) / interval;
      const fraction = beat - Math.floor(beat);
      const t = Math.max(0, (fraction - hold) / (1 - hold));
      const eased = 1 + (bounce + 1) * (t - 1) ** 3 + bounce * (t - 1) ** 2;
      return 0.0255 + ((Math.floor(beat) + eased) * Math.PI * 2) / count;
    }

    function cardPose(index, count, phase) {
      const angle = (index * Math.PI * 2) / count + phase;
      const distance = Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle)));
      const size = Math.max(8, CARD * (1 - distance / Math.PI));
      return { x: SCENE / 2 + Math.cos(angle) * RADIUS - size / 2, y: SCENE / 2 + Math.sin(angle) * RADIUS - size / 2, size };
    }

    let cards = [];
    let builtFor = '';
    let elapsed = 0;
    let offset = 0;
    let scale = 1;
    let last = null;
    let raf = 0;
    let drag = null;
    let playing = !reduce.matches;
    let visible = false; // só anima à vista (IntersectionObserver abaixo)

    const phase = () => direction * pulsePhase(elapsed, cards.length || 16) + offset;

    function paint() {
      const p = phase();
      cards.forEach((card, i) => {
        const pose = cardPose(i, cards.length, p);
        card.style.transform = `translate3d(${pose.x.toFixed(2)}px,${pose.y.toFixed(2)}px,0) scale(${(pose.size / CARD).toFixed(4)})`;
        card.style.zIndex = String(Math.round(pose.size * 10));
      });
    }

    // Os nomes por extenso seguem a língua da página (o i18n muda o <html lang>).
    function build() {
      const l = lang();
      if (l === builtFor) return;
      builtFor = l;
      orbit.innerHTML = tilesFn(l)
        .map((svg) => `<div class="po-card">${svg}</div>`)
        .join('');
      cards = [...orbit.children];
      paint();
    }

    function fit() {
      const w = root.clientWidth;
      const h = root.clientHeight;
      // Room for the corner texts above and below the ring.
      scale = Math.max(0.01, Math.min(w - 24, h - 72) / SCENE);
      scene.style.transform = `translate(${(w - SCENE * scale) / 2}px,${(h - SCENE * scale) / 2}px) scale(${scale})`;
      paint();
    }

    function schedule() {
      if (!raf && playing && visible && !document.hidden) raf = requestAnimationFrame(tick);
    }

    function tick(now) {
      raf = 0;
      if (last !== null && playing && !drag) elapsed += Math.min((now - last) / 1000, 0.1);
      last = now;
      paint();
      schedule();
    }

    function setPlaying(value) {
      playing = value;
      last = null;
      if (!playing) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      root.dataset.playing = String(playing);
      schedule();
    }

    // Rato: os dois eixos rodam (como no original). Toque: só o horizontal, o vertical fica para o scroll da página.
    function down(event) {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, offset, moved: false, touch: event.pointerType !== 'mouse' };
    }

    function move(event) {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 6) {
        drag.moved = true;
        try {
          root.setPointerCapture(event.pointerId);
        } catch (e) {
          /* the pointer may already be gone */
        }
        root.dataset.dragging = '';
      }
      if (drag.moved) {
        offset = drag.offset + ((drag.touch ? 0 : dy) - dx) / (RADIUS * scale);
        paint();
      }
    }

    function up(event) {
      if (!drag || drag.id !== event.pointerId) return;
      const tapped = event.type === 'pointerup' && !drag.moved;
      drag = null;
      last = null;
      delete root.dataset.dragging;
      if (tapped) setPlaying(!playing);
    }

    // Só o deslizar horizontal (trackpad, Shift + roda) roda a órbita; o vertical segue para o js/snap.js.
    function wheel(event) {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? root.clientWidth : 1;
      offset += (event.deltaX * units) / (RADIUS * scale);
      paint();
    }

    function key(event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        offset += ((event.key === 'ArrowRight' ? 1 : -1) * Math.PI * 2) / cards.length;
        paint();
      } else if ((event.code === 'Space' || event.key === 'Enter') && !event.repeat) {
        event.preventDefault();
        setPlaying(!playing);
      }
    }

    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', move);
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) root.addEventListener(type, up);
    root.addEventListener('wheel', wheel, { passive: false });
    root.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', () => {
      last = null;
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else schedule();
    });
    reduce.addEventListener('change', () => setPlaying(!reduce.matches));
    new ResizeObserver(fit).observe(root);
    new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        last = null;
        if (!visible) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else schedule();
      },
      { rootMargin: '80px 0px' },
    ).observe(root);
    new MutationObserver(build).observe(html, { attributes: true, attributeFilter: ['lang'] });

    build();
    fit();
    setPlaying(playing);
  }

  init(document.querySelector('#modulos .lo-orbit .po-root'), modulosTiles, { direction: -1 });
  init(document.querySelector('#ligacoes .lo-orbit .po-root'), ligacoesTiles);
})();
