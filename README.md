# FleetFlow — Site (fleetflow.one)

Site público da FleetFlow. Estático, sem build.

## Estrutura
```
/
├── index.html          ← EM USO — landing "mãos de IA" (canvas de partículas, Orbit)
├── styles.css · js/ · assets/ (points.bin, brain.bin) · fonts/ (geist) · og.png
├── tunel.css · js/tunel.js · assets/trabalho/ (21 cartões .webp) · vendor/ (three.js MIT, minificado)
├── mundo-real/         ← versão vídeo (drone) anterior — reversão
├── v2/                 ← experiência 3D néon — reversão
├── v1/                 ← experiência 3D v1 — reversão
├── brand/              ← logótipo oficial
└── landing/            ← landing clássica — reversão
```

- **Raiz (`index.html`)** — landing escura com motor de partículas em canvas (duas mãos que se formam, reagem ao rato e se transformam em 3 cenas de scroll, terminando num cérebro). Copy FleetFlow + agente de IA **Orbit**. Botões → `app.fleetflow.systems`. i18n PT/EN/ES, fontes locais (RGPD), rodapé legal. Base: template Sorvine (HorizonX), adaptado (azul→verde #31e0a0, textos nossos). HTML/CSS/JS puro, sem libs.
- **Túnel "O que fazemos"** (22/11, última cena da raiz) — cartões a passar num túnel: avatares para empresas, sites com movimento, software e agentes. Motor: *Tunnel Fold Slider* da HorizonX (licença: publicar sites sim, revender o código não), em `js/tunel.js` com o three.js servido pelo próprio site (`vendor/three.min.js`, sem pedidos a terceiros) e só carregado quando a secção se aproxima. Fotos de pessoas = **fictícias**, geradas no Higgsfield (luz natural, sem néons — pedido do founder); o resto são capturas dos nossos sites e da plataforma de demonstração (dados de demo). Trocar/acrescentar cartões: `.webp` 660×880 em `assets/trabalho/` + a lista `TRABALHO` em `js/tunel.js` + o `<ol class="tf-sr">` do `index.html`.
- **`medusas/`** — landing das medusas ASCII (21/11), retirada a pedido do founder; mantida como reversão.
- **`mundo-real/`**, **`v2/`**, **`v1/`**, **`landing/`** — versões anteriores, mantidas como reversão.

## Publicação (Netlify)
Site estático, publish directory = **raiz**. Ligado ao GitHub (`fleetflow-programacao-informatica-lda/fleetflow-site`, **público**) → cada `git push` publica automaticamente em `fleetflow.one`. **Não** voltar a pôr o repo privado na org sem Netlify Pro.

## Domínio & email
`fleetflow.one` (DNS gerido no Replit) · email via Mailgun. **Não** mexer nesses registos.
