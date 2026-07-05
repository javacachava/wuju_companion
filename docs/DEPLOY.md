# DEPLOY

> Cómo se despliega El Compañero en producción: VPS propio + dominio del equipo, PostgreSQL para persistencia y DataMCP como gateway MCP seguro para herramientas de IA.

## Arquitectura de producción

```
Internet
  │
  ├── https://<dominio>            → Caddy → localhost:3000 (Next.js: landing + companion + marketplace + API)
  ├── postgresql://...             → PostgreSQL (VPS o proveedor gestionado)
  ├── https://api.datamcp.app/...  → DataMCP (gateway MCP hacia PostgreSQL)
  └── https://<instancia>.app.n8n.cloud   → n8n Cloud (workflows; alternativa: n8n.<dominio> en el VPS)
```

- **App completa** (landing, companion, marketplace, todos los `/api/*`): un solo proceso `next start` en el VPS.
- **PostgreSQL**: DB persistente local en el VPS o gestionada (Neon, Supabase, RDS, etc.).
- **DataMCP**: no reemplaza `DATABASE_URL`; se conecta al mismo PostgreSQL y expone schema/query vía MCP con permisos.
- **n8n**: n8n Cloud con el cupón Pro del hackathon (recomendado) o Docker en el mismo VPS (ver `docs/N8N.md`).

## Setup del VPS (una sola vez)

```bash
# 1. Node 20+ y herramientas
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && sudo apt install -y nodejs
npm i -g pnpm pm2

# 2. PostgreSQL
# Decisión actual del equipo: Supabase (proyecto ya creado y seedeado).
# Usar el SESSION POOLER (IPv4) — la conexión directa db.<ref>.supabase.co es IPv6-only:
#   DATABASE_URL="postgresql://postgres.<ref>:<password-url-encoded>@aws-1-<region>.pooler.supabase.com:5432/postgres?schema=public"
# Alternativa offline/local: docker compose up -d postgres, o ./scripts/pg-local.sh install (sin Docker).

# 3. Código
git clone https://github.com/javacachava/wuju_companion.git ~/companero && cd ~/companero
cp .env.example .env
# Editar .env:
#   DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?schema=public"
#   NEXT_PUBLIC_APP_URL=https://<dominio>
#   OPENAI_API_KEY, ELEVENLABS_API_KEY, N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET
#   DATAMCP_MCP_URL, DATAMCP_API_KEY (opcionales para herramientas de IA)

# 4. Build + DB
pnpm install
docker compose up -d postgres # solo si PostgreSQL corre en este VPS
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

## DataMCP

DataMCP se configura después de tener `DATABASE_URL` funcionando:

1. En DataMCP, conectá la misma URL PostgreSQL de producción.
2. Creá reglas: para demo puede ser read-write sobre las tablas del MVP; para producción real preferí read-only o permisos por tabla.
3. Generá el MCP link y API key.
4. Guardá en `.env` local/servidor:
   ```env
   DATAMCP_MCP_URL=https://api.datamcp.app/api/mcp/conn_xxx?key=xxx
   DATAMCP_API_KEY=sk_live_...
   ```
5. En Codex/Cursor/Claude configurá el MCP server con ese URL y header `Authorization: Bearer <DATAMCP_API_KEY>`.

## Checklist antes del pitch

- [ ] `https://<dominio>` carga la landing
- [ ] `/companion` crea personaje con el nombre `demo`
- [ ] `/marketplace` muestra catálogo y el checkout compra con saldo
- [ ] DataMCP puede listar tablas y consultar datos permitidos
- [ ] `/api/audit` con código vulnerable dispara la alerta a Discord (track n8n)
- [ ] TTS suena (créditos de ElevenLabs disponibles)
- [ ] `pm2 status` verde y `pm2 logs companero` sin errores en loop
