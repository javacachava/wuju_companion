# CONTRATOS

> Fuente de verdad de todos los endpoints, schemas y flujos. Si el código no coincide, se arregla el código.

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

## Endpoints

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

### `POST /api/marketplace/acquire` — Agregar parte al inventario (mock)
**Dueño:** Dev E · **Consumidor:** Dev B

**Request:**
```json
{
  "characterId": "clx123...",
  "partId": "clx789..."
}
```

**Response:** `InventoryItem` creado. En el MVP no valida pago.

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
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
FAL_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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
