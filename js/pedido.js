// "Pedir orçamento" (22/11): abre a janela, envia o pedido à plataforma (que o manda para o email da FleetFlow) e
// mostra o resultado. Os textos vêm do i18n da página (data-i18n). Se o envio falhar, o pedido não se perde: a
// mensagem de erro traz um email já preenchido com tudo o que a pessoa escreveu.
(() => {
  'use strict';
  const ENDPOINT = 'https://app.fleetflow.systems/api/public/pedido-orcamento';
  const FALLBACK_EMAIL = 'support@fleetflow.systems';

  // O envio e o email de recurso servem também o assistente do site (js/assistente.js, via window.FFPedido).
  // text/plain e sem cookies: pedido simples para outro domínio (a plataforma só deixa este site ler a resposta).
  const send = (p) =>
    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(p),
    });
  const mailto = (subject, lines) =>
    `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  window.FFPedido = { send, mailto };

  const dialog = document.getElementById('pedido');
  if (!dialog || typeof dialog.showModal !== 'function') return; // browser muito antigo: os botões continuam a ser links de email

  const form = dialog.querySelector('form');
  const fleet = form.querySelector('[data-only="platform"]');
  const submit = form.querySelector('button[type="submit"]');
  const msgs = { ok: form.querySelector('[data-msg="ok"]'), err: form.querySelector('[data-msg="err"]'), invalid: form.querySelector('[data-msg="invalid"]') };
  const errLink = msgs.err.querySelector('a');

  const showMsg = (which) => Object.entries(msgs).forEach(([k, el]) => (el.hidden = k !== which));
  const syncFleet = () => (fleet.hidden = form.elements.service.value !== 'platform');

  function open(service) {
    form.classList.remove('is-sent');
    if (service && form.querySelector(`input[name="service"][value="${service}"]`)) form.elements.service.value = service;
    syncFleet();
    showMsg(null);
    if (!dialog.open) dialog.showModal();
  }
  window.FFPedido.open = open; // o assistente abre a janela já com o serviço escolhido

  document.querySelectorAll('[data-pedido]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open(el.getAttribute('data-pedido'));
    })
  );
  dialog.querySelector('.pedido__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => e.target === dialog && dialog.close()); // clicar fora fecha
  form.addEventListener('change', (e) => e.target.name === 'service' && syncFleet());

  function payload() {
    const f = form.elements;
    return {
      service: f.service.value,
      name: f.name.value,
      email: f.email.value,
      company: f.company.value,
      phone: f.phone.value,
      fleetSize: f.service.value === 'platform' ? f.fleetSize.value : '',
      message: f.message.value,
      lang: (document.documentElement.lang || 'pt').slice(0, 2),
      website: f.website.value,
    };
  }

  function mailtoFor(p) {
    const service = form.querySelector('input[name="service"]:checked')?.closest('label')?.querySelector('strong')?.textContent || p.service;
    return mailto(service, [service, p.name, p.company, p.email, p.phone, p.fleetSize, '', p.message].filter((v, i) => v || i === 6));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const p = payload();
    submit.disabled = true;
    showMsg(null);
    try {
      const r = await send(p);
      if (r.ok) {
        // Enviado: o formulário dá lugar à confirmação (no telemóvel a mensagem ficava fora do ecrã).
        form.reset();
        form.classList.add('is-sent');
        showMsg('ok');
        form.scrollTop = 0;
        requestAnimationFrame(syncFleet); // o reset devolve o "Site" marcado só depois deste ciclo
      } else if (r.status === 400) {
        showMsg('invalid');
      } else {
        throw new Error(String(r.status));
      }
    } catch {
      errLink.href = mailtoFor(p);
      showMsg('err');
    } finally {
      submit.disabled = false;
    }
  });

  if (location.hash === '#pedido') open();
})();
