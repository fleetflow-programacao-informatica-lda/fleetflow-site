// Assistente do site (23/11): botão no canto inferior direito que abre um painel de conversa guiada. Sem IA paga e
// sem serviços de chat de terceiros: as respostas estão escritas aqui, os preços vêm da tabela pública e o contacto
// segue pelo mesmo envio do "Pedir orçamento" (window.FFPedido, js/pedido.js). Segue a língua da página: o i18n do
// index.html muda o <html lang> e a conversa é redesenhada na língua nova.
(() => {
  'use strict';

  const APP = 'https://app.fleetflow.systems';
  const DEMO = `${APP}/api/auth/demo-login?kind=full`;
  const PRIVACY = `${APP}/legal/privacidade`;
  const TERMS = `${APP}/legal/termos`;
  const SIGNUP = `${APP}/login`;
  const MAIL = 'support@fleetflow.systems';
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
  const MAILTO = `<a href="mailto:${MAIL}">${MAIL}</a>`;
  const fmt = (v, l) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, l === 'en' ? ',' : ' ');
  const money = (v, l) => (l === 'en' ? `€${fmt(v, l)}` : `${fmt(v, l)} €`);

  // Respostas: um texto, ou uma lista de parágrafos (os que começam por "<ul" são listas). Só texto fixo deste
  // ficheiro, com links nossos; o que a pessoa escreve nunca entra aqui.
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
        price: 'Quanto custa?', benefits: 'O que ganho com isto?', orbit: 'O que é o Orbit?', what: 'O que faz a FleetFlow?',
        integrations: 'Integrações', workshop: 'Software de oficina', start: 'Como começar', contact: 'Falar com uma pessoa',
        more: 'Mais temas', app: 'App do motorista', ecmr: 'e-CMR', planner: 'Planeador', exchange: 'Bolsa de Cargas',
        gps: 'GPS', invoice: 'Faturação', security: 'Segurança e RGPD', contract: 'Contrato e cancelamento',
        import: 'Importar dados', support: 'Apoio e formação', sites: 'Sites com movimento', custom: 'Software à medida',
        where: 'Onde estão?', about: 'Quem são?', menu: 'Outra pergunta', other: 'Outra frota',
        demo: 'Ver demonstração', signup: 'Criar conta',
        quoteSite: 'Pedir orçamento do site', quoteSoftware: 'Pedir orçamento', quotePlatform: 'Pedir proposta',
      },
      msg: {
        hello: 'Olá! Sou o assistente da FleetFlow, o TMS completo para transportadoras. Pergunta-me o que quiseres — preços para a tua frota, o Orbit, integrações, oficina, como começar — ou fala com a equipa.',
        menu: 'Claro. Sobre o que queres saber mais?',
        more: 'Aqui tens mais temas:',
        askFleet: 'Quantos camiões tem a tua frota? Escreve o número ou escolhe um abaixo.',
        badFleet: 'Não percebi o número. Escreve só quantos camiões tens — por exemplo 25.',
        fallback: 'Ainda não sei responder a isso. Experimenta com outras palavras — por exemplo preços, o Orbit, integrações ou a oficina — ou deixa o teu contacto e uma pessoa da equipa responde-te.',
        greet: 'Olá! Em que posso ajudar?',
        thanks: 'De nada! Se tiveres mais alguma pergunta, estou aqui.',
        what: [
          'A FleetFlow é um TMS completo para empresas de transporte, tudo integrado numa só plataforma:',
          '<ul><li><b>Planeador</b> do dia ou da semana, com as cargas separadas em Nacional, Ibérico e Internacional.</li><li><b>Cargas e e-CMR</b>, preenchido a partir dos dados da carga.</li><li><b>App do motorista</b> e do gestor, em Android e iPhone.</li><li><b>Frota no mapa</b>, pelo GPS do telemóvel ou da tua telemática.</li><li><b>Oficina e stock</b> de peças.</li><li><b>Bolsa de Cargas</b> para trocar trabalho com outras empresas.</li><li><b>Faturação</b> ligada ao programa que já usas.</li></ul>',
          'O Orbit, o nosso agente de IA, propõe o plano e responde a perguntas — tu aprovas antes de ele agir.',
        ],
        benefits: [
          'O que ganhas com a FleetFlow:',
          '<ul><li><b>Menos tempo a planear</b> — o dia ou a semana numa só vista, com as cargas ordenadas de norte a sul.</li><li><b>Menos quilómetros em vazio</b> — o Orbit propõe o plano a pensar nos retornos e a Bolsa de Cargas ajuda a encher camiões.</li><li><b>Tudo num só sítio</b> — cargas, e-CMR, motoristas, mapa, oficina e stock, sem folhas soltas.</li><li><b>Motoristas informados</b> pela app, com menos telefonemas.</li><li><b>Faturas sem escrever tudo outra vez</b> — as cargas feitas viram rascunho no teu programa de faturação.</li><li><b>Preços públicos</b>, desde 150 €/mês + IVA, mensal ou anual.</li></ul>',
          'A melhor forma de ver se serve à tua empresa é abrir a demonstração ao vivo.',
        ],
        orbit: [
          'O Orbit é o agente de IA da FleetFlow. Conhece a tua operação — cargas, camiões, motoristas e clientes — e trabalha contigo:',
          '<ul><li><b>Propõe o plano</b> do dia ou da semana.</li><li><b>Responde a perguntas</b> sobre a operação, por exemplo que camiões estão livres amanhã.</li><li><b>Prepara o trabalho</b> para tu confirmares.</li></ul>',
          'Nada acontece sozinho: vês o que ele propõe e aprovas antes de ele agir. Vem no Só Planeador, no Transportador e nas Empresas grandes; no Planeador Manual só responde a perguntas.',
        ],
        contact: `Podes escrever-nos para ${MAILTO} ou deixar aqui o teu contacto — uma pessoa da equipa responde-te por email.`,
        where: [
          'Trabalhamos online, com empresas em Portugal e Espanha: a plataforma funciona no browser e nas apps, por isso não precisas de te deslocar.',
          `A empresa é a FleetFlow Programação INF Unipessoal Lda (NIF 519110790). Para falar connosco escreve para ${MAILTO} ou deixa aqui o teu contacto.`,
        ],
        about: [
          'A FleetFlow foi feita dentro de uma empresa de transportes portuguesa, para quem gere camiões, motoristas e cargas todos os dias.',
          'Além da plataforma, fazemos software de oficina, software à medida e sites com movimento. A empresa é a FleetFlow Programação INF Unipessoal Lda (NIF 519110790).',
        ],
        demo: `A ${LINK(DEMO, 'demonstração ao vivo')} abre a plataforma completa com dados de exemplo, sem registo. Explora à vontade — nada do que fizeres mexe em dados reais.`,
        start: [
          `Crias a conta online em ${LINK(SIGNUP, 'app.fleetflow.systems')} em poucos minutos e escolhes o plano pelo tamanho da frota. A equipa aprova a conta e a subscrição começa paga, mensal ou anual — não há período grátis.`,
          'Depois importas motoristas, veículos e clientes a partir de Excel e envias aos motoristas o link da app, que se instala num toque.',
          `Antes de decidir, vê a ${LINK(DEMO, 'demonstração ao vivo')}.`,
        ],
        import: [
          'Não começas do zero: importas motoristas, veículos e clientes a partir de Excel, e os planos de cargas também podem entrar por ficheiro.',
          'Na oficina, peças e viaturas importam-se de PDF, Excel ou CSV, com pré-visualização antes de gravar. Se o teu ficheiro tiver outro formato, envia-nos um exemplo.',
        ],
        security: [
          'Os dados são da tua empresa e só são usados para te prestar o serviço.',
          '<ul><li>Alojamento principal na União Europeia (Alemanha).</li><li>Ligações encriptadas, palavras-passe guardadas com hashing e credenciais das integrações encriptadas.</li><li>Cada empresa fica isolada das outras.</li><li>Cópias de segurança testadas.</li></ul>',
          `Tratamos os dados de acordo com o RGPD — vê a ${LINK(PRIVACY, 'Política de Privacidade')}.`,
        ],
        support: [
          `Tens manuais de utilização em PDF, uma introdução guiada em cada menu da plataforma e ajuda por email em ${MAILTO}.`,
          'Na configuração inicial — importar os dados, ligar o GPS, pôr os motoristas na app — contas com a nossa ajuda.',
        ],
        contract: [
          'Pagas mensal ou anual, à tua escolha; não há período grátis.',
          'Não há fidelização para além do período já pago: cancelas quando quiseres e o cancelamento conta no fim do mês ou do ano em curso — manténs o acesso até lá. Não há reembolso de meses parciais.',
          `Os detalhes estão nos ${LINK(TERMS, 'Termos')}.`,
        ],
        integrations: [
          'A FleetFlow liga-se ao que a tua empresa já usa. Os estados são reais:',
          '<ul><li><b>GPS e telemática</b> — Cartrack disponível; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara e Visirun em validação. Ou só o GPS do telemóvel, pela app do motorista.</li><li><b>Faturação</b> — InvoiceXpress, Moloni e PHC GO em validação. Envia rascunhos e uma pessoa confirma.</li><li><b>Pagamentos</b> — Stripe.</li></ul>',
          'Usas outro programa? Diz-nos qual.',
        ],
        workshop: [
          'Temos software de oficina completo:',
          '<ul><li>Trabalhos por viatura, agenda de marcações e histórico.</li><li>Revisões, pneus e quilómetros com avisos.</li><li>Stock de peças sempre contado e gastos por viatura.</li><li>Folha de obra em PDF e a app da oficina para a equipa.</li><li>Peças e viaturas importadas de PDF, Excel ou CSV.</li></ul>',
          `Vem nos planos com oficina e existe também como produto só de oficina — vê os preços em ${LINK(SIGNUP, 'app.fleetflow.systems')} ou pede-nos uma proposta.`,
        ],
        custom: [
          'Fazemos software à medida: ferramentas internas, portais para clientes, ligações entre os programas que já usas e agentes de IA que trabalham na tua operação.',
          'Conta-nos o que precisas e respondemos com uma proposta.',
        ],
        sites: [
          'Fazemos sites topo de gama com movimento — animação e 3D, como este — rápidos, em várias línguas e feitos à medida da tua marca. Também criamos avatares que falam pela tua empresa.',
          'Pede um orçamento e diz-nos o que tens em mente.',
        ],
        planner: 'O planeador mostra o dia ou a semana numa só vista, com as cargas ordenadas de norte a sul e separadas em Nacional, Ibérico e Internacional. Atribuis cargas a camiões e motoristas, e eles recebem-nas na app. No Só Planeador, no Transportador e nas Empresas grandes, o Orbit propõe o plano e tu aprovas.',
        exchange: 'A Bolsa de Cargas liga-te a empresas parceiras: passas as cargas que não consegues fazer e recebes as delas, na mesma plataforma. Vem no Transportador e nas Empresas grandes.',
        app: 'A app do motorista funciona em Android e iPhone: envias-lhe um link e ele instala-a num toque, sem equipamento extra no camião. O motorista vê as cargas do dia e fala contigo pelo chat; o GPS do telemóvel mostra onde está. O gestor tem a sua própria app para acompanhar tudo fora do escritório.',
        gps: 'Podes começar só com o GPS do telemóvel, através da app do motorista — não precisas de instalar nada no camião. Se já tens telemática, a FleetFlow liga-se à Cartrack; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara e Visirun estão em validação. (O plano Planeador Manual + Oficina não tem GPS.)',
        invoice: 'A FleetFlow prepara a fatura a partir das cargas feitas e envia-a como rascunho para o programa de faturação da tua empresa. As ligações ao InvoiceXpress, Moloni e PHC GO estão em validação. Uma pessoa confere e confirma — nada é emitido automaticamente.',
        ecmr: 'O e-CMR é a guia de transporte em formato digital. A FleetFlow preenche-o com os dados da carga — expedidor, destinatário, mercadoria e matrícula — e o PDF fica guardado junto da carga.',
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
        range: (t) => (t.max === Infinity ? 'de 1 000 ou mais veículos' : `dos ${t.min} aos ${t.max} veículos${t.master ? ' (Master)' : ''}`),
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
        price: 'How much?', benefits: 'What do I gain?', orbit: 'What is Orbit?', what: 'What does FleetFlow do?',
        integrations: 'Integrations', workshop: 'Workshop software', start: 'How to start', contact: 'Talk to a person',
        more: 'More topics', app: 'Driver app', ecmr: 'e-CMR', planner: 'Planner', exchange: 'Load Exchange',
        gps: 'GPS', invoice: 'Invoicing', security: 'Security and GDPR', contract: 'Contract and cancelling',
        import: 'Importing data', support: 'Support and training', sites: 'Websites with motion', custom: 'Custom software',
        where: 'Where are you?', about: 'Who are you?', menu: 'Another question', other: 'Another fleet size',
        demo: 'See the demo', signup: 'Create account',
        quoteSite: 'Get a website quote', quoteSoftware: 'Get a quote', quotePlatform: 'Ask for a proposal',
      },
      msg: {
        hello: "Hi! I'm the FleetFlow assistant — the complete TMS for transport companies. Ask me anything: prices for your fleet, Orbit, integrations, the workshop, how to start — or talk to the team.",
        menu: 'Sure. What would you like to know more about?',
        more: 'Here are more topics:',
        askFleet: 'How many trucks are in your fleet? Type the number or pick one below.',
        badFleet: "I didn't catch the number. Just type how many trucks you have — for example 25.",
        fallback: "I can't answer that one yet. Try other words — for example prices, Orbit, integrations or the workshop — or leave your contact and a person from the team will reply.",
        greet: 'Hi! How can I help?',
        thanks: "You're welcome! If you have another question, I'm here.",
        what: [
          'FleetFlow is a complete TMS for transport companies, all integrated in one platform:',
          "<ul><li><b>Planner</b> for the day or the week, with loads split into National, Iberian and International.</li><li><b>Loads and e-CMR</b>, filled in from the load data.</li><li><b>Driver and manager apps</b>, on Android and iPhone.</li><li><b>Fleet on the map</b>, from the phone's GPS or your telematics.</li><li><b>Workshop and parts stock</b>.</li><li><b>Load Exchange</b> to trade work with other companies.</li><li><b>Invoicing</b> connected to the software you already use.</li></ul>",
          'Orbit, our AI agent, proposes the plan and answers questions — you approve before it acts.',
        ],
        benefits: [
          'What you gain with FleetFlow:',
          '<ul><li><b>Less time planning</b> — the day or the week in one view, with loads sorted north to south.</li><li><b>Fewer empty kilometres</b> — Orbit proposes the plan with return loads in mind, and the Load Exchange helps fill trucks.</li><li><b>Everything in one place</b> — loads, e-CMR, drivers, map, workshop and stock, no loose spreadsheets.</li><li><b>Drivers kept informed</b> through the app, with fewer phone calls.</li><li><b>Invoices without retyping</b> — completed loads become drafts in your invoicing software.</li><li><b>Public prices</b>, from €150/month + VAT, monthly or yearly.</li></ul>',
          'The best way to see if it fits your company is to open the live demo.',
        ],
        orbit: [
          "Orbit is FleetFlow's AI agent. It knows your operation — loads, trucks, drivers and customers — and works with you:",
          '<ul><li><b>Proposes the plan</b> for the day or the week.</li><li><b>Answers questions</b> about the operation, for example which trucks are free tomorrow.</li><li><b>Prepares the work</b> for you to confirm.</li></ul>',
          'Nothing happens on its own: you see what it proposes and approve before it acts. It comes with Planner only, Carrier and Large companies; on the Manual Planner it only answers questions.',
        ],
        contact: `You can write to us at ${MAILTO} or leave your contact here — a person from the team will reply by email.`,
        where: [
          "We work online, with companies in Portugal and Spain: the platform runs in the browser and in the apps, so you don't need to travel anywhere.",
          `The company is FleetFlow Programação INF Unipessoal Lda (VAT no. PT519110790). To talk to us, write to ${MAILTO} or leave your contact here.`,
        ],
        about: [
          'FleetFlow was built inside a Portuguese transport company, for people who run trucks, drivers and loads every day.',
          'Besides the platform, we build workshop software, custom software and websites with motion. The company is FleetFlow Programação INF Unipessoal Lda (VAT no. PT519110790).',
        ],
        demo: `The ${LINK(DEMO, 'live demo')} opens the full platform with sample data, no sign-up needed. Explore freely — nothing you do touches real data.`,
        start: [
          `Create your account online at ${LINK(SIGNUP, 'app.fleetflow.systems')} in a few minutes and pick the plan by fleet size. The team approves the account and the subscription starts paid, monthly or yearly — there is no free trial.`,
          'Then you import drivers, vehicles and customers from Excel and send your drivers the app link, which installs in one tap.',
          `Before deciding, see the ${LINK(DEMO, 'live demo')}.`,
        ],
        import: [
          "You don't start from scratch: import drivers, vehicles and customers from Excel, and load plans can come in from a file too.",
          "In the workshop, parts and vehicles are imported from PDF, Excel or CSV, with a preview before saving. If your file has another format, send us a sample.",
        ],
        security: [
          "The data belongs to your company and is only used to provide the service.",
          '<ul><li>Main hosting in the European Union (Germany).</li><li>Encrypted connections, hashed passwords and encrypted integration credentials.</li><li>Each company is isolated from the others.</li><li>Tested backups.</li></ul>',
          `We process data under the GDPR — see the ${LINK(PRIVACY, 'Privacy Policy')}.`,
        ],
        support: [
          `You get user manuals in PDF, a guided introduction in every menu of the platform and help by email at ${MAILTO}.`,
          'For the initial setup — importing data, connecting GPS, getting drivers on the app — you can count on our help.',
        ],
        contract: [
          'You pay monthly or yearly, as you prefer; there is no free trial.',
          'No lock-in beyond the period already paid: cancel whenever you want and it takes effect at the end of the current month or year — you keep access until then. Partial months are not refunded.',
          `The details are in the ${LINK(TERMS, 'Terms')}.`,
        ],
        integrations: [
          'FleetFlow connects to what your company already uses. The statuses are real:',
          "<ul><li><b>GPS and telematics</b> — Cartrack available; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara and Visirun in validation. Or just the phone's GPS, through the driver app.</li><li><b>Invoicing</b> — InvoiceXpress, Moloni and PHC GO in validation. Sends drafts and a person confirms.</li><li><b>Payments</b> — Stripe.</li></ul>",
          'Using other software? Tell us which.',
        ],
        workshop: [
          'We have complete workshop software:',
          '<ul><li>Jobs per vehicle, appointment calendar and history.</li><li>Services, tyres and mileage with reminders.</li><li>Parts stock always counted and costs per vehicle.</li><li>Job sheet in PDF and the workshop app for the team.</li><li>Parts and vehicles imported from PDF, Excel or CSV.</li></ul>',
          `It comes with the plans that include the workshop and also as a workshop-only product — see prices at ${LINK(SIGNUP, 'app.fleetflow.systems')} or ask us for a proposal.`,
        ],
        custom: [
          'We build custom software: internal tools, customer portals, connections between the programs you already use and AI agents that work inside your operation.',
          'Tell us what you need and we will reply with a proposal.',
        ],
        sites: [
          'We build top-end websites with motion — animation and 3D, like this one — fast, multilingual and made to fit your brand. We also create avatars that speak for your company.',
          'Ask for a quote and tell us what you have in mind.',
        ],
        planner: 'The planner shows the day or the week in a single view, with loads sorted north to south and split into National, Iberian and International. You assign loads to trucks and drivers, and they get them in the app. On Planner only, Carrier and Large companies, Orbit proposes the plan and you approve.',
        exchange: "The Load Exchange connects you to partner companies: hand over the loads you can't cover and take on theirs, on the same platform. It comes with Carrier and Large companies.",
        app: "The driver app runs on Android and iPhone: you send the driver a link and it installs in one tap, with no extra hardware in the truck. Drivers see the day's loads and chat with you; the phone's GPS shows where they are. Managers have their own app to follow everything away from the office.",
        gps: "You can start with just the phone's GPS, through the driver app — nothing to install in the truck. If you already have telematics, FleetFlow connects to Cartrack; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara and Visirun are being validated. (The Manual Planner + Workshop plan has no GPS.)",
        invoice: "FleetFlow prepares the invoice from completed loads and sends it as a draft to your company's invoicing software. The connections to InvoiceXpress, Moloni and PHC GO are in validation. A person checks and confirms — nothing is issued automatically.",
        ecmr: 'The e-CMR is the consignment note in digital form. FleetFlow fills it in from the load data — sender, consignee, goods and plate — and the PDF is kept with the load.',
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
        price: '¿Cuánto cuesta?', benefits: '¿Qué gano con esto?', orbit: '¿Qué es Orbit?', what: '¿Qué hace FleetFlow?',
        integrations: 'Integraciones', workshop: 'Software de taller', start: 'Cómo empezar', contact: 'Hablar con una persona',
        more: 'Más temas', app: 'App del conductor', ecmr: 'e-CMR', planner: 'Planificador', exchange: 'Bolsa de Cargas',
        gps: 'GPS', invoice: 'Facturación', security: 'Seguridad y RGPD', contract: 'Contrato y cancelación',
        import: 'Importar datos', support: 'Soporte y formación', sites: 'Webs con movimiento', custom: 'Software a medida',
        where: '¿Dónde estáis?', about: '¿Quiénes sois?', menu: 'Otra pregunta', other: 'Otra flota',
        demo: 'Ver la demostración', signup: 'Crear cuenta',
        quoteSite: 'Pedir presupuesto de web', quoteSoftware: 'Pedir presupuesto', quotePlatform: 'Pedir propuesta',
      },
      msg: {
        hello: '¡Hola! Soy el asistente de FleetFlow, el TMS completo para empresas de transporte. Pregúntame lo que quieras — precios para tu flota, Orbit, integraciones, taller, cómo empezar — o habla con el equipo.',
        menu: 'Claro. ¿Sobre qué quieres saber más?',
        more: 'Aquí tienes más temas:',
        askFleet: '¿Cuántos camiones tiene tu flota? Escribe el número o elige uno abajo.',
        badFleet: 'No he entendido el número. Escribe solo cuántos camiones tienes — por ejemplo 25.',
        fallback: 'Todavía no sé responder a eso. Prueba con otras palabras — por ejemplo precios, Orbit, integraciones o el taller — o deja tu contacto y una persona del equipo te responderá.',
        greet: '¡Hola! ¿En qué te puedo ayudar?',
        thanks: '¡De nada! Si tienes otra pregunta, aquí estoy.',
        what: [
          'FleetFlow es un TMS completo para empresas de transporte, todo integrado en una sola plataforma:',
          '<ul><li><b>Planificador</b> del día o de la semana, con las cargas separadas en Nacional, Ibérico e Internacional.</li><li><b>Cargas y e-CMR</b>, rellenado con los datos de la carga.</li><li><b>App del conductor</b> y del gestor, en Android y iPhone.</li><li><b>Flota en el mapa</b>, con el GPS del móvil o tu telemática.</li><li><b>Taller y stock</b> de piezas.</li><li><b>Bolsa de Cargas</b> para intercambiar trabajo con otras empresas.</li><li><b>Facturación</b> conectada al programa que ya usas.</li></ul>',
          'Orbit, nuestro agente de IA, propone el plan y responde preguntas — tú apruebas antes de que actúe.',
        ],
        benefits: [
          'Lo que ganas con FleetFlow:',
          '<ul><li><b>Menos tiempo planificando</b> — el día o la semana en una sola vista, con las cargas ordenadas de norte a sur.</li><li><b>Menos kilómetros en vacío</b> — Orbit propone el plan pensando en los retornos y la Bolsa de Cargas ayuda a llenar camiones.</li><li><b>Todo en un solo sitio</b> — cargas, e-CMR, conductores, mapa, taller y stock, sin hojas sueltas.</li><li><b>Conductores informados</b> por la app, con menos llamadas.</li><li><b>Facturas sin volver a escribirlo todo</b> — las cargas hechas se convierten en borradores en tu programa de facturación.</li><li><b>Precios públicos</b>, desde 150 €/mes + IVA, mensual o anual.</li></ul>',
          'La mejor forma de ver si encaja en tu empresa es abrir la demostración en vivo.',
        ],
        orbit: [
          'Orbit es el agente de IA de FleetFlow. Conoce tu operación — cargas, camiones, conductores y clientes — y trabaja contigo:',
          '<ul><li><b>Propone el plan</b> del día o de la semana.</li><li><b>Responde preguntas</b> sobre la operación, por ejemplo qué camiones están libres mañana.</li><li><b>Prepara el trabajo</b> para que tú lo confirmes.</li></ul>',
          'Nada ocurre solo: ves lo que propone y apruebas antes de que actúe. Viene en Solo Planificador, Transportista y Grandes empresas; en el Planificador Manual solo responde preguntas.',
        ],
        contact: `Puedes escribirnos a ${MAILTO} o dejar aquí tu contacto — una persona del equipo te responderá por email.`,
        where: [
          'Trabajamos online, con empresas de Portugal y España: la plataforma funciona en el navegador y en las apps, así que no necesitas desplazarte.',
          `La empresa es FleetFlow Programação INF Unipessoal Lda (NIF PT519110790). Para hablar con nosotros escribe a ${MAILTO} o deja aquí tu contacto.`,
        ],
        about: [
          'FleetFlow se hizo dentro de una empresa de transporte portuguesa, para quien gestiona camiones, conductores y cargas cada día.',
          'Además de la plataforma, hacemos software de taller, software a medida y webs con movimiento. La empresa es FleetFlow Programação INF Unipessoal Lda (NIF PT519110790).',
        ],
        demo: `La ${LINK(DEMO, 'demostración en vivo')} abre la plataforma completa con datos de ejemplo, sin registro. Explora tranquilo — nada de lo que hagas toca datos reales.`,
        start: [
          `Creas la cuenta online en ${LINK(SIGNUP, 'app.fleetflow.systems')} en pocos minutos y eliges el plan según el tamaño de la flota. El equipo aprueba la cuenta y la suscripción empieza de pago, mensual o anual — no hay periodo de prueba gratis.`,
          'Después importas conductores, vehículos y clientes desde Excel y envías a los conductores el enlace de la app, que se instala con un toque.',
          `Antes de decidir, mira la ${LINK(DEMO, 'demostración en vivo')}.`,
        ],
        import: [
          'No empiezas de cero: importas conductores, vehículos y clientes desde Excel, y los planes de cargas también pueden entrar por archivo.',
          'En el taller, piezas y vehículos se importan desde PDF, Excel o CSV, con vista previa antes de guardar. Si tu archivo tiene otro formato, envíanos un ejemplo.',
        ],
        security: [
          'Los datos son de tu empresa y solo se usan para prestarte el servicio.',
          '<ul><li>Alojamiento principal en la Unión Europea (Alemania).</li><li>Conexiones cifradas, contraseñas guardadas con hashing y credenciales de las integraciones cifradas.</li><li>Cada empresa queda aislada de las demás.</li><li>Copias de seguridad probadas.</li></ul>',
          `Tratamos los datos conforme al RGPD — consulta la ${LINK(PRIVACY, 'Política de Privacidad')}.`,
        ],
        support: [
          `Tienes manuales de uso en PDF, una introducción guiada en cada menú de la plataforma y ayuda por email en ${MAILTO}.`,
          'En la configuración inicial — importar los datos, conectar el GPS, poner a los conductores en la app — cuentas con nuestra ayuda.',
        ],
        contract: [
          'Pagas mensual o anual, como prefieras; no hay periodo de prueba gratis.',
          'Sin permanencia más allá del periodo ya pagado: cancelas cuando quieras y la cancelación cuenta al final del mes o del año en curso — mantienes el acceso hasta entonces. No se reembolsan meses parciales.',
          `Los detalles están en los ${LINK(TERMS, 'Términos')}.`,
        ],
        integrations: [
          'FleetFlow se conecta a lo que tu empresa ya usa. Los estados son reales:',
          '<ul><li><b>GPS y telemática</b> — Cartrack disponible; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara y Visirun en validación. O solo el GPS del móvil, con la app del conductor.</li><li><b>Facturación</b> — InvoiceXpress, Moloni y PHC GO en validación. Envía borradores y una persona confirma.</li><li><b>Pagos</b> — Stripe.</li></ul>',
          '¿Usas otro programa? Dinos cuál.',
        ],
        workshop: [
          'Tenemos software de taller completo:',
          '<ul><li>Trabajos por vehículo, agenda de citas e historial.</li><li>Revisiones, neumáticos y kilómetros con avisos.</li><li>Stock de piezas siempre contado y gastos por vehículo.</li><li>Hoja de trabajo en PDF y la app del taller para el equipo.</li><li>Piezas y vehículos importados desde PDF, Excel o CSV.</li></ul>',
          `Viene en los planes con taller y existe también como producto solo de taller — mira los precios en ${LINK(SIGNUP, 'app.fleetflow.systems')} o pídenos una propuesta.`,
        ],
        custom: [
          'Hacemos software a medida: herramientas internas, portales para clientes, conexiones entre los programas que ya usas y agentes de IA que trabajan en tu operación.',
          'Cuéntanos qué necesitas y te respondemos con una propuesta.',
        ],
        sites: [
          'Hacemos webs de gama alta con movimiento — animación y 3D, como esta — rápidas, en varios idiomas y hechas a la medida de tu marca. También creamos avatares que hablan por tu empresa.',
          'Pide un presupuesto y cuéntanos qué tienes en mente.',
        ],
        planner: 'El planificador muestra el día o la semana en una sola vista, con las cargas ordenadas de norte a sur y separadas en Nacional, Ibérico e Internacional. Asignas cargas a camiones y conductores, y ellos las reciben en la app. En Solo Planificador, Transportista y Grandes empresas, Orbit propone el plan y tú apruebas.',
        exchange: 'La Bolsa de Cargas te conecta con empresas colaboradoras: pasas las cargas que no puedes hacer y recibes las suyas, en la misma plataforma. Viene en Transportista y Grandes empresas.',
        app: 'La app del conductor funciona en Android y iPhone: le envías un enlace y se instala con un toque, sin equipos extra en el camión. El conductor ve las cargas del día y habla contigo por el chat; el GPS del móvil muestra dónde está. El gestor tiene su propia app para seguirlo todo fuera de la oficina.',
        gps: 'Puedes empezar solo con el GPS del móvil, con la app del conductor — sin instalar nada en el camión. Si ya tienes telemática, FleetFlow se conecta a Cartrack; Frotcom, Webfleet, Geotab, Verizon Connect, Samsara y Visirun están en validación. (El plan Planificador Manual + Taller no tiene GPS.)',
        invoice: 'FleetFlow prepara la factura a partir de las cargas hechas y la envía como borrador al programa de facturación de tu empresa. Las conexiones con InvoiceXpress, Moloni y PHC GO están en validación. Una persona revisa y confirma — nada se emite automáticamente.',
        ecmr: 'El e-CMR es la carta de porte en formato digital. FleetFlow lo rellena con los datos de la carga — remitente, destinatario, mercancía y matrícula — y el PDF queda guardado con la carga.',
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
        range: (t) => (t.max === Infinity ? 'de 1 000 o más vehículos' : `de ${t.min} a ${t.max} vehículos${t.master ? ' (Master)' : ''}`),
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
  // Sem IA: cada tema tem palavras (PT/EN/ES, sem acentos). Uma palavra simples vale pelo início ("fatur" apanha
  // faturação, faturas…), "palavra$" só vale inteira e "duas palavras" vale como frase. ":n" muda o peso (3 por
  // omissão). Ganha o tema com mais pontos; num empate, o que vem primeiro (os mais específicos estão em cima).
  // Erros de escrita: uma letra trocada, a mais ou a menos numa palavra de 5+ letras conta metade.
  const INTENTS = [
    ['ecmr', 'cmr ecmr e-cmr:4 guia-de-transporte carta-de-porte consignment waybill guia$:2'],
    ['orbit', 'orbit:4 agente agent inteligencia-artificial ia$ ai$ artificial chatgpt robo:2 copiloto copilot'],
    ['exchange', 'bolsa:4 exchange troca-de-cargas intercambio-de-cargas load-board subcontrat parceir:2 partner:2 colaborador:2 cargas-de-retorno'],
    ['workshop', 'oficina:4 workshop:4 taller:4 mecanic mechanic revis:2 pneu neumatic tyre tire$ pecas:2 piezas:2 spare manutenc mantenim maintenance avaria averia repara garage garagem'],
    ['invoice', 'fatur factur invoice billing moloni:4 invoicexpress:4 phc:4 contabil accounting recibo:2'],
    ['gps', 'gps:4 cartrack:4 frotcom:4 webfleet:4 geotab:4 samsara:4 visirun:4 verizon:4 telemat track rastre localizacao:2 localizacion:2 location:2 mapa:2 map$:2 tempo-real:2 real-time:2 onde-esta-o-camiao:5 onde-estao-os-camioes:5 where-is-my-truck:5 donde-esta-el-camion:5 donde-estan-los-camiones:5'],
    ['import', 'importar:4 importacao:4 importacion:4 import$:4 importing:4 imports$:4 excel csv folha-de-calculo hoja-de-calculo spreadsheet planilha migra migrar:4 ficheiro:2 archivo:2 file$:2 dados-que-ja-tenho passar-os-dados'],
    ['security', 'segura:4 seguranca:4 seguridad:4 security:4 rgpd:4 gdpr:4 privac protecao-de-dados proteccion-de-datos data-protection encript cifrad encrypt backup copias-de-seguranca copias-de-seguridad hacker servidor:2 server:2 cloud:2 nuvem:2 nube:2 alojamento alojamiento hosting dados$:1 datos$:1 data$:1'],
    ['contract', 'contrato:4 contract:4 fideliz:4 cancel:4 rescind permanencia:4 lock-in:4 vinculo compromisso reembols refund baixa$:2 baja$:2 terminate renova:2 renew:2'],
    ['support', 'suporte:4 soporte:4 support:4 apoio:4 ayuda help$ ajuda formacao formacion training manual:2 manuais tutorial como-se-usa aprender:2 assistencia asistencia'],
    ['sites', 'site$:4 sites$:4 website:4 web$:4 webs$:4 pagina-web landing animac animacion animation 3d$ avatar:4 avatares:4 avatars:4 loja-online tienda-online'],
    ['custom', 'a-medida:4 por-medida:4 a-la-medida:4 medida:3 custom:4 bespoke desenvolv desarroll develop:2 programa-proprio software-proprio feito-para-nos'],
    ['app', 'app$ apps$ aplicac aplicat motorista conductor chofer driver telemovel movil android iphone ios$ smartphone'],
    ['planner', 'planea planif planner planning schedul escala$:2 nacional:2 iberic internacional:2 semana:1 week:1 rotas:2 rutas:2 routes:2'],
    ['integrations', 'integra:4 ligacoes:4 ligacao:4 liga-se conect connect api$ erp$ sage:2 primavera:2 outros-programas otros-programas other-software programas:2'],
    ['demo', 'demo$:4 demos$:4 demonstr:4 demostr:4 experiment:2 testar:2 probar:2 try$:2 ver-como-funciona see-it'],
    ['start', 'comec:4 comecar:4 empez:4 start:4 sign-up signup:4 regist:3 criar-conta crear-cuenta create-account abrir-conta conta$:3 cuenta$:3 account:3 onboard implement quanto-tempo cuanto-tiempo how-long arranque contratar:2 aderir:2 subscrever:2 gratis:2 free:2 trial:2 periodo-de-teste'],
    ['price', 'preco:4 precos:4 precio:4 price:4 pricing:4 custa:4 custo$:3 custos$:3 cuesta:4 cuanto:3 quanto:2 quanto-custa:4 how-much:4 cost$:3 costs$:3 mensalidade mensualidad tarifa plano:2 planes:2 plan$:2 plans$:2 valor:2 orcamento:2 presupuesto:2 caro:2 barato:2 expensive cheap pagar:1 pago$:1 euros:2 iva$:1'],
    ['benefits', 'ganho:4 ganhar:4 ganhamos:4 ganar:4 gano$:4 gain:4 vantag:4 ventaj:4 advantage:4 benefic:4 benefit:4 vale-a-pena:4 worth:4 para-que-serve:4 para-que-sirve:4 why-fleetflow:4 why-should porque:1 por-que:1 why$:1 contratar:1 poupar poupanca ahorr save$:2 saving:2 rentab roi$ melhorar mejorar improve'],
    ['contact', 'contact:4 contato:4 email:3 e-mail:3 mail$:2 telefone:3 telefono:3 phone:3 numero-de-telefone ligue-me liguem ligar-me ligar-vos call$:3 llamar:3 llamad falar-com:3 hablar:3 talk-to:3 humano:3 human:3 pessoa:3 persona:3 person:3 comercial:3 vendedor:3 sales:3 whatsapp:3 reuniao:3 reunion:3 meeting:3'],
    ['where', 'onde$:3 donde$:3 where$:3 encontr:3 morada:4 direccion:4 address:4 sede:3 escritorio:3 instalacoes:3 located:3 ubicad:3 ubicacion:3 visitar:3 visit$:3 presencial:3 portugal:1 espanha:1 espana:1 spain:1 pais$:1 country:1'],
    ['about', 'quem-sao:4 quem-e-a-fleetflow:4 quem-esta-por-tras:4 who-are-you:4 who-is-behind:4 quienes-sois:4 quienes-son:4 sobre-vos:4 sobre-voces:4 about-you:4 historia:2 fundad:2 founder:2 fundador:2 nif$:3 empresa-por-tras:4'],
    ['what', 'o-que-e:1 o-que-faz:2 o-que-fazem:2 what-is:1 what-does:2 que-es:1 que-hace:2 que-haceis:2 funcionalidade:2 funcionalidad:2 feature:2 modulo:2 tms$:3 plataforma:1 platform:1 explica:1 explain:1'],
    ['greet', 'ola$:2 oi$:2 hello$:2 hi$:2 hey$:2 hola$:2 bom-dia:2 boa-tarde:2 boa-noite:2 buenos-dias:2 buenas:2 good-morning:2'],
    ['thanks', 'obrigad:2 gracias:2 thank:2 thanks:2 valeu:2 perfeito:1 perfecto:1'],
  ].map(([key, words]) => ({
    key,
    terms: words.split(/\s+/).map((w) => {
      const [word, weight] = w.split(':');
      const exact = word.endsWith('$');
      const text = (exact ? word.slice(0, -1) : word).replace(/-/g, ' ');
      return { text, exact, phrase: text.includes(' '), weight: weight ? Number(weight) : 3 };
    }),
  }));
  const FLEET_WORDS = /cami|truck|lorr|veic|vehic|viatur|frota|fleet|flota/;

  const norm = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  // Distância de edição limitada a 1 (chega para "faturaçao", "contatos", "preçso").
  function nearlyEqual(a, b) {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
    return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
  }

  function termScore(term, words, padded) {
    if (term.phrase) return padded.includes(` ${term.text} `) ? term.weight : 0;
    let best = 0;
    for (const w of words) {
      if (term.exact ? w === term.text : w.startsWith(term.text)) return term.weight;
      if (term.text.length >= 5 && w.length >= 5) {
        const k = term.text.length;
        const fuzzy = term.exact
          ? nearlyEqual(w, term.text)
          : [k - 1, k, k + 1].some((n) => n <= w.length && nearlyEqual(w.slice(0, n), term.text));
        if (fuzzy) best = Math.max(best, term.weight / 2);
      }
    }
    return best;
  }

  /** O tema da frase (ou null) e os pontos. */
  function classify(text) {
    const s = norm(text).replace(/\d+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s) return { key: null, score: 0 };
    const words = s.split(' ');
    const padded = ` ${s} `;
    let best = { key: null, score: 0 };
    for (const intent of INTENTS) {
      let score = 0;
      for (const term of intent.terms) score += termScore(term, words, padded);
      if (score > best.score) best = { key: intent.key, score };
    }
    return best;
  }

  function parseFleet(text) {
    const m = text.match(/\d{1,3}(?:[.\s ,]\d{3})+|\d+/);
    return m ? parseInt(m[0].replace(/\D/g, ''), 10) : null;
  }

  // ---------- Estado e desenho ----------

  const lang = () => {
    const l = (document.documentElement.lang || 'pt').slice(0, 2);
    return T[l] ? l : 'pt';
  };
  // O menu principal e o segundo ("Mais temas").
  const TOPIC_CHIPS = ['price', 'benefits', 'orbit', 'integrations', 'workshop', 'start', 'contact', 'more'];
  const MORE_CHIPS = ['what', 'app', 'planner', 'ecmr', 'exchange', 'security', 'contract', 'import', 'support', 'sites', 'custom', 'where', 'menu'];
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

  function botHtml(key, l) {
    const m = T[l].msg[key];
    const parts = Array.isArray(m) ? m : [m];
    return parts.map((p) => (p.startsWith('<ul') ? p : `<p>${p}</p>`)).join('');
  }

  function renderEntry(entry, l) {
    const li = document.createElement('li');
    li.className = `ffa-msg ffa-msg--${entry.who}`;
    if (entry.who === 'user') {
      // O que a pessoa escreveu vai sempre como texto, nunca como HTML.
      li.textContent = entry.text ?? (entry.key === 'fleet' ? T[l].trucks(entry.n) : T[l].chips[entry.key]);
    } else {
      // As respostas do assistente são textos fixos deste ficheiro (com links nossos).
      li.innerHTML = entry.key === 'price' ? priceHtml(entry.n, l) : botHtml(entry.key, l);
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
        const link = c === 'demo' ? DEMO : c === 'signup' ? SIGNUP : null;
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

  // Sugestões depois de cada tema.
  const FOLLOW = {
    what: ['benefits', 'orbit', 'price', 'demo', 'menu'],
    benefits: ['orbit', 'price', 'demo', 'contact', 'menu'],
    orbit: ['benefits', 'price', 'demo', 'menu'],
    about: ['what', 'where', 'contact', 'menu'],
    demo: ['demo', 'signup', 'price', 'menu'],
    start: ['demo', 'signup', 'import', 'contract', 'menu'],
    import: ['start', 'support', 'contact', 'menu'],
    security: ['contract', 'support', 'contact', 'menu'],
    support: ['start', 'import', 'contact', 'menu'],
    contract: ['price', 'start', 'demo', 'menu'],
    integrations: ['gps', 'invoice', 'contact', 'menu'],
    gps: ['integrations', 'app', 'price', 'menu'],
    invoice: ['integrations', 'price', 'contact', 'menu'],
    workshop: ['quotePlatform', 'import', 'price', 'menu'],
    custom: ['quoteSoftware', 'sites', 'contact', 'menu'],
    sites: ['quoteSite', 'custom', 'contact', 'menu'],
    planner: ['orbit', 'price', 'demo', 'menu'],
    exchange: ['price', 'demo', 'menu'],
    app: ['gps', 'price', 'demo', 'menu'],
    ecmr: ['app', 'price', 'demo', 'menu'],
    greet: TOPIC_CHIPS,
    thanks: ['contact', 'demo', 'menu'],
  };
  // Temas que também abrem o formulário de contacto.
  const WITH_LEAD = new Set(['contact', 'where']);
  // Chips que abrem a janela "Pedir orçamento" (js/pedido.js) já com o serviço escolhido.
  const QUOTE = { quoteSite: 'site', quoteSoftware: 'software', quotePlatform: 'platform' };

  function answerTopic(key) {
    setAwaitingFleet(false);
    if (key === 'price') return askFleet();
    state.topics.add(key);
    if (WITH_LEAD.has(key)) return showLead(key);
    say({ who: 'bot', key });
    setChips(FOLLOW[key] || ['price', 'contact', 'demo', 'menu']);
  }

  function menu(more) {
    setAwaitingFleet(false);
    say({ who: 'bot', key: more ? 'more' : 'menu' });
    setChips(more ? MORE_CHIPS : TOPIC_CHIPS);
  }

  function route(text) {
    const s = norm(text);
    const n = parseFleet(text);
    const { key: topic } = classify(text);
    const bare = /^\s*[\d.\s ,]+\s*$/.test(text);
    const fleetWords = FLEET_WORDS.test(s);
    // Um número conta como frota se é só o número, se fala de camiões/frota ou de preço, ou se estávamos à espera
    // dele e a frase não é sobre outro tema.
    if (n !== null && (bare || fleetWords || topic === 'price' || (state.awaitingFleet && !topic))) return answerPrice(n);
    if (topic) return answerTopic(topic);
    // À espera da frota e a pessoa fala de camiões sem número: pede outra vez. Qualquer outra coisa sai do modo frota.
    if (state.awaitingFleet && fleetWords) return answerPrice(NaN);
    setAwaitingFleet(false);
    say({ who: 'bot', key: 'fallback' });
    setChips(['contact', ...TOPIC_CHIPS.filter((c) => c !== 'contact')]);
  }

  function onChip(c) {
    const n = Number(c);
    if (Number.isInteger(n) && n > 0) {
      say({ who: 'user', key: 'fleet', n });
      answerPrice(n);
    } else if (QUOTE[c]) {
      // A janela de orçamento abre por cima de tudo; o painel fecha para não ficar por trás.
      if (window.FFPedido?.open) {
        close();
        window.FFPedido.open(QUOTE[c]);
        return;
      }
      say({ who: 'user', key: c });
      showLead('contact');
    } else {
      say({ who: 'user', key: c });
      if (c === 'menu') menu(false);
      else if (c === 'more') menu(true);
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

  function showLead(key = 'contact') {
    state.topics.add('contact');
    say({ who: 'bot', key });
    if (!lead || state.sent) buildLead();
    setChips(key === 'where' ? ['demo', 'about', 'menu'] : ['demo', 'price', 'menu']);
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
    const TOPIC_PT = T.pt.chips;
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
