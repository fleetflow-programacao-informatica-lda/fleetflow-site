# FleetFlow — Site (fleetflow.one)

Site público da FleetFlow. Estático, sem build.

## Estrutura
```
/
├── index.html          ← Experiência 3D v2 (EM USO) — 42k partículas GPU morph, Three.js via CDN
├── v1/                 ← Experiência 3D v1 anterior (guardada como reversão)
├── brand/              ← logótipo oficial
└── landing/            ← Landing detalhada anterior (guardada; PT/EN/ES, secções completas)
```

- **Raiz (`index.html`)** — a experiência v2: uma nuvem de partículas que se transforma (globo → cidade → camião frigorífico → escritório → logo »»»). Só PT por agora. Autónoma — sem assets locais, só CDN.
- **`v1/`** — a versão anterior (objetos separados). **`landing/`** — a landing clássica com todas as secções. Ambas mantidas como alternativa/reversão.

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
