# N8N

> Workflows de n8n para el track "Best Use of n8n". Dev D implementa esto en Railway.

## Filosofía

n8n en este proyecto no es un accesorio — es el ejecutor de acciones del Compañero. La promesa del producto ("el compañero respeta permisos y ejecuta acciones autorizadas") se demuestra literalmente con n8n: cada acción que el compañero "hace" fuera del chat pasa por un workflow n8n auditable.

En el MVP se implementan **2 workflows** que cubren los dos ejes narrativos del pitch:
1. **Alerta proactiva** — el compañero avisa a un canal externo cuando encuentra algo crítico
2. **Bitácora auditada** — cada conversación se registra donde el usuario autorizó

Ambos se disparan por webhook desde los endpoints del backend.

## Setup inicial

### 1. Desplegar n8n en Railway

Railway ofrece una plantilla oficial de n8n con Docker. Pasos:

```bash
# En Railway dashboard
1. New Project → Deploy from Template → n8n
2. Configurar variables:
   - N8N_BASIC_AUTH_ACTIVE=true
   - N8N_BASIC_AUTH_USER=<usuario del equipo>
   - N8N_BASIC_AUTH_PASSWORD=<password del equipo>
   - WEBHOOK_URL=<URL pública generada por Railway>
3. Deploy
```

Guardar en `.env` del proyecto principal:
```env
N8N_WEBHOOK_URL=https://<railway-url>/webhook
N8N_WEBHOOK_SECRET=<generar una cadena random de 32+ chars>
```

### 2. Configurar el secret compartido

Cada webhook debe validar el header `X-Companero-Secret`. Se hace en el primer node de cada workflow con un `IF` que compara contra la variable de entorno de n8n.

Setear en n8n → Settings → Variables:
```
COMPANERO_SECRET = <mismo valor que N8N_WEBHOOK_SECRET del .env>
```

## Workflow 1: `audit-critical`

### Objetivo
Cuando el Guardián de código encuentra al menos un hallazgo `critical`, notificar en tiempo real a un canal externo (Discord). Sirve para demostrar en el video que el compañero "levanta la mano" cuando algo grave pasa.

### Trigger
- **Tipo:** Webhook
- **Method:** POST
- **Path:** `audit-critical`
- **URL final:** `<railway-url>/webhook/audit-critical`

### Payload esperado (viene del backend)
```json
{
  "characterId": "clx123...",
  "event": "audit-critical",
  "criticalCount": 2,
  "summary": "SQL Injection y API key expuesta"
}
```

Header esperado:
```
X-Companero-Secret: <secret>
```

### Nodes del workflow

**Node 1: Webhook**
- Método POST
- Path: `audit-critical`
- Respond: immediately (200 OK)

**Node 2: IF (validar secret)**
- Condition: `{{$headers["x-companero-secret"]}} equals {{$vars.COMPANERO_SECRET}}`
- True → siguiente node
- False → stop (403)

**Node 3: HTTP Request (a Discord)**
- Method: POST
- URL: `<discord-webhook-url>` (obtener de: canal Discord → Editar → Integraciones → Webhooks)
- Body (JSON):
```json
{
  "content": "🚨 **El Compañero detectó vulnerabilidades críticas**\n\nCantidad: {{$json.criticalCount}}\nResumen: {{$json.summary}}\nCharacter: `{{$json.characterId}}`"
}
```

### Prueba manual

```bash
curl -X POST https://<railway-url>/webhook/audit-critical \
  -H "Content-Type: application/json" \
  -H "X-Companero-Secret: <secret>" \
  -d '{
    "characterId": "test",
    "event": "audit-critical",
    "criticalCount": 2,
    "summary": "SQL Injection y hardcoded API key"
  }'
```

Verificar que llega el mensaje a Discord.

## Workflow 2: `conversation-log`

### Objetivo
Cada mensaje del chat se registra en un log externo (Google Sheets). Este workflow demuestra el concepto de "permisos ejecutables" del pitch: el compañero solo escribe donde el usuario le autorizó.

### Trigger
- **Tipo:** Webhook
- **Method:** POST
- **Path:** `conversation-log`
- **URL final:** `<railway-url>/webhook/conversation-log`

### Payload esperado
```json
{
  "characterId": "clx123...",
  "userMessage": "Auditá este código",
  "assistantMessage": "Encontré 3 problemas...",
  "skillUsed": "code-guardian",
  "timestamp": "2026-07-04T18:32:00Z"
}
```

### Nodes del workflow

**Node 1: Webhook**
- Método POST
- Path: `conversation-log`

**Node 2: IF (validar secret)**
- Igual que en workflow 1

**Node 3: Google Sheets (Append Row)**
- Operation: Append
- Sheet: crear una hoja "Companero Log" con columnas:
  `timestamp | characterId | userMessage | assistantMessage | skillUsed`
- Autenticación: OAuth de Google con una cuenta del equipo
- Values (mapear desde el JSON):
  ```
  timestamp: {{$json.timestamp}}
  characterId: {{$json.characterId}}
  userMessage: {{$json.userMessage}}
  assistantMessage: {{$json.assistantMessage}}
  skillUsed: {{$json.skillUsed}}
  ```

### Alternativa si Google Sheets se complica
Usar **Airtable** o simplemente otro Discord webhook a un canal `#logs` distinto.
No perder tiempo peleándose con OAuth de Google si no arranca en 15 minutos.

### Prueba manual

```bash
curl -X POST https://<railway-url>/webhook/conversation-log \
  -H "Content-Type: application/json" \
  -H "X-Companero-Secret: <secret>" \
  -d '{
    "characterId": "test",
    "userMessage": "hola",
    "assistantMessage": "hola, como estas?",
    "skillUsed": "chat-base",
    "timestamp": "2026-07-04T18:00:00Z"
  }'
```

## Cómo el backend dispara los webhooks

En `lib/n8n.ts` (Dev D crea este archivo):

```typescript
const N8N_URL = process.env.N8N_WEBHOOK_URL!;
const SECRET = process.env.N8N_WEBHOOK_SECRET!;

export async function triggerAuditCritical(payload: {
  characterId: string;
  criticalCount: number;
  summary: string;
}) {
  try {
    await fetch(`${N8N_URL}/audit-critical`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Companero-Secret": SECRET
      },
      body: JSON.stringify({
        event: "audit-critical",
        ...payload
      })
    });
  } catch (e) {
    // Log pero no romper el flujo principal si n8n falla
    console.error("[n8n] audit-critical failed", e);
  }
}

export async function triggerConversationLog(payload: {
  characterId: string;
  userMessage: string;
  assistantMessage: string;
  skillUsed: string;
}) {
  try {
    await fetch(`${N8N_URL}/conversation-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Companero-Secret": SECRET
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString()
      })
    });
  } catch (e) {
    console.error("[n8n] conversation-log failed", e);
  }
}
```

**Importante:** los webhooks se disparan sin await bloqueante. Si n8n cae, el chat sigue funcionando. Es telemetría, no crítico del flujo.

## Exportar workflows para el repo

En n8n → cada workflow → menú "..." → Download.
Guardar los JSON en:
```
infra/n8n/audit-critical.json
infra/n8n/conversation-log.json
```

Esto permite que cualquiera pueda importar los workflows en su propia instancia de n8n si clona el repo.

## Demostrarlo en el pitch

En el video demo y en el pitch en vivo, mostrar:
1. Usuario pega código con SQL injection
2. El compañero devuelve el audit crítico
3. **Cortar a Discord del equipo** donde aparece la notificación en tiempo real
4. Cortar de vuelta al compañero

Esa transición Discord ↔ app es la evidencia del track n8n en 5 segundos de video.

## Regla de corte para el track n8n

Si al llegar a H+8 los workflows no están funcionando, se corta el track de n8n:
1. Se comentan las líneas que llaman a n8n en el backend (no se rompe el chat)
2. Se saca la escena de Discord del video
3. Se enfoca el pitch en ElevenLabs y Codex

**Nunca ponés en riesgo el chat funcionando por el track de n8n.**
