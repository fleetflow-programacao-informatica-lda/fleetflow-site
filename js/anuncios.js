// "Novidades" (26/11, founder: "quero estes títulos com estes efeitos, assim parece tudo ligado — a aparecer em cada
// tela a anunciar"). Dois cartões grandes com fotografia que anunciam as secções seguintes (Transporte de veículos e
// Orbit Business). O tratamento é o do Scroll Stack da HorizonX — pilha, o de trás encolhe, desfoca e escurece — mas
// guiado pelo scroll da própria página (a cena fica presa enquanto se passa de um cartão ao outro; js/snap.js pára
// em cada um por data-snap="2"). Não rouba a roda do rato. Com "reduzir movimento", os cartões ficam um por baixo
// do outro, parados.
(() => {
  'use strict';

  const sec = document.querySelector('.stk');
  if (!sec) return;
  const cards = [...sec.querySelectorAll('.stk__card')];
  const bar = sec.querySelector('.stk__progress i');
  if (cards.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sec.classList.add('stk--static');
    return;
  }

  // Os mesmos valores do Scroll Stack por omissão (escala, desfoque, escurecer, espreitar, suavidade).
  const SCALE_STEP = 0.07;
  const BLUR = 4;
  const DIM = 0.28;
  const PEEK = 26;
  const SMOOTH = 0.16;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let target = { p: 0, e: 0 };
  let cur = { p: 0, e: 0 };
  let raf = 0;

  function measure() {
    const r = sec.getBoundingClientRect();
    const vh = window.innerHeight;
    const range = Math.max(1, r.height - vh);
    target = {
      p: clamp(-r.top / range, 0, 1), // 0 = primeiro cartão à frente, 1 = o segundo por cima
      e: clamp((vh - r.top) / vh, 0, 1), // 0 → 1 enquanto a cena entra no ecrã
    };
  }

  function apply() {
    const { p, e } = cur;
    const stage = cards[0].parentElement.clientHeight;
    // Cartão 1: entra a ganhar nitidez; quando o 2 sobe, encolhe, sobe um pouco (espreita), desfoca e escurece.
    const s0 = (0.94 + 0.06 * e) * (1 - SCALE_STEP * p);
    const b0 = BLUR * (1 - e) + BLUR * p;
    cards[0].style.transform = `translate3d(0,${(-PEEK * p).toFixed(1)}px,0) scale(${s0.toFixed(4)})`;
    cards[0].style.filter = b0 > 0.05 ? `blur(${b0.toFixed(2)}px)` : 'none';
    cards[0].style.setProperty('--dim', (DIM * p).toFixed(3));
    // Cartão 2: sobe de baixo até ficar à frente.
    const ty = (1 - p) * stage * 0.92;
    cards[1].style.transform = `translate3d(0,${ty.toFixed(1)}px,0)`;
    cards[1].style.filter = p < 0.98 ? `blur(${(BLUR * (1 - p) * 0.5).toFixed(2)}px)` : 'none';
    if (bar) bar.style.transform = `scaleX(${(0.5 + 0.5 * p).toFixed(3)})`;
    cards.forEach((c, i) => {
      const front = i === 0 ? p < 0.5 : p >= 0.5;
      c.setAttribute('tabindex', front ? '0' : '-1');
      // Os pontos acendem um de cada vez só no cartão da frente (veiculos.css, .is-front).
      c.classList.toggle('is-front', front && e > 0.6);
    });
  }

  function tick() {
    cur.p += (target.p - cur.p) * SMOOTH;
    cur.e += (target.e - cur.e) * SMOOTH;
    apply();
    if (Math.abs(target.p - cur.p) > 0.0005 || Math.abs(target.e - cur.e) > 0.0005) raf = requestAnimationFrame(tick);
    else {
      cur = { ...target };
      apply();
      raf = 0;
    }
  }

  function onScroll() {
    measure();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  measure();
  cur = { ...target };
  apply();
})();
