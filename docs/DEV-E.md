# DEV E — Datos + Persistencia + Seeds

> Tu responsabilidad: la base de datos y los endpoints de datos. Sos la fundación que todos consumen.

## Tu carpeta

```
prisma/schema.prisma          ← el schema
prisma/seed.ts                ← datos iniciales
apps/web/lib/db.ts            ← cliente Prisma singleton
apps/web/app/api/character/   ← endpoints de personaje
apps/web/app/api/inventory/   ← endpoints de inventario
apps/web/app/api/marketplace/ ← endpoints del marketplace
apps/web/app/api/skills/      ← endpoints de skills
```

## Docs que tenés que leer antes de empezar

1. `AGENTS.md` — reglas del repo
2. `docs/CONTRATOS.md` — TODOS los endpoints que implementás y el schema Prisma
3. `docs/SEED.md` — qué partes iniciales y del marketplace tenés que crear

## Entregables

### Sí
- Schema Prisma completo con 5 modelos
- Cliente Prisma singleton en `lib/db.ts`
- Seeds con 15 partes iniciales + 10 premium
- 6 endpoints CRUD según CONTRATOS
- Migraciones aplicadas

### No
- Auth real (no la implementes aunque Codex quiera)
- Stripe / pagos (el marketplace es mock)
- pgvector / embeddings

## Fase 1 — Schema y setup (H+0 a H+2)

### Prompts iniciales para Codex/Cursor

### Prompt 1 — schema Prisma

```
Instalá prisma y @prisma/client. Configurá con SQLite:
- DATABASE_URL="file:./dev.db"

Creá prisma/schema.prisma con los 5 modelos EXACTOS de docs/CONTRATOS.md sección "Modelo de datos (Prisma)".
No agregues campos que no estén en los contratos. No cambies nombres.

Corré:
- pnpm prisma migrate dev --name init
- pnpm prisma generate

Creá apps/web/lib/db.ts con el cliente Prisma singleton para evitar problemas con hot reload en dev:

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### Prompt 2 — seed

```
Creá prisma/seed.ts según docs/SEED.md.
Debe crear:
- 15 Part con isPremium=false (3 por categoría)
- 10 Part con isPremium=true (2 por categoría) con price entre 100 y 500
- Nombres de archivo en imageUrl según nomenclatura de docs/ASSETS.md

No crear Character ni Message en el seed — se crean cuando el usuario abre la app.

Configurá package.json para correr el seed:
"prisma": { "seed": "tsx prisma/seed.ts" }

Instalá tsx como devDependency.
```

## Fase 2 — Endpoints (H+2 a H+8)

### Prompt 3 — endpoint /api/character

```
Creá apps/web/app/api/character/route.ts según docs/CONTRATOS.md.

GET (con searchParam userName):
- Valida con Zod que userName exista y no esté vacío
- findFirst con include de inventory.part
- Si NO existe: crea el Character con partes default del seed (los primeros de cada categoría con isPremium=false)
  - Al crear, también crear InventoryItem para cada parte inicial
  - Al crear, también crear ActiveSkill { skillKey: "chat-base" }
- Devuelve el Character con estructura EXACTA de CONTRATOS.md (con parts como objeto por categoría, no array)

PATCH:
- Valida body con Zod: { characterId, category, partId }
- Verifica que la parte esté en el inventory del character (throw 403 si no)
- Actualiza el campo correcto según category (hairId, eyesId, etc)
- Devuelve el Character actualizado en el mismo formato que GET
```

### Prompt 4 — endpoint /api/inventory

```
Creá apps/web/app/api/inventory/route.ts según docs/CONTRATOS.md.

GET (con searchParam characterId):
- findMany de InventoryItem where characterId, include part
- Agrupa las partes por category
- Devuelve un objeto con keys hair, eyes, mouth, accessory, clothing (arrays de Part)
```

### Prompt 5 — endpoints /api/marketplace

```
Creá apps/web/app/api/marketplace/parts/route.ts:
- GET: findMany de Part where isPremium=true, o partes que el usuario no tiene aún
- Si viene characterId como searchParam, filtra las ya poseídas

Creá apps/web/app/api/marketplace/acquire/route.ts:
- POST con body { characterId, partId }
- Valida con Zod
- Crea InventoryItem (upsert por si ya existe, no falla)
- Devuelve el InventoryItem creado
- No valida pago en MVP (comentario en el código)
```

### Prompt 6 — endpoint /api/skills/toggle

```
Creá apps/web/app/api/skills/toggle/route.ts según docs/CONTRATOS.md.

POST con body { characterId, skillKey, enabled }:
- Si enabled=true: upsert ActiveSkill
- Si enabled=false: delete
- Devuelve findMany de ActiveSkill del character
```

## Fase 3 — Datos de prueba (H+8 a H+10)

Una vez conectado todo, agregá seeds de prueba para casos edge:

```
Actualizá prisma/seed.ts para incluir:
- 1 Character de ejemplo llamado "demo" con todas las partes puestas
- Algunos Message de ejemplo (para probar el historial)

Corré pnpm prisma db seed y verificá en Prisma Studio.
```

## Herramientas extra útiles

- **Prisma Studio** (`pnpm prisma studio`) — GUI para ver la data en vivo
- **DB Browser for SQLite** — alternativa desktop
- **Zod** — validá TODO input externo
- **tsx** — corre TypeScript directo sin build
- **Postman** o **Bruno** — probar endpoints sin frontend

## Checkpoints de tu progreso

- **H+1:** schema Prisma listo, migración aplicada, seed base corriendo
- **H+2:** endpoint /api/character (GET y PATCH) funcionando, probado con curl
- **H+4:** endpoint /api/inventory funcionando
- **H+6:** endpoints de marketplace funcionando
- **H+8:** endpoint /api/skills/toggle funcionando
- **H+10:** datos de prueba completos, todo integrable
- **H+14:** ajustes según feedback de Dev C y Dev B durante integración
- **H+20:** QA final de todos los endpoints

## Riesgos específicos tuyos

1. **El schema cambia después de que otros ya lo están usando.** Mitigación: cerrar el schema en H+2 y no cambiarlo salvo emergencia. Si hay que cambiarlo, avisar al equipo entero.
2. **Los seeds no reflejan la realidad de los assets.** Mitigación: en H+6, revisar con Dev B qué archivos de imagen están efectivamente en `public/parts/` y actualizar el seed.
3. **Prisma en producción con SQLite.** No es un problema en el MVP porque solo corre local + Vercel. Pero SQLite en Vercel es efímero (se resetea cada deploy) — si el jurado quiere probar, tener el `dev.db` con datos ya seedeados en el repo (agregarlo al `.gitignore` con excepción para el file específico).

## Coordinación con otros devs

- **Con Dev D:** en H+0 acordá que `lib/db.ts` es donde vive el cliente Prisma y desde ahí lo importa él para persistir mensajes.
- **Con Dev C:** en H+2 confirmá el formato EXACTO de la respuesta de GET /api/character (parts como objeto, no array) y confirmá que Dev C sabe el formato.
- **Con Dev B:** en H+6 pedile la lista final de imageUrl para actualizar el seed. Si Dev B se atrasa, dejá el seed con placeholders (`/parts/placeholder.png`).
- **Con Dev A:** si Dev A necesita datos para mostrar en la landing (ejemplo: "500 partes en el marketplace"), decile qué números son reales.

## Cierre importante

Sos la persona menos cargada pero la más crítica. Si tus endpoints fallan, TODOS caen. Priorizá:
1. Que los endpoints DEVUELVAN lo que dice el contrato, no más, no menos
2. Manejo de errores con status HTTP correcto (400 malformed, 404 not found, 403 forbidden)
3. Validación estricta con Zod en cada entrada

Es mejor un endpoint que devuelve el formato exacto pero sin optimizaciones, que un endpoint "inteligente" que devuelve algo distinto.
