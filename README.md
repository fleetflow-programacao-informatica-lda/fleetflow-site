# FleetFlow — Site (fleetflow.one)

Site público da FleetFlow. Estático, sem build.

## Estrutura
```
/
├── index.html          ← Experiência 3D (a versão em uso) — Three.js via CDN
├── brand/              ← logótipo oficial
└── landing/            ← Landing detalhada anterior (guardada; PT/EN/ES, secções completas)
```

- **Raiz (`index.html`)** — a experiência cinematográfica 3D (globo → cidade neon), PT/EN/ES.
- **`landing/`** — a landing anterior com todas as secções (o problema, 3 destinos, como funciona, operação diária, etc.). Mantida como alternativa/reversão.

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
