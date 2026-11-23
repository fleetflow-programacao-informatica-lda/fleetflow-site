// Light / dark theme (23/11). Light is the default; the visitor's choice is
// kept as ff.theme ("light" / "dark", the same key the app uses). The tiny
// script in <head> sets data-theme="dark" before first paint, so there is no
// flash; this file runs the moon / sun button in the nav and keeps its label
// in the page language. The canvases (js/particles.js, js/nav-dust.js,
// js/tunel.js) watch data-theme on <html> and repaint themselves.
// prefers-color-scheme is deliberately not followed: only the button switches.
(() => {
  'use strict';

  const KEY = 'ff.theme';
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-theme-toggle]')];
  // What the button does next, in the page language.
  const LABELS = {
    pt: { dark: 'Mudar para modo escuro', light: 'Mudar para modo claro' },
    en: { dark: 'Switch to dark mode', light: 'Switch to light mode' },
    es: { dark: 'Cambiar a modo oscuro', light: 'Cambiar a modo claro' },
  };

  const current = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  function label() {
    const words = LABELS[(root.lang || 'pt').slice(0, 2)] || LABELS.pt;
    const text = words[current() === 'dark' ? 'light' : 'dark'];
    for (const button of buttons) {
      button.setAttribute('aria-label', text);
      button.title = text;
    }
  }

  function apply(theme, save) {
    root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    if (save) {
      try {
        localStorage.setItem(KEY, current());
      } catch (e) {
        /* private mode or blocked storage: the switch still works for this page */
      }
    }
    label();
  }

  for (const button of buttons) {
    button.addEventListener('click', () => apply(current() === 'dark' ? 'light' : 'dark', true));
  }

  // Another tab switched: follow it.
  window.addEventListener('storage', (event) => {
    if (event.key === KEY && (event.newValue === 'dark' || event.newValue === 'light')) apply(event.newValue, false);
  });

  // The i18n script changes <html lang>: relabel the button.
  new MutationObserver(label).observe(root, { attributes: true, attributeFilter: ['lang'] });

  apply(current(), false);
})();
