# CONTRATOS

> Fuente de verdad de todos los endpoints, schemas y flujos. Si el código no coincide, se arregla el código.

> **Nota:** la migración a escritorio (Fase 7 de `DESKTOP-MIGRATION-PLAN.md`, "Skill Registry") propone generalizar `/api/chat` y `/api/audit` a una ruta única `/api/skill/:skillKey`. La misma fase (sección 7.1) agrega un campo `personalityPrompt` (texto libre) a `CharacterTemplate` para que la personalidad sea producto real de marketplace, no un mapa hardcodeado — con curaduría obligatoria por el riesgo de prompt injection que eso abre. Mientras esa fase no se implemente, este documento sigue siendo la fuente de verdad tal cual está — cualquier cambio de contrato se hace primero acá, como siempre.

## Modelo de datos (Prisma)

### Character
```prisma
model Character {
  id          String   @id @default(cuid())
  userName    String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  hairId      String?
  eyesId      String?
  mouthId     String?
  accessoryId String?
  clothingId  String?

  personality String   @default("amigable")
  voiceId     String   @default("21m00Tcm4TlvDq8ikWAM")

  coins       Int      @default(1000)  // saldo de monedas de demo (moneda in-app, no dinero real)

  messages    Message[]
  inventory   InventoryItem[]
  skills      ActiveSkill[]
}
```

### Part
```prisma
model Part {
  id         String   @id @default(cuid())
  category   String   // 'hair' | 'eyes' | 'mouth' | 'accessory' | 'clothing'
  name       String
  imageUrl   String   // /parts/hair-rizado.png
  isPremium  Boolean  @default(false)
  price      Int      @default(0)

  inventoryItems InventoryItem[]
}
```

### InventoryItem
```prisma
model InventoryItem {
  id           String    @id @default(cuid())
  characterId  String
  partId       String
  acquiredAt   DateTime  @default(now())

  character    Character @relation(fields: [characterId], references: [id])
  part         Part      @relation(fields: [partId], references: [id])

  @@unique([characterId, partId])
}
```

### Message
```prisma
model Message {
  id           String    @id @default(cuid())
  characterId  String
  role         String    // 'user' | 'assistant'
  content      String
  skillUsed    String?   // 'code-guardian' | 'chat-base'
  createdAt    DateTime  @default(now())

  character    Character @relation(fields: [characterId], references: [id])
}
```

### ActiveSkill
```prisma
model ActiveSkill {
  id           String    @id @default(cuid())
  characterId  String
  skillKey     String    // 'chat-base' | 'code-guardian'
  enabledAt    DateTime  @default(now())

  character    Character @relation(fields: [characterId], references: [id])

  @@unique([characterId, skillKey])
}
```

### Cuentas y marketplace (agregados post-MVP inicial)

- `User` (email único, `passwordHash` scrypt, nombre) y `Session` (token opaco, expiración 30 días) — auth propio sin terceros.
- `Character.userId?` — personaje opcionalmente atado a una cuenta.
- `CharacterTemplate` (catálogo de personajes vendibles: key, rol, voz, stats, `priceCents`, `personalityPrompt?` — Fase 7.1 de `DESKTOP-MIGRATION-PLAN.md`, texto libre de creador, nullable, requiere curaduría antes de publicar) y `Pack` (packs de capacidades: skills, `priceCents`, `available` para "próximamente").
- `Order` + `OrderItem` (compras, `status: 'paid_simulated'`) y `Ownership` (qué producto posee cada usuario, único por `userId+productType+productId`).
- Precios en **centavos USD** (`priceCents`; `Part.price` se interpreta en centavos). `0` = gratis.

Schema completo en `prisma/schema.prisma`.

## Endpoints

> Todos los endpoints de IA (`/api/chat`, `/api/audit`, `/api/tts`) y auth tienen **rate limiting por IP** en memoria (`lib/rate-limit.ts`): 20, 6, 15 y 10 req/min respectivamente. Devuelven `429` con header `Retry-After`.

### `POST /api/chat` — Conversación con el compañero
**Dueño:** Dev D · **Consumidor:** Dev C

**Request:**
```json
{
  "characterId": "clx123...",
  "message": "Hola, ¿cómo estás?",
  "activeSkill": "chat-base"
}
```

**Response:** Streaming text (Vercel AI SDK). Se guarda el Message en DB al terminar el stream.

**Comportamiento:**
- `activeSkill: "chat-base"` → personalidad del compañero según `Character.personality`
- `activeSkill: "code-guardian"` → NO usar este endpoint, usar `/api/audit`

---

### `POST /api/audit` — Guardián de código
**Dueño:** Dev D · **Consumidor:** Dev C

**Request:**
```json
{
  "characterId": "clx123...",
  "code": "SELECT * FROM users WHERE id = ' + userId",
  "language": "javascript"
}
```

**Response:**
```json
{
  "findings": [
    {
      "severity": "critical",
      "title": "SQL Injection",
      "line": 1,
      "description": "Query construida con concatenación de strings",
      "suggestion": "Usar prepared statements o un ORM",
      "fixExample": "db.query('SELECT * FROM users WHERE id = ?', [userId])"
    }
  ],
  "summary": "Encontré 3 problemas, 1 crítico",
  "characterVoicedSummary": "Ey! Encontré cosas serias eh..."
}
```

`severity`: `"critical" | "high" | "medium" | "low"`

Si hay al menos un finding `critical`, se dispara webhook a n8n al final.

---

### `POST /api/skill/:skillKey` — Skill Registry (Fase 7, aditivo)

**Estado:** implementado como capa nueva, en paralelo a `/api/chat` y `/api/audit` — NO los reemplaza todavía. `ChatPanel.tsx` sigue llamando a las rutas de siempre. Documentado acá porque ya es contrato real, no solo plan.

`skillKey` válido: `"chat-base" | "code-guardian"` (ver `lib/skills/registry.ts`). Cualquier otro valor → `404 { error: "unknown_skill" }`.

**Request (`chat-base`):** `{ characterId, message }` → misma respuesta en streaming que `/api/chat`.
**Request (`code-guardian`):** `{ characterId, code, language }` → mismo `AuditReport` que `/api/audit`.

Agregar un pack nuevo (Fase 7) = agregar una entrada a `SKILL_REGISTRY`, no una ruta nueva.

---

### `POST /api/tts` — Texto a voz
**Dueño:** Dev D · **Consumidor:** Dev C

**Request:**
```json
{
  "text": "Encontré cosas serias",
  "voiceId": "21m00Tcm4TlvDq8ikWAM"
}
```

**Response:** `audio/mpeg` stream. Cache en memoria por hash de `text + voiceId`.

---

### `GET /api/character?userName=X` — Obtener o crear personaje
**Dueño:** Dev E · **Consumidor:** Dev C

**Response:**
```json
{
  "id": "clx123...",
  "userName": "juan",
  "personality": "amigable",
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "parts": {
    "hair":      { "id": "...", "imageUrl": "/parts/hair-1.png" },
    "eyes":      { "id": "...", "imageUrl": "/parts/eyes-1.png" },
    "mouth":     null,
    "accessory": null,
    "clothing":  { "id": "...", "imageUrl": "/parts/clothing-1.png" }
  }
}
```

Si no existe Character con ese `userName`, lo crea con partes default del seed.

---

### `PATCH /api/character` — Cambiar parte puesta
**Dueño:** Dev E · **Consumidor:** Dev C

**Request:**
```json
{
  "characterId": "clx123...",
  "category": "hair",
  "partId": "clx456..."
}
```

**Response:** Character actualizado (mismo formato que GET). Valida que `partId` esté en el inventory.

---

### `GET /api/inventory?characterId=X` — Partes desbloqueadas
**Dueño:** Dev E · **Consumidor:** Dev C

**Response:**
```json
{
  "hair":      [ { "id": "...", "name": "Rizado", "imageUrl": "..." } ],
  "eyes":      [],
  "mouth":     [],
  "accessory": [],
  "clothing":  []
}
```

---

### `GET /api/marketplace/parts` — Catálogo del marketplace
**Dueño:** Dev E · **Consumidor:** Dev B

**Response:** Array de `Part` con `isPremium: true` o partes no desbloqueadas por el usuario.

---

### `GET /api/marketplace/wallet?characterId=X` — Saldo de monedas
**Dueño:** Dev E · **Consumidor:** Dev B

**Response:**
```json
{ "coins": 1000 }
```

Devuelve el saldo actual de monedas de demo del personaje.

---

### `POST /api/marketplace/acquire` — Comprar parte (pago simulado)
**Dueño:** Dev E · **Consumidor:** Dev B

**Request:**
```json
{
  "characterId": "clx123...",
  "partId": "clx789..."
}
```

**Response (200):**
```json
{
  "inventoryItem": { "id": "clx...", "characterId": "clx123...", "partId": "clx789..." },
  "coins": 550
}
```

**Comportamiento:**
- El **saldo de monedas es real** y se valida en el server: si `part.price > 0` y `character.coins < part.price`, responde `402` sin modificar nada.
- Si alcanza, descuenta `part.price` de `character.coins` y crea el `InventoryItem` en una sola transacción atómica.
- Si el personaje **ya tiene** la parte, no cobra de nuevo (idempotente) y devuelve el saldo actual.
- **No hay dinero real ni pasarela de pago.** Las "monedas" son moneda in-app de demo. La tarjeta que se pide en el checkout se valida en el front (formato/Luhn/vencimiento) pero nunca se envía ni se guarda: no existe procesador que verifique que la tarjeta sea real.

**Response (402) — saldo insuficiente:**
```json
{ "error": "insufficient_funds", "coins": 100, "price": 450 }
```

---

### Autenticación — `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me`

Auth propio sin terceros: email + contraseña (scrypt de `node:crypto`), sesión como token opaco
en la tabla `Session` con cookie `companion_session` (httpOnly, secure en prod, sameSite lax, 30 días).

**Register request:** `{ "email": "...", "name": "...", "password": "min 8 chars" }` → `201 { user }` (setea cookie). `409` si el email ya existe.
**Login request:** `{ "email": "...", "password": "..." }` → `200 { user }` (setea cookie). `401` genérico (no filtra si el email existe).
**Me:** → `{ "user": { id, email, name } | null }`.
Register y login tienen rate limit por IP (10/min).

Los personajes creados con sesión activa quedan atados al `User` (`Character.userId`); los huérfanos se adoptan al loguearse.

---

### `GET /api/marketplace/catalog` — Catálogo público unificado

Sin auth (con sesión agrega `owned`). Devuelve personajes (`CharacterTemplate`), packs (`Pack`) y partes (`Part`) normalizados:

```json
{
  "products": [
    {
      "productType": "character | pack | part",
      "productId": "clx...",
      "name": "Mentor Nova",
      "description": "...",
      "category": "rol | pack | hair/eyes/...",
      "imageUrl": "/parts/... | null",
      "avatar": "MN | null",
      "priceCents": 499,
      "isPremium": true,
      "available": true,
      "owned": false
    }
  ]
}
```

`priceCents` en centavos USD; `0` = gratis. `available: false` = "próximamente" (no comprable).

---

### `POST /api/marketplace/checkout` — Compra de carrito (pago simulado)

**Requiere sesión** (401 sin cookie). Los precios se recalculan SIEMPRE en el server; el cliente solo manda ids.

**Request:** `{ "items": [{ "productType": "part|character|pack", "productId": "clx..." }] }` (1–50 ítems)

**Response (200):**
```json
{ "orderId": "clx...", "totalCents": 999, "status": "paid_simulated", "items": [{ "name": "...", "priceCents": 499 }] }
```

**Comportamiento:**
- Crea `Order` + `OrderItem[]` + `Ownership` en transacción. Ítems ya poseídos se filtran (no se cobran de nuevo); si todo era poseído → `409`.
- Partes compradas se acreditan como `InventoryItem` al primer personaje del usuario, si tiene.
- Packs con `available: false` → `409`.
- **El pago es simulado** (`status: paid_simulated`): la tarjeta se valida en el front (Luhn/vencimiento/CVC) pero nunca viaja al server. Stripe + Connect (comisión a creadores) es post-MVP.

---

### `POST /api/skills/toggle` — Activar/desactivar skill
**Dueño:** Dev E · **Consumidor:** Dev C

**Request:**
```json
{
  "characterId": "clx123...",
  "skillKey": "code-guardian",
  "enabled": true
}
```

**Response:** Lista de skills activos actuales.

## Integración con n8n

### Webhook: audit crítico
Cuando `/api/audit` encuentra al menos un finding `critical`, dispara:

```
POST https://<n8n-url>/webhook/audit-critical
Headers:
  Content-Type: application/json
  X-Companero-Secret: <shared secret en env>
Body:
{
  "characterId": "clx123...",
  "event": "audit-critical",
  "criticalCount": 2,
  "summary": "SQL Injection y API key expuesta"
}
```

### Webhook: log de conversación
Cuando `/api/chat` termina, dispara:

```
POST https://<n8n-url>/webhook/conversation-log
Headers:
  Content-Type: application/json
  X-Companero-Secret: <shared secret en env>
Body:
{
  "characterId": "clx123...",
  "userMessage": "...",
  "assistantMessage": "...",
  "skillUsed": "chat-base"
}
```

## Variables de entorno

```env
DATABASE_URL="postgresql://companero:companero@localhost:5432/companero?schema=public"
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
FAL_API_KEY=
DATAMCP_MCP_URL=
DATAMCP_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`DATAMCP_*` es para herramientas MCP (Codex/Cursor/Claude). La app sigue usando `DATABASE_URL` vía Prisma para leer/escribir datos.

## Flujos completos

### Primera vez del usuario
1. Frontend muestra pantalla "elegí un nombre"
2. Usuario escribe nombre → `GET /api/character?userName=X`
3. Backend crea Character con partes default
4. Frontend guarda `characterId` en localStorage
5. Frontend renderiza mascota con partes default

### Chat normal
1. `POST /api/chat` con `activeSkill: "chat-base"`
2. Streaming del response, frontend renderiza mientras llega
3. Al terminar el stream → `POST /api/tts` con el texto completo
4. Frontend reproduce el audio con `<audio>`

### Audit de código
1. `POST /api/audit` con el código
2. Backend devuelve `AuditReport` estructurado
3. Si hay críticos → dispara webhook a n8n
4. Frontend renderiza `<AuditReport />` con las tarjetas
5. `POST /api/tts` con `characterVoicedSummary`
6. Mascota narra con voz

### Cambio de wardrobe
1. `GET /api/inventory` para poblar el grid
2. Click en una parte → `PATCH /api/character`
3. Backend actualiza y devuelve el nuevo Character
4. Frontend re-renderiza la mascota

### Marketplace
1. `GET /api/marketplace/parts`
2. Click "Agregar" → `POST /api/marketplace/acquire`
3. Frontend muestra toast "Agregado! Ya está en tu wardrobe"
