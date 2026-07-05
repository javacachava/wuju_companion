# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del repo

El MVP ya está implementado como monorepo Next.js en `apps/web/`, con Prisma en `prisma/`, workflows n8n en `infra/n8n/` y assets en `public/parts/`. Antes de tocar código, leé `docs/CONTRATOS.md` y la doc del dev dueño del área.

## Qué es este proyecto

**El Compañero** es un asistente personal libre (AGPL-3.0) con cara y voz: un cascarón universal al que el usuario le elige personaje y packs de capacidades. Es producto real, pero este repo es el MVP de un hackathon de 24 horas — hay recortes deliberados (ver "Qué NO hay en el MVP" abajo).

El MVP tiene un solo pack completo — **desarrollo** — con dos capacidades: **Guardián de código** (audit de vulnerabilidades vía LLM) y chat conversacional con voz.

## Stack actual

- **Framework:** Next.js 15 (App Router) + TypeScript estricto
- **Estilo:** Tailwind CSS v4 + shadcn/ui + Framer Motion
- **IA:** Vercel AI SDK, proveedor principal OpenAI/Codex (streaming)
- **Voz:** ElevenLabs API con cache en memoria
- **Datos:** PostgreSQL + Prisma ORM
- **Data MCP:** DataMCP como gateway MCP seguro hacia PostgreSQL para Codex/Cursor/Claude
- **Automatización:** n8n Cloud (cupón Pro del hackathon) o Docker en el VPS
- **Deploy:** VPS propio con `next start` + pm2 + Caddy (TLS automático), usando PostgreSQL local/gestionado
- **Package manager:** pnpm

## Comandos (una vez creado el proyecto)

```bash
pnpm install
docker compose up -d postgres
pnpm prisma migrate deploy --schema prisma/schema.prisma
pnpm prisma db seed
pnpm dev
pnpm lint
pnpm typecheck
```

Correr `pnpm lint` y `pnpm typecheck` antes de todo PR.

Si el entorno usa Supabase, no levantes PostgreSQL local: poné `DATABASE_URL` apuntando al **Session Pooler IPv4** de Supabase y corré las migraciones contra esa DB.

## Supabase + DataMCP para Claude

La base real del MVP es PostgreSQL. En el equipo actual está en Supabase y Prisma entra solo por `DATABASE_URL`.

- Usar el pooler de Supabase, no SQLite ni `prisma/dev.db`.
- Formato esperado:
  ```env
  DATABASE_URL="postgresql://postgres.<ref>:<password-url-encoded>@aws-1-<region>.pooler.supabase.com:5432/postgres?schema=public"
  ```
- `DATAMCP_MCP_URL` y `DATAMCP_API_KEY` son solo para herramientas de IA. La app no los usa para atender requests.
- Nunca pegar claves reales en docs, commits, issues o prompts.
- Antes de cambiar schema/data, revisar `docs/DATAMCP.md`, `docs/DEV-E.md` y `prisma/schema.prisma`.

Para Claude Desktop/Claude Code, configurar DataMCP como MCP remoto usando el URL scoped de la conexión y el header bearer:

```json
{
  "mcpServers": {
    "datamcp": {
      "url": "https://api.datamcp.app/api/mcp/conn_xxx",
      "headers": {
        "Authorization": "Bearer sk_live_..."
      }
    }
  }
}
```

Después de guardar la configuración MCP, reiniciar Claude para que cargue las herramientas. Si el cliente pide autorización o confirmación en navegador, completarla antes de intentar listar tablas.

## Arquitectura del monorepo (estructura objetivo)

```
apps/web/
├── app/
│   ├── (marketing)/       # landing pública
│   ├── companion/         # ventana del compañero
│   ├── marketplace/       # marketplace visual
│   └── api/                # chat, audit, tts, character, inventory, marketplace, skills
├── components/
│   ├── ui/                 # shadcn/ui compartido
│   ├── companion/
│   ├── marketplace/
│   └── landing/
└── lib/
    ├── ai.ts                # Vercel AI SDK setup
    ├── db.ts                # cliente Prisma singleton
    ├── tts.ts               # cliente ElevenLabs con cache
    └── n8n.ts               # helpers para disparar webhooks
prisma/
├── schema.prisma            # Character, Part, InventoryItem, Message, ActiveSkill
└── seed.ts                  # 15 partes gratis + 10 premium
public/parts/                 # assets del wardrobe (PNG 512×512 transparente)
infra/n8n/                    # workflows exportados
```

**`docs/CONTRATOS.md` es la fuente de verdad** de modelo de datos, endpoints y flujos. Si el código no coincide con ese documento, se arregla el código, no al revés. Cambios de contrato se hacen primero en el documento.

### Modelo de datos (Prisma) — 5 modelos

`Character` (personaje del usuario: partes puestas, personalidad, voiceId) → `InventoryItem` (partes desbloqueadas) → `Part` (catálogo de wardrobe, `category`: hair/eyes/mouth/accessory/clothing) · `Message` (historial de chat, `skillUsed`) · `ActiveSkill` (qué capacidades tiene prendidas el personaje).

### Endpoints clave y sus flujos

- `POST /api/chat` — streaming de conversación (Vercel AI SDK), guarda `Message` al terminar el stream, dispara webhook `conversation-log` a n8n.
- `POST /api/audit` — Guardián de código: devuelve `findings[]` estructurados + `characterVoicedSummary`. Si hay algún finding `critical`, dispara webhook `audit-critical` a n8n.
- `POST /api/tts` — texto a voz vía ElevenLabs, cacheado en memoria por hash de `text + voiceId`.
- `GET/PATCH /api/character`, `GET /api/inventory`, `GET /api/marketplace/parts`, `POST /api/marketplace/acquire`, `POST /api/skills/toggle` — gestión de personaje/wardrobe/marketplace, sin validación de pago real en el MVP.

Detalle completo de request/response en `docs/CONTRATOS.md`.

### Ownership por área (para saber a qué doc mirar)

- Dev A — landing, copy, video, deck → `docs/DEV-A.md`
- Dev B — assets IA, marketplace, video final → `docs/DEV-B.md`
- Dev C — compañero UI, mascota, wardrobe, chat → `docs/DEV-C.md`
- Dev D — backend, IA, n8n → `docs/DEV-D.md`
- Dev E — datos, persistencia, seeds → `docs/DEV-E.md`
- DataMCP / PostgreSQL / MCP tools → `docs/DATAMCP.md`

Antes de trabajar en un endpoint/componente: leer `docs/CONTRATOS.md`, después la doc del dev dueño del área.

## Reglas de código no negociables

1. TypeScript estricto — `any` prohibido salvo justificación en comentario.
2. Server Components por default; `"use client"` solo cuando hay interactividad real.
3. Zod para validar todo input externo: requests, responses de LLM, variables de entorno.
4. No usar `localStorage` dentro de artifacts o componentes servidos por SSR — usar React state.
5. Todos los endpoints devuelven JSON salvo `/api/tts` (audio) y `/api/chat` (stream).
6. Nombres en inglés para código, en español para copy visible al usuario.
7. Manejo de errores obligatorio en llamadas a LLM/ElevenLabs — si falla la API en el demo, la UI no se puede caer.

## Qué NO generar en el MVP (aunque se pida)

- Autenticación real (Auth.js, GitHub OAuth). El "login" es nombre + localStorage.
- Pagos reales con Stripe — marketplace visual y mockeado.
- App de escritorio Tauri — solo navegador en el MVP.
- Base de datos vectorial — memoria es JSON simple con últimas 20 interacciones.
- Multi-proveedor de LLM — solo OpenAI/Codex.

Estas exclusiones rigen el **MVP web** (`apps/web/`) descrito en este documento. La migración a escritorio (Tauri, multi-proveedor vía BYO-key, memoria semántica) es una evolución posterior, planificada por separado — ver siguiente sección. No implementar nada de esa migración salvo que se pida explícitamente empezar una fase concreta.

## Migración a escritorio (planificada, no iniciada)

Existe un plan completo y detallado para migrar El Compañero a una app de escritorio nativa (Tauri v2), en **[`DESKTOP-MIGRATION-PLAN.md`](./DESKTOP-MIGRATION-PLAN.md)** (raíz del repo). Ese documento es la fuente de verdad para esa migración — 10 fases (0 a 9), decisiones de arquitectura (cliente delgado, split `invoke()`/HTTP, BYO-key agnóstico de proveedor de LLM, Context Builder, economía de tokens) y qué se descartó del plan original y por qué.

Si te piden trabajar en algo de la migración desktop: leé primero `DESKTOP-MIGRATION-PLAN.md` completo, empezá por la Fase 0 si no hay código previo, y respetá la regla de split (`invoke()` solo para capacidades del sistema operativo; HTTP para todo lo que ya existe en `apps/web/`). Ese plan **revisa deliberadamente** algunas de las exclusiones de la sección anterior (multi-proveedor, memoria vectorial) para la capa desktop — no es una contradicción, es evolución explícita fase por fase.

## Commits

Formato `feat(area): qué hace` / `fix(area): qué arregla` / `docs: qué documenta`. Commits chicos y frecuentes, cada dev en su rama (`feat/dev-X-loquesea`), PR a `main`.
