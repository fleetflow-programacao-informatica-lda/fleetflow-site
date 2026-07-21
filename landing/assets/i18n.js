/* FleetFlow landing — i18n PT / EN / ES (vanilla, sem dependências).
   Traduz todos os [data-i18n], o <title>, a meta description e <html lang>.
   Idioma: localStorage > idioma do browser > PT. */

(function () {
  "use strict";

  var DICT = {
    pt: {
      "meta.title": "FleetFlow — We Are Connected · Operação logística ligada",
      "meta.desc": "A FleetFlow transforma pedidos de transporte recebidos por email, telefone ou WhatsApp em operações reais. Cargas deixam de ficar perdidas. A operação fica ligada.",

      "nav.problem": "O problema",
      "nav.destinos": "Os 3 destinos",
      "nav.como": "Como funciona",
      "nav.orbit": "Orbit",
      "nav.bolsa": "Bolsa de Cargas",
      "nav.entrar": "Entrar",

      "intro.l1": "Existem cargas que ficam <span>paradas</span>.",
      "intro.l2": "Não por falta de camiões.",
      "intro.l3": "Mas por falta de <span>ligação</span>.",
      "intro.skip": "Saltar intro",
      "cine.l1": "Olá 👋",
      "cine.l2": "Posso mostrar-lhe uma coisa?",
      "cine.l3": "Todos os dias existem cargas que nunca chegam a ser feitas.",
      "cine.l4": "Não porque faltem camiões.",
      "cine.l5": "Mas porque ninguém sabe que elas existem a tempo.",
      "cine.l6": "Nós resolvemos isso.",
      "cine.l7": "E todos os dias, planeamos o seu serviço — camião a camião.",
      "cine.ia": "IA",
      "cine.skip": "Saltar introdução",

      "hero.title": "Cargas deixam de ficar perdidas.<br /><span class=\"grad\">A operação fica ligada.</span>",
      "hero.sub": "A FleetFlow transforma pedidos de transporte recebidos por <strong>email, telefone ou WhatsApp</strong> em operações prontas a executar — ligando grupos, transportistas e motoristas numa única rede.",
      "hero.cta1": "Entrar / Registar",
      "hero.cta2": "Ver Bolsa de Cargas",
      "hero.cta3": "Pedir Demonstração",
      "hero.trust1": "Email → IA → Operação",
      "hero.trust2": "Frota · Grupo · Pública",
      "hero.trust3": "Sem cargas perdidas",

      "netcard.label": "rede operacional",
      "netcard.ia": "IA + Revisão",
      "netcard.pedido": "pedido",
      "netcard.casa": "Frota própria",
      "netcard.grupo": "Grupo",
      "netcard.publica": "Pública",

      "prob.eyebrow": "O problema",
      "prob.quote": "Todos os dias existem cargas que <span class=\"orange\">não são feitas</span>. <span class=\"dim\">Não porque faltem camiões.</span> Mas porque <span class=\"blue\">ninguém sabe que elas existem a tempo</span>.",
      "prob.s1num": "Email <span class=\"u\">·</span> Tel <span class=\"u\">·</span> WhatsApp",
      "prob.s1label": "Os pedidos chegam dispersos por mil canais — e perdem-se entre eles.",
      "prob.s2num": "Horas <span class=\"u\">→</span> Minutos",
      "prob.s2label": "O tempo entre receber um pedido e ter um camião atribuído é onde a margem desaparece.",
      "prob.s3num": "1 <span class=\"u\">rede</span>",
      "prob.s3label": "Grupos, transportistas e motoristas a trabalhar como uma só operação ligada.",

      "dest.eyebrow": "O modelo",
      "dest.h": "Os 3 destinos da carga",
      "dest.lead": "Cada pedido que entra tem sempre um caminho claro. A FleetFlow decide — com revisão humana — para onde a carga deve ir.",
      "dest.n1": "Destino 01", "dest.t1": "Frota própria",
      "dest.d1": "A carga vai para a sua frota própria. Controlo total, dentro da sua operação.",
      "dest.tag1": "Controlo total",
      "dest.n2": "Destino 02", "dest.t2": "Bolsa do Grupo",
      "dest.d2": "A carga vai para os transportistas ligados ao grupo. Confiança e rede já estabelecida.",
      "dest.tag2": "Transportistas do grupo",
      "dest.n3": "Destino 03", "dest.t3": "Bolsa Pública",
      "dest.d3": "A carga fica disponível para uma rede mais ampla. Alcance máximo, nada fica parado.",
      "dest.tag3": "Rede aberta",

      "como.eyebrow": "Como funciona",
      "como.h": "Do pedido à estrada, sem fricção",
      "como.lead": "Um fluxo simples, com a IA a fazer o trabalho pesado e o humano sempre no controlo.",
      "step1.t": "Email", "step1.d": "Pedido chega por email, telefone ou WhatsApp.",
      "step2.t": "IA", "step2.d": "A FleetFlow lê, estrutura e propõe a carga.",
      "step3.t": "Revisão", "step3.d": "O humano confirma e ajusta antes de avançar.",
      "step4.t": "Frota / Grupo / Público", "step4.d": "A carga segue para o destino certo.",
      "step5.t": "Motorista", "step5.d": "Motorista ou transportista executa.",

      "aud.g.kicker": "Para grupos",
      "aud.g.t": "A sua rede, finalmente ligada",
      "aud.g.d": "Distribua cargas pela frota própria e pelos transportistas do grupo a partir de um único ponto de comando.",
      "aud.g.i1": "Casa, Grupo e Bolsa Pública a partir do mesmo pedido",
      "aud.g.i2": "Revisão humana antes de cada decisão",
      "aud.g.i3": "Visibilidade total: nada fica esquecido",
      "aud.t.kicker": "Para transportistas",
      "aud.t.t": "Mais cargas, menos telefonemas",
      "aud.t.d": "Aceda às cargas do grupo e da bolsa pública. Veja, aceite e execute — sem andar a perseguir oportunidades.",
      "aud.t.i1": "Cargas reais, no momento certo",
      "aud.t.i2": "Acesso conforme o seu perfil",
      "aud.t.i3": "Ligação direta a quem precisa de transporte",

      "orbit.eyebrow": "Orbit",
      "orbit.h": "A inteligência que mantém tudo ligado",
      "orbit.lead": "O Orbit é o copiloto operacional da FleetFlow. Lê os pedidos, sugere o destino da carga e aprende com a sua operação — sempre como apoio, nunca a substituir a sua decisão.",
      "orbit.cta": "Conhecer o Orbit",

      "plat.eyebrow": "Entrar na plataforma",
      "plat.t": "Já faz parte da rede FleetFlow?",
      "plat.d": "Continue o seu trabalho na plataforma operacional — onde a operação realmente acontece.",
      "plat.cta1": "Entrar na Plataforma",
      "plat.cta2": "Bolsa de Cargas Pública",
      "plat.cta3": "Pedir Demonstração",
      "plat.one.d": "É marketing. Conta a história, mostra as vantagens, explica. Onde nos conhece.",
      "plat.app.d": "É o produto. Nada de marketing — só operação. Onde se trabalha.",

      "ops.eyebrow": "Operação diária",
      "ops.h": "E todos os dias, planeamos o seu serviço",
      "ops.lead": "Não é só distribuir cargas. A FleetFlow gere a operação diária das empresas de transporte — encaixa cargas nos camiões, deteta conflitos e sugere o melhor plano com IA.",
      "ops.b1": "Encaixe de cargas por camião e por slot",
      "ops.b2": "Sugestões de IA com nível de confiança",
      "ops.b3": "Conflitos e tempos de condução detetados",
      "ops.b4": "Slots livres e retornos sempre à vista",
      "ops.board": "planeamento diário",
      "ops.camioes": "Camiões",
      "ops.encaixadas": "Encaixadas",
      "ops.slots": "Slots livres",
      "ops.conflitos": "Conflitos",
      "ops.livre": "Livre",
      "ops.ai": "Sugerido pela IA",

      "foot.copy": "FleetFlow. Cargas deixam de ficar perdidas. A operação fica ligada.",
      "foot.sep": "fleetflow.one — comercial · app.fleetflow.systems — operacional",
      "foot.contacto": "Contacto"
    },

    en: {
      "meta.title": "FleetFlow — We Are Connected · Your logistics, finally connected",
      "meta.desc": "FleetFlow turns transport requests received by email, phone or WhatsApp into real operations. Loads stop getting lost. The operation stays connected.",

      "nav.problem": "The problem",
      "nav.destinos": "The 3 destinations",
      "nav.como": "How it works",
      "nav.orbit": "Orbit",
      "nav.bolsa": "Load Exchange",
      "nav.entrar": "Sign in",

      "intro.l1": "There are loads that sit <span>still</span>.",
      "intro.l2": "Not for lack of trucks.",
      "intro.l3": "But for lack of <span>connection</span>.",
      "intro.skip": "Skip intro",
      "cine.l1": "Hello 👋",
      "cine.l2": "May I show you something?",
      "cine.l3": "Every day there are loads that never get done.",
      "cine.l4": "Not because trucks are missing.",
      "cine.l5": "But because no one knows they exist in time.",
      "cine.l6": "We fix that.",
      "cine.l7": "And every day, we plan your service — truck by truck.",
      "cine.ia": "AI",
      "cine.skip": "Skip intro",

      "hero.title": "Loads stop getting lost.<br /><span class=\"grad\">The operation stays connected.</span>",
      "hero.sub": "FleetFlow turns transport requests received by <strong>email, phone or WhatsApp</strong> into ready-to-run operations — connecting groups, carriers and drivers in a single network.",
      "hero.cta1": "Sign in / Register",
      "hero.cta2": "View Load Exchange",
      "hero.cta3": "Request a Demo",
      "hero.trust1": "Email → AI → Operation",
      "hero.trust2": "Own fleet · Group · Public",
      "hero.trust3": "No lost loads",

      "netcard.label": "operational network",
      "netcard.ia": "AI + Review",
      "netcard.pedido": "request",
      "netcard.casa": "Own fleet",
      "netcard.grupo": "Group",
      "netcard.publica": "Public",

      "prob.eyebrow": "The problem",
      "prob.quote": "Every day there are loads that <span class=\"orange\">never get moved</span>. <span class=\"dim\">Not because trucks are missing.</span> But because <span class=\"blue\">no one knows they exist in time</span>.",
      "prob.s1num": "Email <span class=\"u\">·</span> Phone <span class=\"u\">·</span> WhatsApp",
      "prob.s1label": "Requests arrive scattered across a thousand channels — and get lost between them.",
      "prob.s2num": "Hours <span class=\"u\">→</span> Minutes",
      "prob.s2label": "The time between getting a request and assigning a truck is where the margin disappears.",
      "prob.s3num": "1 <span class=\"u\">network</span>",
      "prob.s3label": "Groups, carriers and drivers working as one connected operation.",

      "dest.eyebrow": "The model",
      "dest.h": "The 3 destinations of a load",
      "dest.lead": "Every incoming request always has a clear path. FleetFlow decides — with human review — where the load should go.",
      "dest.n1": "Destination 01", "dest.t1": "Own fleet",
      "dest.d1": "The load goes to your own fleet. Full control, inside your operation.",
      "dest.tag1": "Full control",
      "dest.n2": "Destination 02", "dest.t2": "Group Exchange",
      "dest.d2": "The load goes to carriers connected to the group. Trust and an established network.",
      "dest.tag2": "Group carriers",
      "dest.n3": "Destination 03", "dest.t3": "Public Exchange",
      "dest.d3": "The load becomes available to a wider network. Maximum reach, nothing sits idle.",
      "dest.tag3": "Open network",

      "como.eyebrow": "How it works",
      "como.h": "From request to road, without friction",
      "como.lead": "A simple flow, with AI doing the heavy lifting and the human always in control.",
      "step1.t": "Email", "step1.d": "A request arrives by email, phone or WhatsApp.",
      "step2.t": "AI", "step2.d": "FleetFlow reads, structures and proposes the load.",
      "step3.t": "Review", "step3.d": "The human confirms and adjusts before moving on.",
      "step4.t": "Own fleet / Group / Public", "step4.d": "The load goes to the right destination.",
      "step5.t": "Driver", "step5.d": "Driver or carrier executes.",

      "aud.g.kicker": "For groups",
      "aud.g.t": "Your network, finally connected",
      "aud.g.d": "Distribute loads across your own fleet and the group’s carriers from a single command point.",
      "aud.g.i1": "In-house, Group and Public Exchange from the same request",
      "aud.g.i2": "Human review before every decision",
      "aud.g.i3": "Total visibility: nothing gets forgotten",
      "aud.t.kicker": "For carriers",
      "aud.t.t": "More loads, fewer phone calls",
      "aud.t.d": "Access loads from the group and the public exchange. See, accept and execute — without chasing opportunities.",
      "aud.t.i1": "Real loads, at the right time",
      "aud.t.i2": "Access based on your profile",
      "aud.t.i3": "Direct link to those who need transport",

      "orbit.eyebrow": "Orbit",
      "orbit.h": "The intelligence that keeps it all connected",
      "orbit.lead": "Orbit is FleetFlow’s operational copilot. It reads requests, suggests where loads should go and learns from your operation — always as support, never replacing your decision.",
      "orbit.cta": "Discover Orbit",

      "plat.eyebrow": "Enter the platform",
      "plat.t": "Already part of the FleetFlow network?",
      "plat.d": "Continue your work on the operational platform — where the operation actually happens.",
      "plat.cta1": "Enter the Platform",
      "plat.cta2": "Public Load Exchange",
      "plat.cta3": "Request a Demo",
      "plat.one.d": "It’s marketing. Tells the story, shows the benefits, explains. Where you get to know us.",
      "plat.app.d": "It’s the product. No marketing — just operation. Where you work.",

      "ops.eyebrow": "Daily operations",
      "ops.h": "And every day, we plan your service",
      "ops.lead": "It's not just distributing loads. FleetFlow runs the daily operation of transport companies — fitting loads into trucks, spotting conflicts and suggesting the best plan with AI.",
      "ops.b1": "Loads fitted per truck and per slot",
      "ops.b2": "AI suggestions with a confidence level",
      "ops.b3": "Conflicts and driving times detected",
      "ops.b4": "Free slots and return trips always in view",
      "ops.board": "daily planning",
      "ops.camioes": "Trucks",
      "ops.encaixadas": "Fitted",
      "ops.slots": "Free slots",
      "ops.conflitos": "Conflicts",
      "ops.livre": "Free",
      "ops.ai": "AI suggested",

      "foot.copy": "FleetFlow. Loads stop getting lost. The operation stays connected.",
      "foot.sep": "fleetflow.one — commercial · app.fleetflow.systems — operational",
      "foot.contacto": "Contact"
    },

    es: {
      "meta.title": "FleetFlow — We Are Connected · Tu operación logística conectada",
      "meta.desc": "FleetFlow convierte las solicitudes de transporte recibidas por email, teléfono o WhatsApp en operaciones reales. Las cargas dejan de perderse. La operación queda conectada.",

      "nav.problem": "El problema",
      "nav.destinos": "Los 3 destinos",
      "nav.como": "Cómo funciona",
      "nav.orbit": "Orbit",
      "nav.bolsa": "Bolsa de Cargas",
      "nav.entrar": "Entrar",

      "intro.l1": "Hay cargas que quedan <span>paradas</span>.",
      "intro.l2": "No por falta de camiones.",
      "intro.l3": "Sino por falta de <span>conexión</span>.",
      "intro.skip": "Saltar intro",
      "cine.l1": "Hola 👋",
      "cine.l2": "¿Puedo mostrarle una cosa?",
      "cine.l3": "Cada día hay cargas que nunca llegan a realizarse.",
      "cine.l4": "No porque falten camiones.",
      "cine.l5": "Sino porque nadie sabe que existen a tiempo.",
      "cine.l6": "Nosotros lo resolvemos.",
      "cine.l7": "Y cada día, planificamos su servicio — camión a camión.",
      "cine.ia": "IA",
      "cine.skip": "Saltar introducción",

      "hero.title": "Las cargas dejan de perderse.<br /><span class=\"grad\">La operación queda conectada.</span>",
      "hero.sub": "FleetFlow convierte las solicitudes de transporte recibidas por <strong>email, teléfono o WhatsApp</strong> en operaciones listas para ejecutar — conectando grupos, transportistas y conductores en una única red.",
      "hero.cta1": "Entrar / Registrarse",
      "hero.cta2": "Ver Bolsa de Cargas",
      "hero.cta3": "Solicitar Demo",
      "hero.trust1": "Email → IA → Operación",
      "hero.trust2": "Flota · Grupo · Pública",
      "hero.trust3": "Sin cargas perdidas",

      "netcard.label": "red operativa",
      "netcard.ia": "IA + Revisión",
      "netcard.pedido": "solicitud",
      "netcard.casa": "Flota propia",
      "netcard.grupo": "Grupo",
      "netcard.publica": "Pública",

      "prob.eyebrow": "El problema",
      "prob.quote": "Cada día hay cargas que <span class=\"orange\">no se realizan</span>. <span class=\"dim\">No porque falten camiones.</span> Sino porque <span class=\"blue\">nadie sabe que existen a tiempo</span>.",
      "prob.s1num": "Email <span class=\"u\">·</span> Tel <span class=\"u\">·</span> WhatsApp",
      "prob.s1label": "Las solicitudes llegan dispersas por mil canales — y se pierden entre ellos.",
      "prob.s2num": "Horas <span class=\"u\">→</span> Minutos",
      "prob.s2label": "El tiempo entre recibir una solicitud y asignar un camión es donde desaparece el margen.",
      "prob.s3num": "1 <span class=\"u\">red</span>",
      "prob.s3label": "Grupos, transportistas y conductores trabajando como una sola operación conectada.",

      "dest.eyebrow": "El modelo",
      "dest.h": "Los 3 destinos de la carga",
      "dest.lead": "Cada solicitud que entra tiene siempre un camino claro. FleetFlow decide — con revisión humana — a dónde debe ir la carga.",
      "dest.n1": "Destino 01", "dest.t1": "Flota propia",
      "dest.d1": "La carga va a tu flota propia. Control total, dentro de tu operación.",
      "dest.tag1": "Control total",
      "dest.n2": "Destino 02", "dest.t2": "Bolsa del Grupo",
      "dest.d2": "La carga va a los transportistas conectados al grupo. Confianza y red ya establecida.",
      "dest.tag2": "Transportistas del grupo",
      "dest.n3": "Destino 03", "dest.t3": "Bolsa Pública",
      "dest.d3": "La carga queda disponible para una red más amplia. Alcance máximo, nada se queda parado.",
      "dest.tag3": "Red abierta",

      "como.eyebrow": "Cómo funciona",
      "como.h": "De la solicitud a la carretera, sin fricción",
      "como.lead": "Un flujo simple, con la IA haciendo el trabajo pesado y el humano siempre en control.",
      "step1.t": "Email", "step1.d": "La solicitud llega por email, teléfono o WhatsApp.",
      "step2.t": "IA", "step2.d": "FleetFlow lee, estructura y propone la carga.",
      "step3.t": "Revisión", "step3.d": "El humano confirma y ajusta antes de avanzar.",
      "step4.t": "Flota / Grupo / Público", "step4.d": "La carga va al destino correcto.",
      "step5.t": "Conductor", "step5.d": "Conductor o transportista ejecuta.",

      "aud.g.kicker": "Para grupos",
      "aud.g.t": "Tu red, por fin conectada",
      "aud.g.d": "Distribuye cargas entre la flota propia y los transportistas del grupo desde un único punto de mando.",
      "aud.g.i1": "Casa, Grupo y Bolsa Pública desde la misma solicitud",
      "aud.g.i2": "Revisión humana antes de cada decisión",
      "aud.g.i3": "Visibilidad total: nada se olvida",
      "aud.t.kicker": "Para transportistas",
      "aud.t.t": "Más cargas, menos llamadas",
      "aud.t.d": "Accede a las cargas del grupo y de la bolsa pública. Mira, acepta y ejecuta — sin perseguir oportunidades.",
      "aud.t.i1": "Cargas reales, en el momento justo",
      "aud.t.i2": "Acceso según tu perfil",
      "aud.t.i3": "Conexión directa con quien necesita transporte",

      "orbit.eyebrow": "Orbit",
      "orbit.h": "La inteligencia que mantiene todo conectado",
      "orbit.lead": "Orbit es el copiloto operativo de FleetFlow. Lee las solicitudes, sugiere el destino de la carga y aprende de tu operación — siempre como apoyo, nunca sustituyendo tu decisión.",
      "orbit.cta": "Descubrir Orbit",

      "plat.eyebrow": "Entrar en la plataforma",
      "plat.t": "¿Ya formas parte de la red FleetFlow?",
      "plat.d": "Continúa tu trabajo en la plataforma operativa — donde la operación realmente sucede.",
      "plat.cta1": "Entrar en la Plataforma",
      "plat.cta2": "Bolsa de Cargas Pública",
      "plat.cta3": "Solicitar Demo",
      "plat.one.d": "Es marketing. Cuenta la historia, muestra las ventajas, explica. Donde nos conoces.",
      "plat.app.d": "Es el producto. Nada de marketing — solo operación. Donde se trabaja.",

      "ops.eyebrow": "Operación diaria",
      "ops.h": "Y cada día, planificamos su servicio",
      "ops.lead": "No es solo distribuir cargas. FleetFlow gestiona la operación diaria de las empresas de transporte — encaja cargas en los camiones, detecta conflictos y sugiere el mejor plan con IA.",
      "ops.b1": "Encaje de cargas por camión y por slot",
      "ops.b2": "Sugerencias de IA con nivel de confianza",
      "ops.b3": "Conflictos y tiempos de conducción detectados",
      "ops.b4": "Slots libres y retornos siempre a la vista",
      "ops.board": "planificación diaria",
      "ops.camioes": "Camiones",
      "ops.encaixadas": "Encajadas",
      "ops.slots": "Slots libres",
      "ops.conflitos": "Conflictos",
      "ops.livre": "Libre",
      "ops.ai": "Sugerido por la IA",

      "foot.copy": "FleetFlow. Las cargas dejan de perderse. La operación queda conectada.",
      "foot.sep": "fleetflow.one — comercial · app.fleetflow.systems — operativo",
      "foot.contacto": "Contacto"
    }
  };

  var SUPPORTED = ["pt", "en", "es"];

  function pickInitial() {
    var saved = null;
    try { saved = localStorage.getItem("ff_lang"); } catch (e) {}
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    var nav = (navigator.language || "pt").slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) !== -1 ? nav : "pt";
  }

  function apply(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "pt";
    var d = DICT[lang];
    document.documentElement.lang = lang;

    // text nodes
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = d[key];
      if (val == null) return;
      if (val.indexOf("<") !== -1) el.innerHTML = val;
      else el.textContent = val;
    });

    // <title> + meta description
    if (d["meta.title"]) document.title = d["meta.title"];
    var md = document.querySelector('meta[name="description"]');
    if (md && d["meta.desc"]) md.setAttribute("content", d["meta.desc"]);
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt && d["meta.title"]) ogt.setAttribute("content", d["meta.title"]);
    var ogd = document.querySelector('meta[property="og:description"]');
    if (ogd && d["meta.desc"]) ogd.setAttribute("content", d["meta.desc"]);

    // switcher state
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    try { localStorage.setItem("ff_lang", lang); } catch (e) {}
    window.FF_LANG = lang;
  }

  // Apply as early as possible (before intro shows).
  apply(pickInitial());

  // Wire the switcher once the DOM is parsed (this script is deferred, so it is).
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); });
  });

  // Expose for other scripts if needed.
  window.FFI18n = { apply: apply, dict: DICT, supported: SUPPORTED };
})();
