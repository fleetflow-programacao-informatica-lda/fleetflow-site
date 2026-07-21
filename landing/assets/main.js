/* FleetFlow landing — vanilla JS, zero dependencies.
   Cinematic intro (guided living avatar), sticky header, scroll reveals,
   living hero (particles + parallax), random Orbit avatars, eye tracking. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ============================================================
     Living hero — particles + ambient network (built once, cheap)
     ============================================================ */
  (function buildParticles() {
    var host = document.getElementById("heroParticles");
    if (!host || reduce) return;
    // pontos pequenos luminosos
    var N = 24;
    for (var i = 0; i < N; i++) {
      var s = document.createElement("span");
      var size = 2 + Math.round(Math.random() * 4);
      s.style.left = (Math.random() * 100).toFixed(2) + "%";
      s.style.top = (35 + Math.random() * 65).toFixed(2) + "%";
      s.style.width = s.style.height = size + "px";
      s.style.animationDuration = (8 + Math.random() * 10).toFixed(1) + "s";
      s.style.animationDelay = (-Math.random() * 14).toFixed(1) + "s";
      if (i % 5 === 0) { s.style.background = "var(--orange-bright)"; s.style.boxShadow = "0 0 8px var(--glow-orange)"; }
      host.appendChild(s);
    }
    // "bokeh" — pontos grandes desfocados para profundidade
    for (var b = 0; b < 6; b++) {
      var k = document.createElement("span");
      k.className = "bokeh";
      var bsize = 14 + Math.round(Math.random() * 22);
      k.style.left = (Math.random() * 100).toFixed(2) + "%";
      k.style.top = (30 + Math.random() * 70).toFixed(2) + "%";
      k.style.width = k.style.height = bsize + "px";
      k.style.background = (b % 3 === 0) ? "var(--orange-bright)" : "var(--blue-bright)";
      k.style.animationDuration = (16 + Math.random() * 12).toFixed(1) + "s";
      k.style.animationDelay = (-Math.random() * 20).toFixed(1) + "s";
      host.appendChild(k);
    }
  })();

  // constelação de fundo no hero — ligações a acender (twinkle fora de fase)
  (function buildHeroNet() {
    var net = document.getElementById("heroNet");
    if (!net || reduce) return;
    var W = 1200, H = 600, nodes = [];
    var count = 16;
    for (var i = 0; i < count; i++) {
      var a = i * 2.39996, r = 70 + (i / count) * 560;
      var x = Math.max(30, Math.min(W - 30, W / 2 + Math.cos(a) * r * 1.05));
      var y = Math.max(24, Math.min(H - 24, H / 2 + Math.sin(a) * r * 0.55));
      nodes.push({ x: x, y: y });
    }
    for (var j = 0; j < nodes.length; j++) {
      var best = [];
      for (var k2 = 0; k2 < nodes.length; k2++) {
        if (k2 === j) continue;
        best.push({ k: k2, d: Math.hypot(nodes[j].x - nodes[k2].x, nodes[j].y - nodes[k2].y) });
      }
      best.sort(function (p, q) { return p.d - q.d; });
      for (var m = 0; m < 2; m++) {
        if (j < best[m].k) {
          var b2 = nodes[best[m].k];
          var ln = document.createElementNS(SVGNS, "line");
          ln.setAttribute("x1", nodes[j].x.toFixed(0)); ln.setAttribute("y1", nodes[j].y.toFixed(0));
          ln.setAttribute("x2", b2.x.toFixed(0)); ln.setAttribute("y2", b2.y.toFixed(0));
          ln.setAttribute("class", "hnet-link");
          ln.style.animationDelay = (-(j * 0.7 + m * 1.3)).toFixed(1) + "s";
          net.appendChild(ln);
        }
      }
    }
    for (var n = 0; n < nodes.length; n++) {
      var c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", nodes[n].x.toFixed(0)); c.setAttribute("cy", nodes[n].y.toFixed(0));
      c.setAttribute("r", (n % 4 === 0 ? 3.4 : 2).toFixed(1));
      c.setAttribute("class", "hnet-node");
      if (n % 6 === 0) c.setAttribute("fill", "#fb923c");
      c.style.animationDelay = (-(n * 0.6)).toFixed(1) + "s";
      net.appendChild(c);
    }
  })();

  (function buildCineNetwork() {
    var net = document.getElementById("cineNet");
    if (!net) return;
    var W = 1200, H = 700, nodes = [];
    // deterministic-ish scatter using index-based pseudo positions (no Math.random dependency for layout stability)
    var count = 18;
    for (var i = 0; i < count; i++) {
      var a = i * 2.39996; // golden angle
      var r = 60 + (i / count) * 520;
      var x = W / 2 + Math.cos(a) * r * 1.05;
      var y = H / 2 + Math.sin(a) * r * 0.62;
      x = Math.max(40, Math.min(W - 40, x));
      y = Math.max(36, Math.min(H - 36, y));
      nodes.push({ x: x, y: y });
    }
    // links: connect each node to its nearest couple
    for (var j = 0; j < nodes.length; j++) {
      var best = [];
      for (var k = 0; k < nodes.length; k++) {
        if (k === j) continue;
        var d = Math.hypot(nodes[j].x - nodes[k].x, nodes[j].y - nodes[k].y);
        best.push({ k: k, d: d });
      }
      best.sort(function (p, q) { return p.d - q.d; });
      for (var m = 0; m < 2; m++) {
        if (j < best[m].k) {
          var b = nodes[best[m].k];
          var ln = document.createElementNS(SVGNS, "line");
          ln.setAttribute("x1", nodes[j].x.toFixed(0)); ln.setAttribute("y1", nodes[j].y.toFixed(0));
          ln.setAttribute("x2", b.x.toFixed(0)); ln.setAttribute("y2", b.y.toFixed(0));
          ln.setAttribute("class", "cnet-link");
          var len = Math.hypot(nodes[j].x - b.x, nodes[j].y - b.y);
          ln.style.strokeDasharray = len; ln.style.strokeDashoffset = len;
          ln.style.transitionDelay = (0.3 + (j / count) * 1.6).toFixed(2) + "s";
          net.appendChild(ln);
        }
      }
    }
    for (var n = 0; n < nodes.length; n++) {
      var c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", nodes[n].x.toFixed(0)); c.setAttribute("cy", nodes[n].y.toFixed(0));
      c.setAttribute("r", (n % 4 === 0 ? 4 : 2.4).toFixed(1));
      c.setAttribute("class", "cnet-node");
      c.style.transitionDelay = (0.4 + (n / count) * 1.6).toFixed(2) + "s";
      net.appendChild(c);
    }
  })();

  /* ============================================================
     Avatar eye control (scripted look + cursor blend)
     ============================================================ */
  var pupils = document.getElementById("cav-pupils");
  var sX = 0, sY = 0, cX = 0, cY = 0;
  function applyLook() {
    if (pupils) pupils.style.transform = "translate(" + (sX + cX).toFixed(1) + "px," + (sY + cY).toFixed(1) + "px)";
  }
  function look(x, y) { sX = x * 5; sY = y * 4; applyLook(); }

  /* ============================================================
     Cinematic intro orchestration
     ============================================================ */
  var cine = document.getElementById("cine");
  var cav = document.getElementById("cav");
  var flow = document.getElementById("cineFlow");
  var ended = false;

  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function typeLine(text) {
    return new Promise(function (res) {
      var el = document.getElementById("cineText");
      if (!el) return res();
      if (ended) { el.textContent = text; return res(); }
      el.textContent = "";
      var i = 0;
      (function step() {
        if (ended) { el.textContent = text; return res(); }
        el.textContent = text.slice(0, i);
        i++;
        if (i <= text.length) setTimeout(step, 34);
        else res();
      })();
    });
  }

  function endCine(instant) {
    if (ended) return;
    ended = true;
    document.body.style.overflow = "";
    if (!cine) return;
    if (instant) cine.style.transition = "none";
    cine.classList.add("is-ending");
    setTimeout(function () { if (cine && cine.parentNode) cine.parentNode.removeChild(cine); }, instant ? 60 : 1100);
  }

  function L(key) {
    var lang = window.FF_LANG || "pt";
    var dict = (window.FFI18n && window.FFI18n.dict) || {};
    return ((dict[lang] || {})[key]) || ((dict.pt || {})[key]) || "";
  }

  async function runCine() {
    document.body.style.overflow = "hidden";
    try { sessionStorage.setItem("ff_cine_seen", "1"); } catch (e) {}

    await delay(1000); if (ended) return;          // silêncio inicial
    cine.classList.add("spark-on");                // a luz azul
    await delay(1150); if (ended) return;

    cine.classList.add("avatar-on");               // o avatar entra a voar
    setTimeout(function () { cine.classList.add("net-on"); }, 500); // a rede começa a nascer
    await delay(1500); if (ended) return;

    // recebe o visitante: olha, sorri, olha os lados, acena
    look(0, 0);
    if (cav) { cav.classList.add("is-smiling"); cav.classList.add("is-waving"); }
    await delay(550); if (ended) return; look(-1, -0.2);
    await delay(550); if (ended) return; look(1, -0.2);
    await delay(550); if (ended) return; look(0, 0);
    if (cav) cav.classList.remove("is-waving");
    await delay(250); if (ended) return;

    // fala (letra a letra)
    cine.classList.add("bubble-on");
    await typeLine(L("cine.l1")); if (ended) return; await delay(650);
    await typeLine(L("cine.l2")); if (ended) return; await delay(750);
    await typeLine(L("cine.l3")); if (ended) return;

    // aponta para a rede e constrói o fluxo
    if (cav) cav.classList.add("is-pointing");
    look(0.3, 1);
    cine.classList.add("flow-on");
    if (flow) flow.classList.add("step1");
    await delay(750); if (ended) return;

    await typeLine(L("cine.l4")); if (ended) return;
    if (flow) flow.classList.add("step2");
    await delay(650); if (ended) return;

    await typeLine(L("cine.l5")); if (ended) return;
    if (flow) flow.classList.add("step3");
    await delay(750); if (ended) return;

    if (cav) cav.classList.remove("is-pointing");
    look(0, 0);
    await typeLine(L("cine.l6")); if (ended) return; await delay(750);

    // fala do planeador diário
    await typeLine(L("cine.l7")); if (ended) return; await delay(950);

    // o avatar afasta-se; o logo aparece em grande
    cine.classList.add("aside");
    await delay(550); if (ended) return;
    cine.classList.add("logo-on");
    await delay(950); if (ended) return;

    // olha para o logo, depois para o utilizador, sorri
    look(0.7, -0.7);
    await delay(950); if (ended) return;
    look(0, 0.05);
    await delay(850); if (ended) return;

    endCine(false);
  }

  if (cine) {
    var seen = false;
    try { seen = !!sessionStorage.getItem("ff_cine_seen"); } catch (e) {}
    if (reduce || seen) {
      endCine(true);
    } else {
      var skip = document.getElementById("cineSkip");
      if (skip) skip.addEventListener("click", function () { endCine(false); });
      cine.addEventListener("click", function (e) {
        if (e.target === cine || e.target.classList.contains("cine__sky")) endCine(false);
      });
      runCine();
    }
  }

  /* ============================================================
     Sticky header
     ============================================================ */
  var header = document.getElementById("header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     Scroll reveal
     ============================================================ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ============================================================
     Random Orbit avatars (peek behind cards)
     ============================================================ */
  var avatars = ["av-astronauta", "av-radar", "av-minimal"];
  var slots = Array.prototype.slice.call(document.querySelectorAll("[data-peek-slot]"));
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var peeks = [];
  if (slots.length) {
    var count = 1 + Math.round(Math.random());
    var chosenSlots = shuffle(slots.slice()).slice(0, Math.min(count, slots.length));
    var pool = shuffle(avatars.slice());
    chosenSlots.forEach(function (slot, idx) {
      var id = pool[idx % pool.length];
      var svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("class", "peek peek--float");
      var use = document.createElementNS(SVGNS, "use");
      use.setAttribute("href", "#" + id);
      svg.appendChild(use);
      svg.style.cssText = slot.getAttribute("data-peek-style") || "";
      slot.appendChild(svg);
      setTimeout(function () { svg.classList.add("is-in"); }, 400 + idx * 220);
      peeks.push(svg);
    });
  }

  /* ============================================================
     Cursor influence — avatar eyes + peek parallax + netcard depth
     ============================================================ */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    var netcard = document.querySelector(".netcard");
    var heroNet = document.getElementById("heroNet");
    var raf = null, mx = 0, my = 0;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      cX = mx * 4; cY = my * 3; applyLook();
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    function apply() {
      raf = null;
      peeks.forEach(function (p) { p.style.transform = "translate(" + (mx * 10).toFixed(1) + "px," + (my * 10).toFixed(1) + "px)"; });
      if (netcard) netcard.style.transform = "perspective(900px) rotateY(" + (mx * 4).toFixed(2) + "deg) rotateX(" + (-my * 4).toFixed(2) + "deg)";
      if (heroNet) heroNet.style.transform = "translate(" + (mx * -18).toFixed(1) + "px," + (my * -12).toFixed(1) + "px)";
    }
  }

  /* ============================================================
     Footer year
     ============================================================ */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
