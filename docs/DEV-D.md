# DEV D — Backend + IA + n8n

> Tu responsabilidad: el cerebro del compañero. Chat, audit, voz y n8n. La parte más pesada del equipo.

## Tu carpeta

```
apps/web/app/api/chat/        ← endpoint de chat
apps/web/app/api/audit/       ← endpoint de audit
apps/web/app/api/tts/         ← endpoint de TTS
apps/web/lib/ai.ts            ← setup Vercel AI SDK
apps/web/lib/tts.ts           ← cliente ElevenLabs
infra/n8n/                    ← workflows exportados
```

## Docs que tenés que leer antes de empezar

1. `AGENTS.md` — reglas del repo
2. `docs/CONTRATOS.md` — TODOS los endpoints que implementás (especial atención a `/api/chat`, `/api/audit`, `/api/tts`)
3. `docs/PROMPTS.md` — system prompts (creás vos, pero lee lo que hay como borrador)
4. `docs/N8N.md` — los 2 workflows que tenés que armar

## Entregables

### Sí
- `POST /api/chat` con streaming del LLM (Codex/OpenAI)
- `POST /api/audit` con response estructurado (usando `generateObject` de AI SDK)
- `POST /api/tts` con ElevenLabs + cache
- 2 workflows n8n desplegados en Railway y conectados vía webhooks
- Cache en memoria para audios repetidos

### No
- Multi-proveedor (solo OpenAI/Codex en el MVP)
- Memoria semántica con embeddings (fuera del MVP)
- Streaming del audit (es sync, devuelve JSON)

## Fase 1 — Setup (H+0 a H+1)

Antes que nada:
1. Configurar Railway con la cuenta del equipo
2. Desplegar n8n en Railway con Docker (hay plantilla oficial)
3. Verificar que carga la UI de n8n
4. Anotar la URL del webhook base

## Prompts iniciales para Codex/Cursor

### Prompt 1 — setup del AI SDK

```
Instalá dependencias: ai, @ai-sdk/openai, zod.

Creá apps/web/lib/ai.ts que exporta:

1. Un cliente OpenAI configurado con OPENAI_API_KEY del env
2. Función chatWithCompanion(characterId, message, personality) que:
   - Construye system prompt según la personality (ver docs/PROMPTS.md)
   - Retorna StreamingTextResponse usando streamText del ai package
   - Modelo: "gpt-4o-mini" (rápido y económico)

3. Función auditCode(code, language) que:
   - Usa generateObject de AI SDK con schema Zod estricto
   - Retorna un AuditReport según docs/CONTRATOS.md
   - Modelo: "gpt-4o" (mejor razonamiento para audits)

Definí el schema Zod de AuditReport en el mismo archivo:
  findings: array de { severity, title, line, description, suggestion, fixExample }
  summary: string
  characterVoicedSummary: string
```

### Prompt 2 — endpoint /api/chat

```
Creá apps/web/app/api/chat/route.ts según docs/CONTRATOS.md:

- Route Handler POST
- Valida el body con Zod: { characterId, message, activeSkill }
- Busca el Character en DB con lib/db.ts para obtener personality
- Llama chatWithCompanion() y devuelve el stream
- Al terminar el stream (usa onFinish callback), guarda el Message en DB con Prisma
- Al terminar, también dispara el webhook a n8n (conversation-log)

Manejo de errores obligatorio: si falla OpenAI, devolver { error: "..." } con 500.
```

### Prompt 3 — endpoint /api/audit

```
Creá apps/web/app/api/audit/route.ts:

- Route Handler POST
- Valida body con Zod: { characterId, code, language }
- Busca el Character para saber la personality (afecta characterVoicedSummary)
- Llama auditCode() de lib/ai.ts
- Si algún finding es "critical", dispara webhook a n8n (audit-critical) con:
  { characterId, event: "audit-critical", criticalCount, summary }
- Devuelve el AuditReport como JSON

Los system prompts de audit van en docs/PROMPTS.md — leelos y llevalos a lib/ai.ts.
```

### Prompt 4 — endpoint /api/tts

```
Creá apps/web/lib/tts.ts que exporta:

- Función synthesize(text, voiceId) que:
  - Llama a ElevenLabs API (endpoint /v1/text-to-speech/{voiceId})
  - Modelo: "eleven_multilingual_v2"
  - Configuración: stability 0.5, similarity 0.75
  - Retorna un ReadableStream con audio/mpeg

- Cache en memoria: Map<string, Buffer> con key = hash(text + voiceId)
  - Si ya está cacheado, devuelve del cache
  - Si no, llama a ElevenLabs, cachea y devuelve

Creá apps/web/app/api/tts/route.ts:
- POST con { text, voiceId }
- Usa synthesize() de lib/tts.ts
- Devuelve el stream con Content-Type: audio/mpeg
```

## Fase 2 — n8n (H+6 a H+10)

### Workflow 1: audit-critical

1. En n8n → crear nuevo workflow "audit-critical"
2. Agregar node "Webhook" con path `audit-critical`
3. Agregar node HTTP Request que hace POST a un Discord webhook (crear un canal en un server, obtener el webhook URL)
4. El mensaje del Discord: "🚨 El Compañero encontró {{criticalCount}} vulnerabilidades críticas: {{summary}}"
5. Activar el workflow
6. Copiar la URL del webhook a `N8N_WEBHOOK_URL` en .env

### Workflow 2: conversation-log

1. Crear otro workflow "conversation-log"
2. Node Webhook con path `conversation-log`
3. Node Google Sheets "Append row" a una hoja compartida del equipo
4. Columnas: timestamp, characterId, userMessage, assistantMessage, skillUsed
5. Activar
6. Exportar ambos workflows como JSON y commit en `infra/n8n/`

### Verificación

Antes de considerar los workflows listos, probá manualmente:
```bash
curl -X POST https://<n8n-url>/webhook/audit-critical \
  -H "Content-Type: application/json" \
  -H "X-Companero-Secret: <secret>" \
  -d '{"characterId":"test","event":"audit-critical","criticalCount":2,"summary":"test"}'
```

Y verificá que llegó al Discord.

## Herramientas extra útiles

- **Vercel AI SDK docs** — `generateObject` con Zod es tu mejor amigo para el audit
- **ElevenLabs Voice Lab** — elegí 3-4 voces buenas antes de arrancar y guardá los IDs
- **n8n templates** — probablemente hay uno de webhook + Discord ya hecho
- **Postman** o **Bruno** para probar endpoints sin frontend
- **Railway CLI** — para deployar n8n y ver logs

## Checkpoints de tu progreso

- **H+1:** n8n corriendo en Railway, primer webhook responde ping
- **H+2:** endpoint /api/chat funciona con streaming (probado con curl)
- **H+4:** endpoint /api/audit devuelve JSON estructurado con casos de prueba
- **H+6:** endpoint /api/tts funciona, cache implementado
- **H+8:** los 2 workflows n8n corriendo, dispararlos manualmente funciona
- **H+10:** todo integrado desde el frontend de Dev C
- **H+14:** system prompts pulidos con casos reales
- **H+20:** ajustes finos, latencia optimizada

## Riesgos específicos tuyos

1. **n8n consume más tiempo del planeado.** Regla dura: si en H+8 los workflows no están, se corta el track de n8n y va full ElevenLabs.
2. **ElevenLabs latencia alta.** Mitigación: usar el modelo `eleven_flash_v2_5` (más rápido, ligeramente menos calidad) si es necesario. Cache agresivo desde el primer request.
3. **El audit devuelve JSON malformado.** Mitigación: Zod con `generateObject` es lo que evita esto. NUNCA parseás el output del LLM como JSON manualmente.
4. **Sos el cuello de botella del equipo.** Mitigación: si a H+6 estás atrasado, pedile a Dev E que te ayude con /api/tts (es el más simple).

## Coordinación con otros devs

- **Con Dev C:** en H+2 confirmen el formato exacto del stream de chat y el schema del audit. En H+8 hagan integración conjunta.
- **Con Dev E:** en H+0 confirmen que Prisma client es exportado desde `lib/db.ts`. En H+2 usás sus modelos para persistir mensajes.
- **Con Dev B:** avisale cuándo el audit está listo para grabar el demo (H+14 ideal).

## System prompts (borrador — pulir en docs/PROMPTS.md)

### Para chat base:
```
Sos [personality] y trabajás como asistente personal del usuario.
Tu nombre es "el Compañero" y el usuario te llama por el nombre del personaje que eligió.
Tu tono es cálido pero directo. No sos vendedor. No usás lenguaje corporativo.
Respondés en español latinoamericano neutro.
Recordás las conversaciones anteriores.
Si el usuario te muestra código y no tenés activado el skill "code-guardian", solo comentás casualmente. Si te preguntan por seguridad, sugerí activar el Guardián de código.
```

### Para audit code:
```
Sos un pentester senior con años de experiencia en OWASP Top 10 y análisis estático.
Analizás el código que te muestran buscando vulnerabilidades reales:
- Inyecciones (SQL, NoSQL, XSS, LDAP, etc.)
- Secretos hardcodeados (API keys, passwords, tokens)
- Configuración insegura (CORS abierto, headers faltantes, cookies no HttpOnly)
- Crypto obsoleto (MD5/SHA1 para passwords, DES, RC4)
- Validaciones faltantes (input, output, auth)
- Manejo débil de sesiones y auth
- CVEs conocidas de dependencias mencionadas

Devolvés un objeto con la estructura exacta pedida.
NUNCA modificás el código, solo señalás y sugerís.
El campo characterVoicedSummary es narrado por la mascota del compañero — hazlo cálido y con la personalidad del character (que se te pasa como contexto).
```
