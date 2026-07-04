# El Compañero

> Tu asistente personal libre, con la cara y voz que vos elegís. Para el trabajo que sea.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Track: ElevenLabs](https://img.shields.io/badge/track-ElevenLabs-purple)]()
[![Track: n8n](https://img.shields.io/badge/track-n8n-red)]()
[![Track: Codex](https://img.shields.io/badge/track-Codex-green)]()

**El Compañero** es un asistente personal libre y de código abierto. El usuario elige quién es (personaje del catálogo, con voz), qué sabe (packs de capacidades por profesión) y qué puede tocar (permisos granulares). Un compañero, cualquier trabajo, los permisos que vos le des.

Este repo es el MVP construido en 24 horas para el hackathon. El pack completo del MVP es el de **desarrollo**, con dos capacidades diferenciadoras: **Guardián de código** (audit de vulnerabilidades vía LLM) y chat conversacional con voz.

## Demo

- **Web**: *(link pendiente hasta deploy final en el dominio del equipo)*
- **Repo**: [github.com/javacachava/wuju_companion](https://github.com/javacachava/wuju_companion)
- **Video demo**: embebido en la landing

## Qué hace

- **Elegí quién es** — mascota customizable (pelo, ojos, boca, accesorios, ropa) con voz por ElevenLabs
- **Chateá con vos** — memoria de conversaciones, personalidad estable, voz por defecto
- **Auditá tu código** — el compañero encuentra vulnerabilidades OWASP y las cuenta con su propia voz
- **Marketplace** — personajes premium y packs Pro con curaduría
- **Permisos ejecutables** — cada acción del compañero pasa por n8n, auditable y revocable

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilo | Tailwind CSS v4 + shadcn/ui + Framer Motion |
| IA | Vercel AI SDK + OpenAI/Codex |
| Voz | ElevenLabs API con cache |
| Automatización | n8n (Cloud o Docker en el VPS) |
| Datos | SQLite + Prisma ORM |
| Hosting | VPS propio (`next start` + pm2 + Caddy) |
| Package manager | pnpm |

## Setup local

### Requisitos
- Node.js 20+
- pnpm 9+
- Una cuenta con API keys de: OpenAI, ElevenLabs
- (Opcional) Instancia de n8n corriendo en n8n Cloud, el VPS o local

### Instalación

```bash
# Clonar el repo
git clone https://github.com/javacachava/wuju_companion.git
cd companero

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus API keys

# Setup de la base de datos
pnpm prisma migrate dev --name init
pnpm prisma db seed

# Levantar el servidor
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Variables de entorno mínimas

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Opcionales (para el track n8n)
N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook
N8N_WEBHOOK_SECRET=your-secret

# Solo Dev B usa esta
FAL_API_KEY=...
```

## Estructura del monorepo

```
companero/
├── apps/web/                    # única app en el MVP
│   ├── app/
│   │   ├── (marketing)/         # landing pública
│   │   ├── companion/           # ventana del compañero
│   │   ├── marketplace/         # marketplace visual
│   │   └── api/                 # endpoints (chat, audit, tts, character, ...)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui (compartido)
│   │   ├── companion/           # componentes del compañero
│   │   ├── marketplace/         # componentes del marketplace
│   │   └── landing/             # componentes de la landing
│   └── lib/
│       ├── ai.ts                # Vercel AI SDK setup
│       ├── db.ts                # cliente Prisma singleton
│       ├── tts.ts               # cliente ElevenLabs con cache
│       └── n8n.ts               # helpers para disparar webhooks
├── prisma/
│   ├── schema.prisma            # 5 modelos (Character, Part, ...)
│   └── seed.ts                  # 15 partes gratis + 10 premium
├── public/parts/                # assets del wardrobe (PNG transparente 512×512)
├── infra/n8n/                   # workflows exportados
└── docs/                        # documentación técnica y de contexto
    ├── AGENTS.md                # contexto para agentes de IA (Codex, Cursor)
    ├── CONTRATOS.md             # fuente de verdad de endpoints y schemas
    ├── BRAND.md                 # paleta, tipografía, tono
    ├── PITCH.md                 # pitch en 3 versiones
    ├── SKETCH.md                # descripción del layout
    ├── ASSETS.md                # spec técnica y de estilo
    ├── SEED.md                  # datos iniciales
    ├── PROMPTS.md               # system prompts del LLM
    ├── N8N.md                   # workflows n8n
    └── DEV-{A,B,C,D,E}.md       # briefs individuales por dev
```

## Modelo de negocio

Software libre en el core, ingresos en tres vías:

1. **Marketplace curado** con comisión sobre personajes premium y packs Pro
2. **Agentes empresariales pre-configurados** — cada practicante tiene un senior virtual; setup alto + mantenimiento mensual
3. **Donaciones y patrocinios** — GitHub Sponsors, empresas que dependen del proyecto

## Filosofía open source

Licencia **AGPL-3.0**. El cascarón y los packs base son libres. Cualquiera puede instalar, auditar, modificar y redistribuir. Si alguien ofrece el software como servicio con modificaciones, tiene que abrir esas modificaciones — nadie se lleva el trabajo comunitario a una versión cerrada.

Un asistente que ve tus archivos debería ser un asistente que podés leer.

## Roadmap

### Post-hackathon (próximos 3 meses)
- Autenticación real con Auth.js (GitHub, Google)
- Pagos reales con Stripe + Stripe Connect para creadores
- App de escritorio nativa con Tauri
- Memoria semántica con pgvector
- Guardián de despliegue (conexión a GitHub + Supabase)

### Mediano plazo
- Packs de marketing, diseño, negocios, estudio
- Marketplace abierto con curaduría a creadores externos
- Dual licensing para empresas que no pueden usar AGPL

### Largo plazo
- Cuerpo de agentes empresariales configurables
- Comunidad global de creadores de personajes y packs
- La capa por defecto entre una persona y su computadora

## Equipo

Construido en 24 horas por 5 devs:

- **Dev A** — Landing, copy, video, deck
- **Dev B** — Assets IA, marketplace, video final
- **Dev C** — Compañero UI, mascota, wardrobe, chat
- **Dev D** — Backend, IA, n8n
- **Dev E** — Datos, persistencia, seeds

## Tracks del hackathon

Compitiendo por:

- 🎙️ **Best Use of ElevenLabs** — cada respuesta del compañero se reproduce con voz personalizada por personaje
- 🔀 **Best Use of n8n** — 2 workflows: alerta proactiva de vulnerabilidades críticas + bitácora auditable de conversaciones
- 💻 **Top 3 Best Use of Codex** — proveedor principal del AI SDK, corriendo el Guardián de código

## Contribuir

Este es un proyecto de hackathon, pero está pensado para crecer como comunidad libre. Los issues, PRs y discusiones son bienvenidos post-hackathon.

Antes de abrir un PR:
- Leé `docs/AGENTS.md` y `docs/CONTRATOS.md`
- Corré `pnpm lint` y `pnpm typecheck`
- Los commits siguen el formato `feat(area): qué hace` / `fix(area): qué arregla`

## Créditos

- **Anthropic** por Claude, usado como copiloto durante la construcción
- **OpenAI** por Codex y GPT-4o
- **ElevenLabs** por las voces
- **n8n** por la infra de automatización
- **Vercel** por el AI SDK
- **shadcn** por los componentes
- El sketch original del compañero está en `docs/SKETCH.md` — ese cuaderno fue el punto de partida

## Licencia

[AGPL-3.0](./LICENSE) © 2026 Equipo El Compañero

---

*"Un compañero libre. La cara y voz que vos elijas. Para el trabajo que sea."*
