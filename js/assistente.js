// Assistente do site (23/11): botão no canto inferior direito que abre um painel de conversa guiada. Sem IA paga e
// sem serviços de chat de terceiros: as respostas estão escritas aqui, os preços vêm da tabela pública e o contacto
// segue pelo mesmo envio do "Pedir orçamento" (window.FFPedido, js/pedido.js). Segue a língua da página: o i18n do
// index.html muda o <html lang> e a conversa é redesenhada na língua nova.
(() => {
  'use strict';

  const APP = 'https://app.fleetflow.systems';
  const DEMO = `${APP}/api/auth/demo-login?kind=full`;
  const PRIVACY = `${APP}/legal/privacidade`;
  const MAX_FLEET = 100000;

  // Tabela pública (app.fleetflow.systems → Preços). Tudo + IVA, mensal ou anual, sem período grátis.
  const PLANS = {
    manual: { m: 150, y: 1500, max: 30 },
    planner: { m: 200, y: 2000, max: 50 },
    carrier: { m: 299, y: 3000, max: 50 },
  };
  // Empresas grandes: um preço por empresa, pelo tamanho da frota.
  const TIERS = [
    { min: 51, max: 99, m: 599, y: 5000 },
    { min: 100, max: 149, m: 999, y: 10000 },
    { min: 150, max: 299, m: 2000, y: 20000 },
    { min: 300, max: 999, m: 4000, y: 40000, master: true },
    { min: 1000, max: Infinity, m: 10000, y: 100000 },
  ];

  const LINK = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  const fmt = (v, l) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, l === 'en' ? ',' : ' ');
  const money = (v, l) => (l === 'en' ? `€${fmt(v, l)}` : `${fmt(v, l)} €`);

  const T = {
    pt: {
      launch: 'Dúvidas? Pergunta aqui',
      launchAria: 'Abrir o assistente da FleetFlow',
      title: 'Assistente FleetFlow',
      sub: 'Preços e respostas na hora',
      close: 'Fechar o assistente',
      chipsAria: 'Sugestões de resposta',
      inputLabel: 'Escreve a tua pergunta',
      ph: 'Escreve a tua pergunta…',
      phFleet: 'N.º de camiões, por exemplo 50',
      send: 'Enviar',
      note: 'Respostas automáticas escritas pela equipa, sem IA. Para falar com uma pessoa, deixa o teu contacto.',
      trucks: (n) => (n === 1 ? '1 camião' : `${fmt(n, 'pt')} camiões`),
      chips: {
        price: 'Quanto custa?', what: 'O que faz a FleetFlow?', app: 'App do motorista', gps: 'GPS', invoice: 'Faturação',
        ecmr: 'e-CMR', start: 'Como começar', contact: 'Falar com uma pessoa', menu: 'Outra pergunta', other: 'Outra frota',
        demo: 'Ver demonstração', signup: 'Criar conta',
      },
      msg: {
        hello: 'Olá! Sou o assistente da FleetFlow. Digo-te quanto custa para a tua frota, explico o que a plataforma faz ou ponho-te em contacto com a equipa. Por onde começamos?',
        menu: 'Claro. Sobre o que queres saber mais?',
        askFleet: 'Quantos camiões tem a tua frota? Escreve o número ou escolhe um abaixo.',
        badFleet: 'Não percebi o número. Escreve só quantos camiões tens — por exemplo 25.',
        fallback: 'Não tenho a certeza de ter percebido. Escolhe um dos temas abaixo ou deixa o teu contacto e uma pessoa da equipa responde-te.',
        what: 'A FleetFlow é a plataforma para empresas de transporte. Planeias o dia ou a semana, crias as cargas e o e-CMR, falas com os motoristas pela app, vês a frota no mapa e tratas da oficina e do stock. Com a Bolsa de Cargas trocas trabalho com outras empresas. O Orbit, o nosso agente, propõe o plano e responde a perguntas — tu aprovas antes de ele agir.',
        app: 'A app do motorista funciona em Android e iPhone: envias-lhe um link e ele instala-a num toque, sem equipamento extra no camião. O motorista vê as cargas do dia e fala contigo pelo chat; o GPS do telemóvel mostra onde está. O gestor tem a sua própria app para acompanhar tudo fora do escritório.',
        gps: 'Podes começar só com o GPS do telemóvel, através da app do motorista — não precisas de instalar nada no camião. Se já tens telemática, a FleetFlow liga-se à Cartrack; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara e Visirun estão em validação. (O plano Planeador Manual + Oficina não tem GPS.)',
        invoice: 'A FleetFlow prepara a fatura a partir das cargas feitas e envia-a como rascunho para o programa de faturação da tua empresa. As ligações ao InvoiceXpress, Moloni e PHC GO estão em validação. Uma pessoa confere e confirma — nada é emitido automaticamente.',
        ecmr: 'O e-CMR é a guia de transporte em formato digital. A FleetFlow preenche-o com os dados da carga — expedidor, destinatário, mercadoria e matrícula — e o PDF fica guardado junto da carga.',
        start: `Crias a conta online em ${LINK(APP, 'app.fleetflow.systems')} em poucos minutos e escolhes o plano pelo tamanho da frota. Não há período grátis — a subscrição começa paga, mensal ou anual — mas podes ver já a ${LINK(DEMO, 'demonstração ao vivo')}, com dados de exemplo.`,
        lead: 'Deixa o teu contacto e uma pessoa da equipa responde-te por email.',
      },
      pr: {
        mo: '/mês', yr: '/ano',
        names: { manual: 'Planeador Manual + Oficina', planner: 'Só Planeador', carrier: 'Transportador', big: 'Empresas grandes' },
        intro3: (n) => `Para ${n} há três planos que servem (preços + IVA):`,
        intro2: (n) => `Para ${n} há dois planos que servem (preços + IVA):`,
        line: (name, m, y, d) => `<b>${name}</b> — ${m}/mês ou ${y}/ano. ${d}`,
        desc: {
          manual: 'Até 30 veículos: planeias à mão, com oficina e app do motorista. Sem GPS.',
          planner: 'Até 50 veículos: GPS, mapa ao vivo e o Orbit a planear contigo.',
          carrier: 'Até 50 veículos: o Só Planeador mais a Bolsa de Cargas e a Oficina.',
        },
        adv3: 'Sem GPS, o Manual chega. Com GPS e o Orbit, o Só Planeador. Se também trocas cargas com outras empresas ou tens oficina, o Transportador.',
        adv2: 'Para planear com GPS e o Orbit, o Só Planeador. Se também trocas cargas com outras empresas ou tens oficina, o Transportador. (O Manual só vai até 30 veículos.)',
        range: (t) => (t.max === Infinity ? 'de 1 000 ou mais veículos' : `dos ${t.min} aos ${t.max} veículos${t.master ? ' (Master)' : ''}`),
        big: (n, r, m, y) => `Para ${n} o plano é <b>Empresas grandes</b>, no escalão ${r}: <b>${m}/mês</b> ou <b>${y}/ano</b>, + IVA.`,
        bigInc: 'Inclui a plataforma completa: planeador com o Orbit, GPS, cargas e e-CMR, Bolsa de Cargas, oficina, báscula, portal de clientes e todas as apps.',
        save: (s) => `Pagar ao ano poupa ${s} face a 12 mensalidades.`,
        saveSmall: 'Pagar ao ano sai mais barato do que 12 mensalidades.',
        noTrial: `Não há período grátis: a subscrição começa paga, mensal ou anual. Antes de decidir, experimenta a ${LINK(DEMO, 'demonstração ao vivo')}.`,
      },
      form: {
        name: 'Nome *', email: 'Email *', phone: 'Telefone', message: 'Mensagem', msgPh: 'Conta-nos um pouco da tua operação (opcional)',
        submit: 'Enviar pedido', sending: 'A enviar…',
        privacy: `Usamos estes dados só para responder ao teu pedido. ${LINK(PRIVACY, 'Privacidade')}`,
        errName: 'Escreve o teu nome (pelo menos 2 letras).', errEmail: 'Confirma o email — por exemplo nome@empresa.pt.',
        ok: 'Pedido enviado. Recebemos o teu contacto e respondemos por email em breve.',
        invalid: 'O pedido não foi aceite: confirma o nome e o email.',
        err: 'Não conseguimos enviar agora.', errLink: 'Envia-nos por email — já vai preenchido.',
      },
    },
    en: {
      launch: 'Questions? Ask here',
      launchAria: 'Open the FleetFlow assistant',
      title: 'FleetFlow assistant',
      sub: 'Prices and answers, instantly',
      close: 'Close the assistant',
      chipsAria: 'Suggested replies',
      inputLabel: 'Type your question',
      ph: 'Type your question…',
      phFleet: 'Number of trucks, e.g. 50',
      send: 'Send',
      note: 'Automatic answers written by our team, no AI. To talk to a person, leave your contact.',
      trucks: (n) => (n === 1 ? '1 truck' : `${fmt(n, 'en')} trucks`),
      chips: {
        price: 'How much?', what: 'What does FleetFlow do?', app: 'Driver app', gps: 'GPS', invoice: 'Invoicing',
        ecmr: 'e-CMR', start: 'How to start', contact: 'Talk to a person', menu: 'Another question', other: 'Another fleet size',
        demo: 'See the demo', signup: 'Create account',
      },
      msg: {
        hello: "Hi! I'm the FleetFlow assistant. I can tell you what it costs for your fleet, explain what the platform does or put you in touch with the team. Where shall we start?",
        menu: 'Sure. What would you like to know more about?',
        askFleet: 'How many trucks are in your fleet? Type the number or pick one below.',
        badFleet: "I didn't catch the number. Just type how many trucks you have — for example 25.",
        fallback: "I'm not sure I understood. Pick one of the topics below, or leave your contact and a person from the team will reply.",
        what: 'FleetFlow is the platform for transport companies. You plan the day or the week, create loads and the e-CMR, talk to drivers through the app, see the fleet on the map and run the workshop and stock. With the Load Exchange you trade work with other companies. Orbit, our agent, proposes the plan and answers questions — you approve before it acts.',
        app: "The driver app runs on Android and iPhone: you send the driver a link and it installs in one tap, with no extra hardware in the truck. Drivers see the day's loads and chat with you; the phone's GPS shows where they are. Managers have their own app to follow everything away from the office.",
        gps: "You can start with just the phone's GPS, through the driver app — nothing to install in the truck. If you already have telematics, FleetFlow connects to Cartrack; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara and Visirun are being validated. (The Manual Planner + Workshop plan has no GPS.)",
        invoice: "FleetFlow prepares the invoice from completed loads and sends it as a draft to your company's invoicing software. The connections to InvoiceXpress, Moloni and PHC GO are in validation. A person checks and confirms — nothing is issued automatically.",
        ecmr: 'The e-CMR is the consignment note in digital form. FleetFlow fills it in from the load data — sender, consignee, goods and plate — and the PDF is kept with the load.',
        start: `Create your account online at ${LINK(APP, 'app.fleetflow.systems')} in a few minutes and pick the plan by fleet size. There is no free trial — subscriptions start paid, monthly or yearly — but you can try the ${LINK(DEMO, 'live demo')} right now, with sample data.`,
        lead: 'Leave your contact and a person from the team will reply by email.',
      },
      pr: {
        mo: '/month', yr: '/year',
        names: { manual: 'Manual Planner + Workshop', planner: 'Planner only', carrier: 'Carrier', big: 'Large companies' },
        intro3: (n) => `For ${n} there are three plans that fit (prices + VAT):`,
        intro2: (n) => `For ${n} there are two plans that fit (prices + VAT):`,
        line: (name, m, y, d) => `<b>${name}</b> — ${m}/month or ${y}/year. ${d}`,
        desc: {
          manual: 'Up to 30 vehicles: you plan by hand, with the workshop and the driver app. No GPS.',
          planner: 'Up to 50 vehicles: GPS, live map and Orbit planning with you.',
          carrier: 'Up to 50 vehicles: Planner only plus the Load Exchange and the Workshop.',
        },
        adv3: 'No GPS needed? Manual is enough. With GPS and Orbit, Planner only. If you also trade loads with other companies or run a workshop, Carrier.',
        adv2: 'To plan with GPS and Orbit, Planner only. If you also trade loads with other companies or run a workshop, Carrier. (Manual only goes up to 30 vehicles.)',
        range: (t) => (t.max === Infinity ? '1,000+ vehicles' : `${t.min}–${t.max} vehicles${t.master ? ' (Master)' : ''}`),
        big: (n, r, m, y) => `For ${n} the plan is <b>Large companies</b>, in the ${r} tier: <b>${m}/month</b> or <b>${y}/year</b>, + VAT.`,
        bigInc: 'It includes the full platform: planner with Orbit, GPS, loads and e-CMR, Load Exchange, workshop, weighbridge, customer portal and every app.',
        save: (s) => `Paying yearly saves ${s} compared with 12 monthly payments.`,
        saveSmall: 'Paying yearly costs less than 12 monthly payments.',
        noTrial: `There is no free trial: subscriptions start paid, monthly or yearly. Before deciding, try the ${LINK(DEMO, 'live demo')}.`,
      },
      form: {
        name: 'Name *', email: 'Email *', phone: 'Phone', message: 'Message', msgPh: 'Tell us a little about your operation (optional)',
        submit: 'Send request', sending: 'Sending…',
        privacy: `We only use this data to answer your request. ${LINK(PRIVACY, 'Privacy')}`,
        errName: 'Type your name (at least 2 letters).', errEmail: 'Check the email — for example name@company.com.',
        ok: 'Request sent. We have your contact and will reply by email soon.',
        invalid: 'The request was not accepted: check your name and email.',
        err: 'We could not send it right now.', errLink: 'Email us instead — it is already filled in.',
      },
    },
    es: {
      launch: '¿Dudas? Pregunta aquí',
      launchAria: 'Abrir el asistente de FleetFlow',
      title: 'Asistente FleetFlow',
      sub: 'Precios y respuestas al momento',
      close: 'Cerrar el asistente',
      chipsAria: 'Respuestas sugeridas',
      inputLabel: 'Escribe tu pregunta',
      ph: 'Escribe tu pregunta…',
      phFleet: 'N.º de camiones, por ejemplo 50',
      send: 'Enviar',
      note: 'Respuestas automáticas escritas por el equipo, sin IA. Para hablar con una persona, deja tu contacto.',
      trucks: (n) => (n === 1 ? '1 camión' : `${fmt(n, 'es')} camiones`),
      chips: {
        price: '¿Cuánto cuesta?', what: '¿Qué hace FleetFlow?', app: 'App del conductor', gps: 'GPS', invoice: 'Facturación',
        ecmr: 'e-CMR', start: 'Cómo empezar', contact: 'Hablar con una persona', menu: 'Otra pregunta', other: 'Otra flota',
        demo: 'Ver la demostración', signup: 'Crear cuenta',
      },
      msg: {
        hello: '¡Hola! Soy el asistente de FleetFlow. Te digo cuánto cuesta para tu flota, te explico qué hace la plataforma o te pongo en contacto con el equipo. ¿Por dónde empezamos?',
        menu: 'Claro. ¿Sobre qué quieres saber más?',
        askFleet: '¿Cuántos camiones tiene tu flota? Escribe el número o elige uno abajo.',
        badFleet: 'No he entendido el número. Escribe solo cuántos camiones tienes — por ejemplo 25.',
        fallback: 'No estoy seguro de haberte entendido. Elige uno de los temas de abajo o deja tu contacto y una persona del equipo te responderá.',
        what: 'FleetFlow es la plataforma para empresas de transporte. Planificas el día o la semana, creas las cargas y el e-CMR, hablas con los conductores por la app, ves la flota en el mapa y gestionas el taller y el stock. Con la Bolsa de Cargas intercambias trabajo con otras empresas. Orbit, nuestro agente, propone el plan y responde preguntas — tú apruebas antes de que actúe.',
        app: 'La app del conductor funciona en Android y iPhone: le envías un enlace y se instala con un toque, sin equipos extra en el camión. El conductor ve las cargas del día y habla contigo por el chat; el GPS del móvil muestra dónde está. El gestor tiene su propia app para seguirlo todo fuera de la oficina.',
        gps: 'Puedes empezar solo con el GPS del móvil, con la app del conductor — sin instalar nada en el camión. Si ya tienes telemática, FleetFlow se conecta a Cartrack; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara y Visirun están en validación. (El plan Planificador Manual + Taller no tiene GPS.)',
        invoice: 'FleetFlow prepara la factura a partir de las cargas hechas y la envía como borrador al programa de facturación de tu empresa. Las conexiones con InvoiceXpress, Moloni y PHC GO están en validación. Una persona revisa y confirma — nada se emite automáticamente.',
        ecmr: 'El e-CMR es la carta de porte en formato digital. FleetFlow lo rellena con los datos de la carga — remitente, destinatario, mercancía y matrícula — y el PDF queda guardado con la carga.',
        start: `Creas la cuenta online en ${LINK(APP, 'app.fleetflow.systems')} en pocos minutos y eliges el plan según el tamaño de la flota. No hay periodo de prueba gratis — la suscripción empieza de pago, mensual o anual — pero puedes ver ya la ${LINK(DEMO, 'demostración en vivo')}, con datos de ejemplo.`,
        lead: 'Deja tu contacto y una persona del equipo te responderá por email.',
      },
      pr: {
        mo: '/mes', yr: '/año',
        names: { manual: 'Planificador Manual + Taller', planner: 'Solo Planificador', carrier: 'Transportista', big: 'Grandes empresas' },
        intro3: (n) => `Para ${n} hay tres planes que encajan (precios + IVA):`,
        intro2: (n) => `Para ${n} hay dos planes que encajan (precios + IVA):`,
        line: (name, m, y, d) => `<b>${name}</b> — ${m}/mes o ${y}/año. ${d}`,
        desc: {
          manual: 'Hasta 30 vehículos: planificas a mano, con taller y la app del conductor. Sin GPS.',
          planner: 'Hasta 50 vehículos: GPS, mapa en vivo y Orbit planificando contigo.',
          carrier: 'Hasta 50 vehículos: el Solo Planificador más la Bolsa de Cargas y el Taller.',
        },
        adv3: '¿Sin GPS? Basta con el Manual. Con GPS y Orbit, el Solo Planificador. Si además intercambias cargas con otras empresas o tienes taller, el Transportista.',
        adv2: 'Para planificar con GPS y Orbit, el Solo Planificador. Si además intercambias cargas con otras empresas o tienes taller, el Transportista. (El Manual solo llega a 30 vehículos.)',
        range: (t) => (t.max === Infinity ? 'de 1 000 o más vehículos' : `de ${t.min} a ${t.max} vehículos${t.master ? ' (Master)' : ''}`),
        big: (n, r, m, y) => `Para ${n} el plan es <b>Grandes empresas</b>, en el tramo ${r}: <b>${m}/mes</b> o <b>${y}/año</b>, + IVA.`,
        bigInc: 'Incluye la plataforma completa: planificador con Orbit, GPS, cargas y e-CMR, Bolsa de Cargas, taller, báscula, portal de clientes y todas las apps.',
        save: (s) => `Pagando al año ahorras ${s} frente a 12 mensualidades.`,
        saveSmall: 'Pagar al año sale más barato que 12 mensualidades.',
        noTrial: `No hay periodo de prueba gratis: la suscripción empieza de pago, mensual o anual. Antes de decidir, prueba la ${LINK(DEMO, 'demostración en vivo')}.`,
      },
      form: {
        name: 'Nombre *', email: 'Email *', phone: 'Teléfono', message: 'Mensaje', msgPh: 'Cuéntanos un poco de tu operación (opcional)',
        submit: 'Enviar solicitud', sending: 'Enviando…',
        privacy: `Usamos estos datos solo para responder a tu solicitud. ${LINK(PRIVACY, 'Privacidad')}`,
        errName: 'Escribe tu nombre (al menos 2 letras).', errEmail: 'Revisa el email — por ejemplo nombre@empresa.es.',
        ok: 'Solicitud enviada. Tenemos tu contacto y te responderemos pronto por email.',
        invalid: 'La solicitud no se ha aceptado: revisa el nombre y el email.',
        err: 'No hemos podido enviarla ahora.', errLink: 'Escríbenos por email — ya va rellenado.',
      },
    },
  };

  // ---------- Preços ----------

  /** O plano para uma frota de n camiões: até 50 escolhe-se entre os pacotes, a partir de 51 é o escalão. */
  function recommend(n) {
    if (n > PLANS.planner.max) return { n, tier: TIERS.find((t) => n >= t.min && n <= t.max) };
    return { n, plans: n <= PLANS.manual.max ? ['manual', 'planner', 'carrier'] : ['planner', 'carrier'] };
  }

  function priceHtml(n, l) {
    const L = T[l].pr;
    const r = recommend(n);
    const who = T[l].trucks(n);
    if (r.tier) {
      const t = r.tier;
      return `<p>${L.big(who, L.range(t), money(t.m, l), money(t.y, l))}</p><p>${L.save(money(t.m * 12 - t.y, l))} ${L.bigInc}</p><p>${L.noTrial}</p>`;
    }
    const items = r.plans.map((k) => `<li>${L.line(L.names[k], money(PLANS[k].m, l), money(PLANS[k].y, l), L.desc[k])}</li>`).join('');
    const intro = r.plans.length === 3 ? L.intro3(who) : L.intro2(who);
    const adv = r.plans.length === 3 ? L.adv3 : L.adv2;
    return `<p>${intro}</p><ul>${items}</ul><p>${adv} ${L.saveSmall}</p><p>${L.noTrial}</p>`;
  }

  /** Resumo para o email da FleetFlow (sempre em português: é a equipa que o lê). */
  function planSummary(n) {
    const r = recommend(n);
    const m = (v) => money(v, 'pt');
    if (r.tier) {
      const t = r.tier;
      return `Empresas grandes, escalão ${T.pt.pr.range(t)} — ${m(t.m)}/mês ou ${m(t.y)}/ano + IVA`;
    }
    return r.plans.map((k) => `${T.pt.pr.names[k]} (${m(PLANS[k].m)}/mês ou ${m(PLANS[k].y)}/ano)`).join(' ou ') + ' + IVA';
  }

  // ---------- Perceber o que a pessoa escreveu ----------

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const TOPICS = [
    ['contact', /contact|falar|pessoa|humano|ligue|ligar|telefon|whatsapp|human|person|call me|hablar|persona|llam/],
    ['invoice', /fatur|factur|invoice|moloni|invoicexpress|phc|billing/],
    ['gps', /gps|cartrack|frotcom|webfleet|geotab|samsara|visirun|verizon|telemat|locali|track|rastre/],
    ['ecmr', /cmr|guia de transporte|carta de porte|consignment/],
    ['app', /\bapps?\b|aplica|motorista|driver|conductor|telemovel|movil|android|iphone|\bios\b/],
    ['price', /preco|custa|custo|quanto|valor|mensalidade|plano|price|pricing|cost|how much|plan\b|precio|cuesta|cuanto|tarifa/],
    ['start', /comec|conta|regist|experiment|gratis|demo|start|sign ?up|account|trial|free|try|empez|cuenta|prueba|probar/],
    ['what', /o que (e|faz)|what (is|does)|que (es|hace)|modulo|funcionalidade|feature|planeador|planner|planificador|bolsa|oficina|workshop|taller|orbit/],
  ];
  const FLEET_WORDS = /cami|truck|lorr|veic|vehic|viatur|frota|fleet|flota/;

  function parseFleet(text) {
    const m = text.match(/\d{1,3}(?:[.\s ,]\d{3})+|\d+/);
    return m ? parseInt(m[0].replace(/\D/g, ''), 10) : null;
  }

  // ---------- Estado e desenho ----------

  const lang = () => {
    const l = (document.documentElement.lang || 'pt').slice(0, 2);
    return T[l] ? l : 'pt';
  };
  const TOPIC_CHIPS = ['price', 'what', 'app', 'gps', 'invoice', 'ecmr', 'start', 'contact'];
  const FLEET_CHIPS = [10, 25, 50, 100, 300];

  const state = {
    history: [], // { who: 'bot' | 'user', key?, n?, text? }
    chips: [],
    awaitingFleet: false,
    fleet: null,
    topics: new Set(),
    opener: null,
    sent: false,
  };

  const root = document.createElement('div');
  root.className = 'ffa';
  root.innerHTML = `
    <button type="button" class="ffa-launch" aria-expanded="false" aria-controls="ffa-panel">
      <span class="ffa-launch__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-7l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 11.25h.01M12 11.25h.01M16 11.25h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span class="ffa-launch__dot"></span></span>
      <span class="ffa-launch__text"></span>
    </button>
    <div class="ffa-panel" id="ffa-panel" role="dialog" aria-modal="false" aria-labelledby="ffa-title" aria-describedby="ffa-sub" data-snap-ignore hidden>
      <div class="ffa-head">
        <span class="ffa-head__mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><defs><radialGradient id="ffa-logo"><stop offset="0" stop-color="#d6fff0"/><stop offset="1" stop-color="#31e0a0"/></radialGradient></defs><path d="M10.2 3.6A8.6 8.6 0 0 0 6.4 19.2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-dasharray="0 4"/><path d="M13.8 20.4A8.6 8.6 0 0 0 17.6 4.8" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="12" r="2.9" fill="url(#ffa-logo)"/></svg></span>
        <div class="ffa-head__text"><h2 class="ffa-head__title" id="ffa-title"></h2><p class="ffa-head__sub" id="ffa-sub"></p></div>
        <button type="button" class="ffa-close"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
      </div>
      <div class="ffa-body">
        <ol class="ffa-log" role="log" aria-live="polite" aria-relevant="additions"></ol>
        <div class="ffa-lead-slot"></div>
        <div class="ffa-chips" role="group"></div>
      </div>
      <form class="ffa-compose" novalidate>
        <label class="ffa-sr" for="ffa-input"></label>
        <input id="ffa-input" type="text" autocomplete="off" maxlength="200" enterkeyhint="send">
        <button type="submit" class="ffa-send"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </form>
      <p class="ffa-note"></p>
    </div>`;
  document.body.appendChild(root);

  const $ = (sel) => root.querySelector(sel);
  const launch = $('.ffa-launch');
  const panel = $('.ffa-panel');
  const body = $('.ffa-body');
  const log = $('.ffa-log');
  const chipsBox = $('.ffa-chips');
  const leadSlot = $('.ffa-lead-slot');
  const compose = $('.ffa-compose');
  const input = $('#ffa-input');
  let lead = null; // o formulário de contacto (um de cada vez)

  function renderEntry(entry, l) {
    const li = document.createElement('li');
    li.className = `ffa-msg ffa-msg--${entry.who}`;
    if (entry.who === 'user') {
      // O que a pessoa escreveu vai sempre como texto, nunca como HTML.
      li.textContent = entry.text ?? (entry.key === 'fleet' ? T[l].trucks(entry.n) : T[l].chips[entry.key]);
    } else {
      // As respostas do assistente são textos fixos deste ficheiro (com links nossos).
      li.innerHTML = entry.key === 'price' ? priceHtml(entry.n, l) : `<p>${T[l].msg[entry.key]}</p>`;
    }
    return li;
  }

  function scrollDown() {
    body.scrollTop = body.scrollHeight;
  }

  function say(entry) {
    state.history.push(entry);
    log.appendChild(renderEntry(entry, lang()));
  }

  function setChips(list) {
    state.chips = list;
    renderChips();
  }

  function renderChips() {
    const l = lang();
    chipsBox.setAttribute('aria-label', T[l].chipsAria);
    chipsBox.replaceChildren(
      ...state.chips.map((c) => {
        const link = c === 'demo' ? DEMO : c === 'signup' ? APP : null;
        const el = document.createElement(link ? 'a' : 'button');
        el.className = `ffa-chip${link ? ' ffa-chip--link' : ''}`;
        if (link) {
          el.href = link;
          el.target = '_blank';
          el.rel = 'noopener';
        } else {
          el.type = 'button';
        }
        el.dataset.chip = String(c);
        el.textContent = typeof c === 'number' ? T[l].trucks(c) : T[l].chips[c];
        return el;
      }),
    );
    chipsBox.hidden = !state.chips.length;
  }

  function setAwaitingFleet(on) {
    state.awaitingFleet = on;
    const l = lang();
    input.placeholder = on ? T[l].phFleet : T[l].ph;
    input.inputMode = on ? 'numeric' : 'text';
  }

  // ---------- Respostas ----------

  function answerPrice(n) {
    if (!Number.isFinite(n) || n < 1 || n > MAX_FLEET) {
      say({ who: 'bot', key: 'badFleet' });
      setAwaitingFleet(true);
      setChips([...FLEET_CHIPS, 'menu']);
      return;
    }
    state.fleet = n;
    state.topics.add('price');
    setAwaitingFleet(false);
    say({ who: 'bot', key: 'price', n });
    setChips(['contact', 'demo', 'signup', 'other', 'menu']);
  }

  function askFleet() {
    state.topics.add('price');
    say({ who: 'bot', key: 'askFleet' });
    setAwaitingFleet(true);
    setChips([...FLEET_CHIPS, 'menu']);
  }

  function answerTopic(key) {
    setAwaitingFleet(false);
    if (key === 'price') return askFleet();
    if (key === 'contact') return showLead();
    state.topics.add(key);
    say({ who: 'bot', key });
    setChips(key === 'start' ? ['demo', 'signup', 'price', 'contact', 'menu'] : ['price', 'contact', 'demo', 'menu']);
  }

  function menu() {
    setAwaitingFleet(false);
    say({ who: 'bot', key: 'menu' });
    setChips(TOPIC_CHIPS);
  }

  function route(text) {
    const s = norm(text);
    const n = parseFleet(text);
    const topic = TOPICS.find(([, re]) => re.test(s))?.[0];
    const bare = /^\s*[\d.\s ,]+\s*$/.test(text);
    if (n !== null && (state.awaitingFleet || bare || FLEET_WORDS.test(s) || topic === 'price')) return answerPrice(n);
    if (topic) return answerTopic(topic);
    if (state.awaitingFleet) return answerPrice(NaN);
    say({ who: 'bot', key: 'fallback' });
    setChips(TOPIC_CHIPS);
  }

  function onChip(c) {
    const n = Number(c);
    if (Number.isInteger(n) && n > 0) {
      say({ who: 'user', key: 'fleet', n });
      answerPrice(n);
    } else {
      say({ who: 'user', key: c });
      if (c === 'menu') menu();
      else if (c === 'other') askFleet();
      else answerTopic(c);
    }
    afterTurn();
  }

  // Depois de cada resposta: mostra-a desde o início (uma resposta de preços é mais alta do que o painel) e não deixa
  // o foco perdido (o botão carregado desapareceu).
  function afterTurn(keepFocus) {
    requestAnimationFrame(() => {
      const last = log.lastElementChild;
      body.scrollTop = last ? Math.min(body.scrollHeight, last.offsetTop - 16) : body.scrollHeight;
    });
    if (keepFocus) return;
    const target = lead && !state.sent && !lead.hidden ? lead.querySelector('input') : chipsBox.querySelector('.ffa-chip') || input;
    target?.focus({ preventScroll: true });
  }

  // ---------- Contacto ----------

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showLead() {
    state.topics.add('contact');
    if (!lead || state.sent) {
      say({ who: 'bot', key: 'lead' });
      buildLead();
    }
    setChips(['menu']);
  }

  function buildLead() {
    state.sent = false;
    lead?.remove();
    lead = document.createElement('form');
    lead.className = 'ffa-lead';
    lead.noValidate = true;
    lead.innerHTML = `
      <label class="ffa-field"><span data-f="name"></span><input name="name" type="text" autocomplete="name" required minlength="2" maxlength="120" aria-describedby="ffa-e-name"></label>
      <p class="ffa-err" id="ffa-e-name" data-f="errName" hidden></p>
      <label class="ffa-field"><span data-f="email"></span><input name="email" type="email" autocomplete="email" required maxlength="254" aria-describedby="ffa-e-email"></label>
      <p class="ffa-err" id="ffa-e-email" data-f="errEmail" hidden></p>
      <label class="ffa-field"><span data-f="phone"></span><input name="phone" type="tel" autocomplete="tel" maxlength="40" value="+351 "></label>
      <label class="ffa-field"><span data-f="message"></span><textarea name="message" maxlength="1500" data-ph="msgPh"></textarea></label>
      <label class="ffa-trap" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      <p class="ffa-privacy" data-f="privacy"></p>
      <div class="ffa-lead__actions">
        <button type="submit" class="btn btn--glow ffa-submit"><span data-f="submit"></span><span class="btn__icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
      </div>
      <p class="ffa-status" role="status"></p>`;
    lead.addEventListener('submit', onLeadSubmit);
    leadSlot.replaceChildren(lead);
    localizeLead();
  }

  function localizeLead() {
    if (!lead) return;
    const F = T[lang()].form;
    lead.querySelectorAll('[data-f]').forEach((el) => {
      const k = el.dataset.f;
      if (k === 'privacy') el.innerHTML = F.privacy;
      else el.textContent = F[k];
    });
    lead.querySelectorAll('[data-ph]').forEach((el) => (el.placeholder = F[el.dataset.ph]));
    if (lead.dataset.status) setLeadStatus(lead.dataset.status);
  }

  function setLeadStatus(kind, mailto) {
    const F = T[lang()].form;
    const box = lead.querySelector('.ffa-status');
    lead.dataset.status = kind || '';
    box.className = `ffa-status${kind ? ` ffa-status--${kind === 'ok' ? 'ok' : kind === 'sending' ? 'wait' : 'err'}` : ''}`;
    box.setAttribute('role', kind === 'err' || kind === 'invalid' ? 'alert' : 'status');
    if (mailto) lead.dataset.mailto = mailto;
    if (kind === 'err') {
      box.innerHTML = '';
      box.append(`${F.err} `);
      const a = document.createElement('a');
      a.href = lead.dataset.mailto || 'mailto:support@fleetflow.systems';
      a.textContent = F.errLink;
      box.append(a);
    } else {
      box.textContent = kind ? F[kind === 'sending' ? 'sending' : kind] : '';
    }
  }

  function fieldError(name, on) {
    const inputEl = lead.elements[name];
    const err = lead.querySelector(`#ffa-e-${name}`);
    inputEl.setAttribute('aria-invalid', String(on));
    err.hidden = !on;
    return on;
  }

  function leadPayload() {
    const f = lead.elements;
    const phone = f.phone.value.trim();
    const lines = ['— Enviado pelo assistente do site (fleetflow.one) —'];
    if (state.fleet) lines.push(`Frota: ${T.pt.trucks(state.fleet)}`, `Plano sugerido: ${planSummary(state.fleet)}`);
    const TOPIC_PT = { price: 'preços', what: 'o que faz', app: 'app do motorista', gps: 'GPS', invoice: 'faturação', ecmr: 'e-CMR', start: 'como começar', contact: 'contacto' };
    const seen = [...state.topics].map((t) => TOPIC_PT[t]).filter(Boolean);
    if (seen.length) lines.push(`Temas vistos: ${seen.join(', ')}`);
    lines.push(`Língua do site: ${lang().toUpperCase()}`);
    const summary = lines.join('\n');
    const own = f.message.value.trim().slice(0, 2000 - summary.length - 2);
    return {
      service: 'platform',
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      company: '',
      phone: phone.replace(/\D/g, '') === '351' ? '' : phone,
      fleetSize: state.fleet ? String(state.fleet) : '',
      message: own ? `${own}\n\n${summary}` : summary,
      lang: lang(),
      website: f.website.value,
    };
  }

  async function onLeadSubmit(e) {
    e.preventDefault();
    const f = lead.elements;
    const badName = fieldError('name', f.name.value.trim().length < 2);
    const badEmail = fieldError('email', !EMAIL_RE.test(f.email.value.trim()));
    if (badName || badEmail) {
      (badName ? f.name : f.email).focus();
      setLeadStatus('');
      return;
    }
    const p = leadPayload();
    const api = window.FFPedido;
    const lines = [p.name, p.email, p.phone, p.fleetSize && `Frota: ${p.fleetSize}`, '', p.message].filter((v, i) => v || i === 4);
    const mailto = api ? api.mailto('Pedido pelo assistente do site — Plataforma FleetFlow', lines) : '';
    const submit = lead.querySelector('.ffa-submit');
    submit.disabled = true;
    setLeadStatus('sending');
    try {
      if (!api) throw new Error('no-sender');
      const r = await api.send(p);
      if (r.ok) {
        state.sent = true;
        lead.classList.add('is-sent');
        setLeadStatus('ok');
        setChips(['menu', 'demo']);
      } else if (r.status === 400) {
        setLeadStatus('invalid');
      } else {
        throw new Error(String(r.status));
      }
    } catch {
      setLeadStatus('err', mailto);
    } finally {
      submit.disabled = false;
      requestAnimationFrame(scrollDown);
    }
  }

  // ---------- Abrir, fechar, língua ----------

  function localize() {
    const l = lang();
    const D = T[l];
    $('.ffa-launch__text').textContent = D.launch;
    launch.setAttribute('aria-label', D.launchAria);
    $('.ffa-head__title').textContent = D.title;
    $('.ffa-head__sub').textContent = D.sub;
    $('.ffa-close').setAttribute('aria-label', D.close);
    $('label[for="ffa-input"]').textContent = D.inputLabel;
    $('.ffa-send').setAttribute('aria-label', D.send);
    $('.ffa-note').textContent = D.note;
    setAwaitingFleet(state.awaitingFleet);
    log.replaceChildren(...state.history.map((entry) => renderEntry(entry, l)));
    renderChips();
    localizeLead();
    place();
  }

  function open(flow) {
    state.opener = document.activeElement;
    if (panel.hidden) {
      panel.hidden = false;
      root.classList.add('is-open');
      launch.setAttribute('aria-expanded', 'true');
      if (!state.history.length) {
        say({ who: 'bot', key: 'hello' });
        setChips(TOPIC_CHIPS);
      }
    }
    if (flow === 'price') {
      say({ who: 'user', key: 'price' });
      askFleet();
    }
    afterTurn();
  }

  function close() {
    if (panel.hidden) return;
    panel.hidden = true;
    root.classList.remove('is-open');
    launch.setAttribute('aria-expanded', 'false');
    const back = state.opener && state.opener !== document.body && document.contains(state.opener) ? state.opener : launch;
    back.focus({ preventScroll: true });
  }

  // Não tapar o rodapé legal: se ele chegar ao canto do botão (telemóvel), o botão e o painel sobem por cima dele.
  function place() {
    const foot = document.getElementById('ff-foot');
    let bottom = 16;
    if (foot) {
      const f = foot.getBoundingClientRect();
      const reach = launch.getBoundingClientRect();
      const left = reach.width ? reach.left : window.innerWidth - 80;
      if (f.height && f.right > left - 8) bottom = Math.ceil(window.innerHeight - f.top) + 10;
    }
    root.style.setProperty('--ffa-bottom', `${bottom}px`);
  }

  launch.addEventListener('click', () => (panel.hidden ? open() : close()));
  $('.ffa-close').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  });
  chipsBox.addEventListener('click', (e) => {
    const chip = e.target.closest('button.ffa-chip');
    if (chip) onChip(chip.dataset.chip);
  });
  compose.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    say({ who: 'user', text: text.slice(0, 200) });
    route(text);
    afterTurn(true);
  });
  document.querySelectorAll('[data-assistente]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open(el.getAttribute('data-assistente'));
    }),
  );

  new MutationObserver(localize).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('resize', place);
  document.fonts?.ready.then(place);
  localize();
})();
