# FleetFlow — Landing pública (`fleetflow.one`)

Landing comercial da FleetFlow. **Estática, sem build, sem dependências** — HTML + CSS + SVG e um ficheiro de JS vanilla. Pensada para `fleetflow.one` (marketing), totalmente separada de `app.fleetflow.systems` (operação).

## Estrutura
```
fleetflow-landing/
├── index.html        # página única (sprite SVG inline: logo, avatares Orbit, ícones)
├── assets/
│   ├── styles.css    # design system dark-only + animações (CSS/SVG)
│   ├── i18n.js       # traduções PT / EN / ES + seletor de idioma
│   └── main.js       # intro, scroll-reveal, header sticky, avatares aleatórios
└── README.md
```

## Idiomas (i18n)
Site totalmente traduzido em **PT · EN · ES**, sem dependências:
- Texto marcado com `data-i18n="chave"`; dicionários em `assets/i18n.js`.
- Seletor **PT / EN / ES** no header (visível também em mobile).
- Idioma inicial: `localStorage` → idioma do browser → PT. Persiste a escolha.
- Traduz também `<title>`, `meta description`, Open Graph e `<html lang>` (bom para SEO multilíngue).
- Para adicionar/editar texto: alterar as 3 entradas da chave em `i18n.js` (PT default fica no HTML para quem tem JS desligado).

## Pré-visualizar localmente
Qualquer servidor estático serve. Exemplos:
```bash
npx serve fleetflow-landing -l 4321
# ou
python -m http.server 4321 -d fleetflow-landing
```
Abrir `http://localhost:4321`.

> Não há `npm run build` — é estático. Para publicar, basta copiar a pasta para qualquer host (Vercel, Netlify, Cloudflare Pages, S3, Nginx…) e apontar `fleetflow.one`.

## Ligações para o ecossistema
- **Entrar / Entrar na Plataforma** → `https://app.fleetflow.systems`
- **Bolsa de Cargas** → `https://app.fleetflow.systems/bolsa`
- **Pedir Demonstração** → `mailto:fleetflow.one@gmail.com`

A landing **vende**; a app **executa**. Não há funcionalidade operacional dentro da landing — por design.

## Substituir pelo logo / avatares oficiais
Tudo é recriado em SVG inline para fidelidade de marca e zero pedidos extra. Para usar os ficheiros oficiais:

- **Logo:** colocar `logo.svg` em `assets/` e substituir o `<symbol id="ff-mark">` no topo de `index.html` (ou trocar os `<use href="#ff-mark"/>` por `<img src="assets/logo.svg">`).
- **Avatares Orbit:** os `<symbol id="av-*">` recriam Astronauta, Raposa, Radar, Coruja, Minimal e Camião. Substituir cada `<symbol>` pelo SVG oficial correspondente mantém todo o resto a funcionar (a seleção aleatória usa os ids `av-*` em `main.js`).

## Performance / acessibilidade
- Sem vídeos, sem canvas, sem bibliotecas de animação. Apenas CSS/SVG + `IntersectionObserver`.
- Respeita `prefers-reduced-motion` (intro e animações desligam).
- Fonte Inter via Google Fonts com `display=swap` (não bloqueia render).
- Avatares decorativos nunca bloqueiam texto, botões ou navegação.
