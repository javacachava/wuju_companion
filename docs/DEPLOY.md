# DEPLOY

> Cómo se despliega El Compañero en producción: VPS propio + dominio del equipo. No se usa Vercel/Netlify para la app porque SQLite necesita disco persistente y el filesystem serverless es efímero.

## Arquitectura de producción

```
Internet
  │
  ├── https://<dominio>            → Caddy → localhost:3000 (Next.js: landing + companion + marketplace + API)
  └── https://<instancia>.app.n8n.cloud   → n8n Cloud (workflows; alternativa: n8n.<dominio> en el VPS)
```

- **App completa** (landing, companion, marketplace, todos los `/api/*`): un solo proceso `next start` en el VPS.
- **SQLite**: archivo en ruta persistente del VPS, fuera del directorio del build.
- **n8n**: n8n Cloud con el cupón Pro del hackathon (recomendado) o Docker en el mismo VPS (ver `docs/N8N.md`).

## Setup del VPS (una sola vez)

```bash
# 1. Node 20+ y herramientas
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && sudo apt install -y nodejs
npm i -g pnpm pm2

# 2. Directorio persistente para la DB
sudo mkdir -p /var/lib/companero && sudo chown $USER /var/lib/companero

# 3. Código
git clone https://github.com/javacachava/wuju_companion.git ~/companero && cd ~/companero
cp .env.example .env
# Editar .env:
#   DATABASE_URL="file:/var/lib/companero/prod.db"
#   NEXT_PUBLIC_APP_URL=https://<dominio>
#   OPENAI_API_KEY, ELEVENLABS_API_KEY, N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET

# 4. Build + DB
pnpm install
pnpm prisma migrate deploy --schema prisma/schema.prisma
pnpm db:seed
pnpm build

# 5. Proceso con pm2 (revive tras reboot)
pm2 start --name companero "pnpm --filter web start"
pm2 save && pm2 startup

# 6. HTTPS con Caddy (TLS automático vía Let's Encrypt)
sudo apt install -y caddy
```

`/etc/caddy/Caddyfile`:
```
<dominio> {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

## DNS

En el registrador del dominio: registro `A` de `<dominio>` → IP del VPS. (Si n8n va en el VPS: otro `A` para `n8n.<dominio>`.)

## Re-deploy (cada actualización)

```bash
cd ~/companero
git pull
pnpm install
pnpm prisma migrate deploy --schema prisma/schema.prisma
pnpm build
pm2 restart companero
```

El seed NO se corre en re-deploys (pisaría monedas/inventario del demo). Solo en el primer deploy o para resetear el demo antes del pitch.

## Checklist antes del pitch

- [ ] `https://<dominio>` carga la landing
- [ ] `/companion` crea personaje con el nombre `demo`
- [ ] `/marketplace` muestra catálogo y el checkout compra con saldo
- [ ] `/api/audit` con código vulnerable dispara la alerta a Discord (track n8n)
- [ ] TTS suena (créditos de ElevenLabs disponibles)
- [ ] `pm2 status` verde y `pm2 logs companero` sin errores en loop
