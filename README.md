# FleetFlow — Site (fleetflow.one)

Site público da FleetFlow. Estático, sem build.

## Estrutura
```
/
├── index.html          ← "Mundo Real" (EM USO) — filme real (Higgsfield) a fazer scrub com o scroll
├── assets/             ← journey.mp4 (a viagem), poster.png, loader-truck.png
├── fonts/              ← Space Grotesk + IBM Plex Mono locais (RGPD, sem Google)
├── og.png              ← cartão social
├── v2/                 ← Experiência 3D néon (partículas GPU) — reversão
├── v1/                 ← Experiência 3D v1 — reversão
├── brand/              ← logótipo oficial
└── landing/            ← Landing clássica (PT/EN/ES, secções completas) — reversão
```

- **Raiz (`index.html`)** — experiência realista e cinematográfica: espaço → avião → campo → camião → restaurante → empresa de software, tudo num vídeo real (`assets/journey.mp4`) controlado pelo scroll. Loader com a frente de um camião cujos faróis acendem no fim. Conteúdo: Transporte (agente IA Orbit), Oficina, Software & Sites. i18n PT/EN/ES. Sem GPS/CMR no copy.
- **`v2/`**, **`v1/`**, **`landing/`** — versões anteriores, mantidas como reversão.

## Correr localmente
```bash
npx serve . -l 4321      # experiência 3D  → http://localhost:4321
npx serve landing -l 4322  # landing detalhada → http://localhost:4322
```

## Publicação (Netlify)
Site estático. O `publish directory` é a **raiz** (serve a experiência 3D).
Ligado ao Netlify → cada `git push` publica automaticamente em `fleetflow.one`.

> A experiência 3D carrega o Three.js de CDN (esm.sh) — precisa de internet.

## Domínio & email
`fleetflow.one` (DNS gerido no Replit) · email via Mailgun. **Não** mexer nesses registos.
