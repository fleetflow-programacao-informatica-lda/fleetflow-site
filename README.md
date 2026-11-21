# FleetFlow — Site (fleetflow.one)

Site público da FleetFlow. Estático, sem build.

## Estrutura
```
/
├── index.html          ← EM USO — landing "medusas" (ASCII ao vivo em canvas, caixa do Orbit, serviços)
├── fonts/ (geist) · og.png
├── maos/               ← landing "mãos de IA" (partículas) — reversão
├── mundo-real/         ← versão vídeo (drone) anterior — reversão
├── v2/                 ← experiência 3D néon — reversão
├── v1/                 ← experiência 3D v1 — reversão
├── brand/              ← logótipo oficial
└── landing/            ← landing clássica — reversão
```

- **Raiz (`index.html`)** — landing escura com medusas desenhadas ao vivo em caracteres ASCII (reagem ao rato e a quem escreve), título rotativo com o que o Orbit faz, caixa "Pergunta ao Orbit" (não envia nada: convida a entrar na plataforma), Aprende · Raciocina · Age e **O que fazemos** (software à medida, sites, plataforma FleetFlow + contacto). Botões → `app.fleetflow.systems`. i18n PT/EN/ES, fonte local (RGPD), sem bibliotecas nem pedidos a terceiros, pausa de movimento + `prefers-reduced-motion`. Base: template Kurage Dashboard (HorizonX, licença comercial da conta — pode-se publicar o site, não revender o template), adaptado às cores e textos FleetFlow. Um só ficheiro, sem build. O mesmo motor das medusas está no fundo da página de entrada de app.fleetflow.systems.
- **`maos/`** — landing "mãos de IA" (template Sorvine, partículas) que esteve no ar até 21/11/2026.
- **`mundo-real/`**, **`v2/`**, **`v1/`**, **`landing/`** — versões anteriores, mantidas como reversão.

## Publicação (Netlify)
Site estático, publish directory = **raiz**. Ligado ao GitHub (`fleetflow-programacao-informatica-lda/fleetflow-site`, **público**) → cada `git push` publica automaticamente em `fleetflow.one`. **Não** voltar a pôr o repo privado na org sem Netlify Pro.

## Domínio & email
`fleetflow.one` (DNS gerido no Replit) · email via Mailgun. **Não** mexer nesses registos.
