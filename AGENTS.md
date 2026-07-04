# AGENTS.md

> Este archivo es para agentes de IA (Codex, Cursor, Claude Code). Léelo antes de generar código.

## Qué es este proyecto

**El Compañero** es un asistente personal libre (AGPL-3.0) con cara y voz. Un cascarón universal al que el usuario le elige quién es (personaje) y qué puede hacer (packs de capacidades). En el MVP, el único pack completo es el de desarrollo, con dos capacidades: Guardián de código (audit de vulnerabilidades) y chat conversacional.

Es un producto real, no una demo — pero este repo es el MVP de hackathon de 24 horas, así que hay recortes deliberados.

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Estilo:** Tailwind CSS v4 + shadcn/ui + Framer Motion
- **IA:** Vercel AI SDK con OpenAI/Codex (streaming)
- **Voz:** ElevenLabs API
- **Datos:** SQLite + Prisma ORM
- **Automatización:** n8n self-hosted (Railway) para el track n8n
- **Deploy:** Vercel
- **Package manager:** pnpm

## Estructura del monorepo

```
companero/
├── apps/web/                    ← única app en el MVP
│   ├── app/
│   │   ├── (marketing)/         ← Dev A: landing
│   │   ├── companion/           ← Dev C: ventana del compañero
│   │   ├── marketplace/         ← Dev B: marketplace
│   │   └── api/                 ← Dev D + Dev E: endpoints
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui (compartido)
│   │   ├── companion/           ← Dev C
│   │   ├── marketplace/         ← Dev B
│   │   └── landing/             ← Dev A
│   └── lib/
│       ├── ai.ts                ← Dev D: Vercel AI SDK
│       ├── db.ts                ← Dev E: cliente Prisma
│       └── tts.ts               ← Dev D: cliente ElevenLabs
├── prisma/
│   ├── schema.prisma            ← Dev E
│   └── seed.ts                  ← Dev E + Dev B
├── public/parts/                ← Dev B: assets del wardrobe
├── infra/n8n/                   ← Dev D: workflows exportados
└── docs/                        ← contexto para agentes de IA
```

## Reglas de código no negociables

1. **TypeScript estricto.** `any` está prohibido salvo justificación en comentario.
2. **Server Components por default.** Client Components solo cuando hay interactividad (`"use client"`).
3. **Zod para validar todo input externo.** Requests, responses de LLM, variables de entorno.
4. **No usar `localStorage` dentro de artifacts o componentes que se sirvan al SSR.** Usar React state.
5. **Todos los endpoints devuelven JSON** salvo `/api/tts` (audio) y `/api/chat` (stream).
6. **Nombres en inglés para código, en español para copy visible al usuario.**
7. **Manejo de errores obligatorio** en llamadas a LLM/ElevenLabs — si falla la API en el demo, no puede caerse la UI.

## Reglas de commits

- Formato: `feat(area): qué hace` / `fix(area): qué arregla` / `docs: qué documenta`
- Ejemplo: `feat(companion): agrega animación idle de la mascota`
- Chicos y frecuentes. Cada dev en su rama (`feat/dev-X-loquesea`), PR a `main`.

## Fuente de verdad

El documento **`docs/CONTRATOS.md`** es la fuente de verdad de todos los endpoints, schemas y flujos. Si el código no coincide con lo que dice ese documento, se arregla el código. Si hay que cambiar el contrato, se cambia primero en el documento y se avisa al equipo.

## Qué NO hay en el MVP (no lo generes aunque lo pidan)

- Autenticación real (Auth.js, GitHub OAuth, etc.). El "login" es un nombre + localStorage.
- Pagos reales con Stripe. El marketplace es visual y mockeado.
- App de escritorio Tauri. En el MVP corremos solo en navegador.
- Base de datos vectorial. La memoria es JSON simple con últimas 20 interacciones.
- Multi-proveedor de LLM. Solo OpenAI/Codex en el MVP.

## Tracks del hackathon (para tener presente)

Este proyecto compite en 3 tracks:
1. **Best Use of ElevenLabs** — cada respuesta del compañero se reproduce con voz
2. **Best Use of n8n** — 2 workflows conectados vía webhooks
3. **Top 3 Best Use of Codex** — Codex es el proveedor principal en el AI SDK

## Cómo pedirle cosas al agente

Cuando trabajes en un endpoint, componente o feature:
1. Lee `docs/CONTRATOS.md` primero
2. Lee la doc específica de tu dev (`docs/DEV-A.md`, `DEV-B.md`, etc.)
3. Genera código que respete los contratos exactos, no los que "te parecen razonables"
4. Si algo del contrato es ambiguo, preguntá antes de asumir
