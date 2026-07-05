# Plan Maestro — Migración a Escritorio de El Compañero

> Este documento describe la evolución de El Compañero desde el MVP web (descrito en `CLAUDE.md` y `docs/CONTRATOS.md`) hacia una aplicación de escritorio nativa, multiplataforma, con acceso real y controlado al sistema operativo.
>
> **Relación con el MVP web:** algunas restricciones del MVP web (`CLAUDE.md`) — un solo proveedor de LLM, sin base de datos vectorial, sin pagos reales — se revisan explícitamente en este plan para la app de escritorio. Cada caso se aclara en su fase correspondiente. Este documento NO reemplaza `CLAUDE.md`; lo extiende para la capa desktop.
>
> Última actualización: 2026-07-05.

---

## 0. Estado de implementación (2026-07-05)

Auditoría + remediación en orden, Fases 2 a 8. Cada una verificada con `cargo check`, `pnpm typecheck` y `pnpm lint` reales (no solo escrito) antes de marcarla lista.

| Fase | Estado | Dónde | Verificado |
|---|---|---|---|
| 0 | ✅ Spike | `desktop-voice-spike/` | Compila (`target/debug/` tiene binario) |
| 1 | ✅ Cliente delgado | `apps/desktop/` | `devUrl`/`frontendDist` correctos |
| 2 | ✅ Núcleo Rust | `apps/desktop/src-tauri/` — mic-recorder, fs, clipboard-manager, screenshots | `cargo check` limpio, crates reales (no alucinados) |
| 3 | ✅ STT en cliente real | Reusa `ChatPanel.tsx`, sin duplicar código | Typecheck+lint limpios |
| 4 | ✅ Context Builder + snaps | `lib/context-builder.ts`, comando `ocr_screenshot` | Compilación Rust + permiso ACL corregido (`ocr-screenshot`, no `ocr_screenshot`) |
| 5 | ✅ Multi-provider BYO-key | `lib/ai.ts` (`resolveChatModel`/`resolveAuditModel`) | Aditivo — default sin `provider` = comportamiento idéntico al MVP |
| 6 | ✅ Permisos UI + CI matrix | `lib/permissions.ts`, `PermissionsPanel.tsx`, `.github/workflows/desktop-build.yml` | Typecheck+lint+YAML válido. **Firma de código real: bloqueada en certs, no en código** (ver TODO en el workflow) |
| 7/7.1 | ✅ Skill Registry + personalityPrompt | `lib/skills/registry.ts`, `/api/skill/[skillKey]`, `CharacterTemplate.personalityPrompt` | Aditivo — `/api/chat`/`/api/audit` intactos. Schema validado (`prisma validate`) |
| 8 | ✅ Schema pgvector/MemoryEntry | `prisma/schema.prisma`, migración escrita | Schema válido, cliente genera limpio. **Migración NO aplicada** contra la DB real del equipo (Supabase) — decisión deliberada, requiere confirmación explícita antes de tocar esa instancia compartida |

**Lo que ningún nivel de verificación de código puede confirmar acá** (limitaciones del entorno, no del trabajo): loop de voz con audio real, captura de pantalla real, lectura de portapapeles real, firma de binarios, y builds reales en Windows/macOS vía CI (el workflow es `workflow_dispatch`, nadie lo disparó todavía). Todo eso necesita hardware/GUI/certs/ejecución humana.

---

## 1. Objetivo — la meta al 100%

El pitch de El Compañero (`docs/PITCH.md`) promete tres decisiones del usuario: **quién es** (personaje, voz), **qué sabe** (packs de capacidades) y **qué puede tocar** (permisos granulares, revocables, auditables).

En la web actual, "qué puede tocar" es un flag de aplicación (`ActiveSkill` en la base de datos) — no un permiso real del sistema operativo. La meta de este plan es que esa promesa deje de ser aspiracional: que el compañero tenga acceso real y controlado al micrófono, al portapapeles, al sistema de archivos y a la pantalla, gobernado por permisos que el usuario otorga y puede revocar — auditable porque el código es libre (AGPL).

La meta declarada es cumplir esto **al 100%**, no una versión recortada. Este documento traza el camino completo, fase por fase, incluyendo las partes que en una primera pasada quedaron fuera (multi-pack, memoria real, negocio) y que se incorporaron después como fases adicionales.

---

## 2. Decisiones de arquitectura — resumen y porqué

### 2.1. Tauri v2 como cliente delgado, no reescritura completa

**Qué:** la app de escritorio es un cliente Tauri v2 que reutiliza el frontend Next.js existente (`apps/web/`) casi sin cambios, y sigue hablando por HTTP con el servidor ya deployado en `companion.wuju.dev`.

**Por qué:** la app actual tiene secretos server-side (`OPENAI_API_KEY`, `ELEVENLABS_API_KEY`) y persistencia vía Prisma/Postgres — nada de eso corre dentro de un webview. La alternativa (reescribir todo el backend en Rust y comandos `invoke()`) obligaría a portar Prisma, duplicar toda la lógica de `lib/ai.ts`, y expondría secretos de servidor en un binario que corre en la máquina del usuario. Se descartó por sobrecosto de ingeniería y por riesgo de seguridad.

### 2.2. Split estricto: `invoke()` solo para el sistema operativo

**Qué:** todo lo que hoy no existe en la web (micrófono, portapapeles, archivos, captura de pantalla, atajo global, bandeja del sistema, notificaciones) se implementa en el núcleo Rust y se expone vía `invoke()`. Todo lo que ya existe (`/api/chat`, `/api/audit`, `/api/tts`, base de datos) sigue viajando por `fetch` HTTP normal al servidor.

**Por qué:** mezclar ambos (mover endpoints de IA a `invoke()`) fue la primera tentación del plan original y se descartó — repite el problema de 2.1. La regla de split evita esa deriva.

### 2.3. Clave propia del usuario (BYO-key), agnóstica de proveedor

**Qué:** el usuario final ingresa su propia API key, guardada en el keyring del sistema operativo vía `tauri-plugin-store`/keyring. La llamada al modelo para "pensar" (chat, audit) se hace **directamente desde el cliente** (proceso local, no vía el VPS), usando esa key.

**Sin preferencia de proveedor (aclarado 2026-07-04):** el campo de configuración acepta cualquier proveedor soportado por el Vercel AI SDK — OpenAI, Anthropic, u otro. No está hardcodeado a uno solo. Para probar el flujo de instalación/permisos en esta etapa se usa la key de OpenAI que el equipo ya tiene cargada en `.env` con crédito disponible (~$50) — es la opción práctica para testear ahora, no una decisión de arquitectura sobre cuál proveedor "es el bueno".

**Por qué BYO-key (frente a key centralizada en servidor):** decisión explícita del usuario. Esto cambia el rol del VPS: deja de ser el intermediario de la llamada al LLM y pasa a encargarse solo de persistencia (personaje, inventario, mensajes), TTS (si ElevenLabs sigue siendo key de equipo) y el marketplace/login (ver fase 9). El código de `lib/ai.ts` (system prompts, schemas Zod, `streamText`/`generateObject`) se reutiliza casi textual — cambiar de proveedor es cambiar qué factory se instancia (`createOpenAI` / `createAnthropic`) según el formato de la key que el usuario pegó, no reescribir lógica.

**Nota de seguridad:** esto es distinto a "poner un secreto de la empresa en el binario". Acá la key es del propio usuario, vive solo en su keyring local, nunca se distribuye. El riesgo que se evita en 2.1 (secretos de servidor expuestos) no aplica igual cuando el secreto es del usuario y se queda en su máquina.

### 2.4. Economía de tokens por diseño, no por buena voluntad

**Qué:** arquitectura en 4 capas donde el modelo de pago (Claude) es la última puerta, no la primera. Detalle completo en la sección 5.

**Por qué:** con key propia del usuario, el costo de tokens lo paga directamente él. Sin control de diseño, funciones como "escucha continua" o "mira la pantalla todo el tiempo" queman su cuota sin que se dé cuenta. El diseño previene esto estructuralmente.

---

## 3. Qué se descartó del plan original y por qué

El plan inicial (aportado por el equipo) tenía piezas que, revisadas, generaban contradicciones técnicas. Se descartaron o corrigieron:

| Propuesta original | Problema encontrado | Corrección |
|---|---|---|
| Wispr Flow como capa de captura de voz | Su API es de acceso exclusivo por aprobación, y las alianzas de API están **pausadas** (verificado julio 2026). No se puede arquitecturar sobre algo inaccesible. Además el diagrama original transcribía dos veces (Wispr Flow ya es STT, no alimenta a Whisper). | Whisper como motor STT real (local con `whisper.cpp` o servidor con `whisper-1`). Wispr Flow queda como mejora futura opcional, si algún día aprueban acceso. |
| `invoke()` para reemplazar llamadas HTTP de IA | Obliga a reescribir backend en Rust, duplica Prisma, expone secretos en el cliente. Contradice el principio de "reusar 90% del frontend". | Split estricto de la sección 2.2. |
| n8n en la ruta caliente voz→LLM→voz | Cada turno de conversación cruzaría un servicio hosteado externo — rompe el principio de baja latencia. | n8n queda async, fuera de la ruta caliente: recibe eventos (audit crítico, log de conversación), no los intermedia. |
| Captura de pantalla en intervalo fijo + análisis VLM constante | Costo de tokens alto (cada captura a un modelo con visión cuesta), fricción de permisos del sistema operativo (macOS pide autorización explícita de Screen Recording), y contradice el principio de latencia/costo bajo. | Captura **solo on-demand**: por atajo de teclado o por intención detectada en el habla ("mirá esto"), nunca por temporizador. OCR local primero; visión solo si el OCR no alcanza. |
| Construir a mano una capa de "proveedores de IA intercambiables" | El Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`) ya es esa abstracción. Reconstruirla es trabajo redundante. | Cambiar de proveedor es cambiar el `model()` pasado a `streamText`/`generateObject`, no nueva arquitectura. |

---

## 4. Arquitectura objetivo

```
                         Usuario
                            │
              Voz / Mouse / Pantalla / Atajo
                            │
      ┌───────────────────────────────────────────┐
      │              Tauri Desktop                  │
      ├───────────────────────────────────────────┤
      │  Frontend Next.js/React (reusado ~intacto) │
      │  Núcleo Rust: OS hooks, Event Bus,          │
      │  Permission Manager (capabilities Tauri v2) │
      └───────────────┬─────────────────────────────┘
                       │
        ┌──────────────┼───────────────┐
        │              │               │
   STT local      Screen/OCR      Context Builder
   (whisper.cpp)   on-demand       (ver sección 5)
        │              │               │
        └──────────────┴───────┬───────┘
                                │
                     Llamada directa a Claude
                     (key del keyring del usuario,
                      sin pasar por el VPS)
                                │
                          ElevenLabs TTS
                     (vía VPS, key de equipo)
                                │
                            Usuario
                                │
        (async, fuera de ruta caliente) → n8n → reportes/eventos

        (aparte) → companion.wuju.dev → marketplace, login,
                    persistencia (Postgres/Prisma), pago simulado
```

---

## 5. Context Builder — diseño detallado

El Context Builder es el componente que decide **qué information llega al modelo** en cada turno. Es la pieza central de la economía de tokens y del cumplimiento real de permisos.

### 5.1. Pipeline en 5 etapas

**Etapa A — Captura local (Rust/Tauri, costo $0)**
- Detección de actividad de voz (VAD) actúa como compuerta.
- STT local (`whisper.cpp`) convierte audio a texto sin costo de red ni tokens.
- Hooks del sistema operativo: nombre de la app activa, título de ventana.
- Lectura de portapapeles/sistema de archivos **solo si el permiso correspondiente ya fue otorgado** (ver 5.4).

**Etapa B — Triage de intención (barato)**
- Reglas simples primero: "auditá este código" → intención = audit, sin pasar por modelo. "Qué dice la pantalla" → intención = consulta de pantalla.
- Si la intención es ambigua, una sola llamada a un modelo pequeño y barato (Haiku) clasifica la intención.
- Esta etapa decide qué contexto hace falta reunir a continuación — no reúne de más "por las dudas".

**Etapa C — Ensamblado del contexto (local, costo $0)**
- Si intención = chat: se toman los últimos N mensajes (mismo patrón que hoy en `apps/web/app/api/chat/route.ts`, que usa `take: 8`).
- Si intención = audit: solo el código y el lenguaje, sin historial de conversación.
- Si intención = consulta de pantalla: se corre OCR local primero. Si el texto extraído alcanza para responder, **nunca se envía una imagen a un modelo con visión** — ahí está el ahorro más grande de esta etapa.
- El contexto se poda/resume si excede un presupuesto de tokens configurado, en vez de enviarse crudo y completo cada vez.
- Se arma el system prompt (personalidad del personaje, igual que hoy en `apps/web/lib/ai.ts`).

**Etapa D — Llamada al modelo (la única etapa con costo real de LLM)**
- Reutiliza las funciones ya existentes `chatWithCompanion` / `auditCode` de `lib/ai.ts`, apuntando al proveedor configurado por el usuario (ver 2.3 — agnóstico, hoy probado con OpenAI).
- El system prompt y el contexto estable se marcan para **prompt caching** cuando el proveedor lo soporta (Anthropic vía `cache_control`, OpenAI con cacheo automático de prefijos repetidos en modelos recientes), lo que reduce fuertemente el costo de la parte cacheada cuando se repite entre turnos.

**Etapa E — Post-proceso**
- La respuesta se envía a `/api/tts` (ya existe, con cache por hash de `texto+voiceId`).
- El turno se persiste (vía la API existente hacia `companion.wuju.dev`, o en cola local si no hay conexión).
- Se emite un evento del bus de eventos de Tauri para que la interfaz reaccione (estado "hablando"/"pensando"/"inactivo", mismo patrón que `CharacterState` hoy en el frontend).

### 5.2. Memoria — tres niveles

- **Nivel 1 — buffer de sesión:** la conversación actual, en memoria/SQLite local. Siempre se incluye.
- **Nivel 2 — historial en base de datos:** tabla `Message` (ya existe en Postgres), ventana de 8 a 20 mensajes. Se consulta solo si la intención lo requiere.
- **Nivel 3 — memoria semántica:** ver Fase 8 (sección 7). No existe todavía; es la pieza que falta para que el compañero "recuerde" más allá de la ventana corta.

### 5.3. Captura de pantalla — compuerta estricta

Nunca continua. Se dispara solo por atajo de teclado explícito o por intención detectada en la Etapa B.

**Refinamiento (2026-07-04) — Tesseract no alcanza para código:** es un motor maduro, bueno para texto de UI normal (diálogos, párrafos, fuente estándar, alto contraste), pero débil para código — fuente monoespaciada + resaltado de sintaxis (colores) + símbolos especiales confunden su binarización. Si el flujo dependiera de OCR para "leer código en pantalla", terminaría escalando a visión (la puerta cara) casi siempre en el caso de uso más frecuente del producto (Guardián de código), rompiendo el ahorro de tokens que la Etapa C busca.

**Regla corregida según el tipo de contenido:**
- **Código:** preferir **portapapeles** (ya capturado en la Etapa A, gratis, exacto, sin riesgo de mal-lectura) sobre captura de pantalla + OCR. El flujo natural es que el usuario copie el código, no que lo "fotografíe".
- **Texto de UI general** (diálogos, mensajes, páginas web, texto plano): OCR local (Tesseract) primero, alcanza para este caso.
- **Código en pantalla sin portapapeles disponible, o contenido visual no textual** (diagramas, disposición de UI): saltar el intento de OCR directamente e ir a un modelo con visión — no vale la pena el round-trip de un OCR que probablemente falle.

### 5.4. Permisos — donde se cumple la promesa del pitch

La Etapa A verifica, antes de leer portapapeles/archivos/pantalla, no solo si el sistema operativo lo permite sino si **el usuario otorgó ese permiso específico a ese pack/skill específico**. Este es el punto exacto donde "qué puede tocar" deja de ser un flag de base de datos y pasa a ser un permiso real, revisado por el sistema de capabilities de Tauri v2 (ver Fase 6).

### 5.5. Estructura de datos de referencia

```ts
type ContextIntent = "chat" | "audit" | "screen-query" | "action";

type BuiltContext = {
  intent: ContextIntent;
  systemPrompt: string;              // cacheable, basado en personalidad (ya existe en ai.ts)
  history?: ChatHistoryMessage[];    // solo si intent = "chat"
  code?: { source: string; language: string }; // solo si intent = "audit"
  screenText?: string;               // solo si corrió OCR y hubo intención de pantalla
  screenImage?: Buffer;              // SOLO si el OCR fue insuficiente — última puerta, la más cara
  activeApp?: string;                // señal local, sin costo
};
```

Cada campo es opcional deliberadamente: son tokens que no se envían si no aplican. El ahorro de costo está en la forma misma de este objeto, no es una promesa aparte.

---

## 6. Economía de tokens — las 4 capas y las reglas duras

### 6.1. Las 4 capas (resumen, detalle en sección 5)

```
Capa 0 — Local, costo $0:       VAD, hotkey/wake-word, STT local, detección de app activa, OCR local.
Capa 1 — Triage barato:         reglas + modelo chico (Haiku) solo si hace falta clasificar intención.
Capa 2 — Tarea real:            Claude Sonnet/Opus, solo cuando la Capa 1 confirma que hace falta razonar.
Capa 3 — Cache:                 prompt caching de Anthropic + cache exacto de TTS (ya existente).
```

### 6.2. Reglas duras (no negociables en el diseño)

1. **Push-to-talk por default.** El micrófono no queda escuchando de forma continua sin una compuerta explícita (atajo o wake-word local) — escucha continua sin gate implica STT y LLM corriendo sin parar.
2. **Captura de pantalla nunca por temporizador**, siempre on-demand (ver 5.3).
3. **Contexto podado, no acumulado.** El Context Builder manda la ventana relevante, no el historial completo en cada turno.
4. **Modelo según la tarea, no siempre el más grande.** Haiku para enrutar/tareas simples, Sonnet/Opus reservado para lo que de verdad necesita razonamiento.
5. **Tope de gasto visible y configurable** por el usuario (por ejemplo, límite diario), con aviso o pausa automática al alcanzarlo — coherente con la promesa de "auditable" del pitch.
6. **Degradación sin caída de la interfaz.** Si se corta la key o se agota la cuota, la Capa 0 sigue funcionando (STT local, respuestas básicas locales) — la app no se rompe. Esto ya es una regla existente en `CLAUDE.md` (punto 7: manejo de errores obligatorio en llamadas a LLM/ElevenLabs).

---

## 7. Fases — detalle completo (0 a 9)

### Fase 0 — Spike de voz (validación, no producción)

**Objetivo:** probar en la práctica, en un día, que el loop `Tauri + plugin de micrófono + Whisper → texto` funciona antes de invertir en el núcleo Rust completo.

**Por qué existe esta fase:** el plan original saltaba directo a construir el núcleo en Rust (MB-002) sin validar primero la parte más incierta (voz). Esta fase de-riesga esa apuesta con la menor inversión posible.

**Qué incluye:** scaffold mínimo de Tauri v2, plugin de micrófono, llamada a Whisper (local o vía API), texto resultante inyectado en el `<input>` del chat que ya existe en `apps/web/components/companion/ChatPanel.tsx`.

**Entregable:** confirmación de que el loop de voz es viable en latencia y precisión aceptables. Es código descartable, no base de producción.

---

### Fase 1 — Tauri como cliente delgado

**Objetivo:** la app de escritorio carga el frontend ya deployado en `companion.wuju.dev`, sin mover lógica de servidor al cliente.

**Por qué:** aprovecha el 100% de la inversión ya hecha (VPS, Caddy, pm2, PostgreSQL/Supabase — ver `docs/DEPLOY.md`). El frontend de `apps/web/` se reutiliza casi sin tocar.

**Qué incluye:** proyecto Tauri v2 apuntando a la URL de producción, configuración básica de ventana/ícono/nombre de la app.

**Entregable:** una ventana nativa que muestra la app web actual funcionando igual que en el navegador.

---

### Fase 2 — Núcleo Rust de capacidades del sistema operativo

**Objetivo:** implementar, en Rust, únicamente las capacidades que la web no tiene hoy: micrófono, portapapeles, sistema de archivos, captura de pantalla, atajo global, bandeja del sistema, notificaciones.

**Por qué separado:** respeta el split de la sección 2.2 — nunca mezclar esto con los endpoints de IA.

**Qué incluye:** comandos `invoke()` para cada capacidad, un Event Bus interno para que el frontend reaccione a eventos del sistema (por ejemplo, "se detectó voz", "cambió la app activa").

**Entregable:** API de comandos nativos disponible desde el frontend, sin lógica de negocio todavía.

---

### Fase 3 — STT productivo

**Objetivo:** reemplazar el spike de la Fase 0 por una integración real y probada de Whisper (local con `whisper.cpp` o remota con `whisper-1`), con manejo de errores y latencia aceptable para conversación fluida.

**Por qué Whisper y no Wispr Flow:** ver sección 3 — la API de Wispr Flow es de acceso restringido y sus alianzas están pausadas. Whisper es la opción disponible hoy; Wispr Flow queda como mejora opcional futura si cambia su disponibilidad.

**Entregable:** transcripción de voz a texto integrada al flujo real de chat, no solo un demo.

---

### Fase 4 — Snaps on-demand y Context Builder

**Objetivo:** implementar la captura de pantalla bajo demanda (nunca por temporizador) y el Context Builder descrito en la sección 5.

**Qué incluye:** OCR local, la compuerta de intención/atajo, y el ensamblado de contexto en las 5 etapas.

**Entregable:** el compañero puede responder preguntas sobre lo que el usuario tiene en pantalla, solo cuando se le pide, sin costo de tokens fuera de esos momentos.

---

### Fase 5 — n8n async y multi-proveedor

**Objetivo:** conectar n8n como receptor de eventos (no como intermediario del turno de conversación) y habilitar el cambio de proveedor de LLM a través del Vercel AI SDK.

**Por qué:** ver sección 3 — n8n en la ruta caliente rompe la latencia; una capa de proveedores hecha a mano duplica lo que el AI SDK ya resuelve.

**Qué incluye:** los webhooks existentes (`audit-critical`, `conversation-log`, ya en `apps/web/lib/n8n.ts`) siguen funcionando igual, disparados de forma asíncrona. Se agrega la posibilidad de elegir proveedor (`@ai-sdk/anthropic`, `@ai-sdk/openai`, otros) sin tocar la lógica de negocio.

**Entregable:** automatizaciones de n8n funcionando sin agregar latencia a la conversación; proveedor de IA configurable.

---

### Fase 6 — Permisos reales, empaquetado y distribución

**Objetivo:** esta es la fase que cierra la promesa central del pitch ("qué puede tocar"). Se construye el sistema completo de permisos granulares — no solo el punto de verificación de la sección 5.4, sino la experiencia completa: pantalla donde el usuario ve qué permisos tiene otorgados a qué pack/skill, puede revocarlos, y un registro auditable de qué se usó y cuándo.

**Por qué es su propia fase:** es la pieza más importante y la más fácil de dejar a medias — el resto de las fases puede funcionar sin ella (con permisos implícitos), pero sin esta fase la promesa de "auditable y revocable" del pitch queda incompleta.

**Qué incluye además:**
- Sistema de capabilities de Tauri v2 configurado por permiso y por comando.
- Almacenamiento seguro de la key del usuario (keyring del sistema).
- `tauri-plugin-updater` con firma de binarios y actualizaciones verificadas.
- Pipeline de CI (GitHub Actions) con matriz de sistemas operativos (`windows-latest`, `macos-latest`, `ubuntu-latest`), cada uno generando su propio instalador nativo: `.msi`/`.exe` (Windows), `.dmg` (macOS), `.AppImage`/`.deb` (Linux). No se obtienen los tres desde un solo build local — cada instalador se compila en (o para) su propio sistema operativo.
- **Pantalla de permisos por función/skill** — validada con un boceto del equipo: por cada función del personaje (chat-base, code-guardian, futuros packs de la Fase 7), una fila con nombre + toggle de permiso. Layout simple (lista + switch), sin sobre-diseñar. Es la superficie donde el usuario ve y revoca qué puede tocar cada capacidad — la implementación concreta del Permission Manager de la sección 4.
- **Instalación = instalador nativo con doble-click** (`.exe`/`.dmg`/`.AppImage`), no un flujo de línea de comandos. El onboarding post-instalación (pegar API key, revisar permisos, importar algo del marketplace) corre dentro de la propia app ya instalada, no en una terminal.

**Entregable:** aplicación instalable, firmada, actualizable, distribuible a usuarios reales en las tres plataformas, con permisos reales, granulares y auditables.

---

### Fase 7 — Skill Registry (packs por profesión)

**Objetivo:** generalizar el sistema de capacidades para que agregar un pack nuevo (marketing, diseño, negocio) no implique tocar arquitectura, solo escribir contenido.

**Por qué hace falta:** hoy `apps/web/lib/ai.ts` tiene dos funciones escritas a mano (`buildChatSystemPrompt`, `buildAuditSystemPrompt`), una por skill. Esto no escala a N packs sin repetir trabajo de ingeniería cada vez. El modelo `Pack` ya existe en el esquema de datos (`docs/CONTRATOS.md`) pero hoy es solo metadata de venta en el marketplace — no está conectado a una ejecución real.

**Qué incluye:**
```ts
type SkillDefinition = {
  key: string;                       // "chat-base" | "code-guardian" | "marketing-review" | ...
  buildSystemPrompt: (ctx: BuiltContext) => string;
  outputSchema?: ZodSchema;          // presente → generateObject, ausente → streamText
  needsHistory: boolean;
  needsCode: boolean;
};
```
Una ruta única `POST /api/skill/:skillKey` reemplaza las rutas específicas de hoy (`/api/chat`, `/api/audit`), buscando el handler correspondiente en el registro y ejecutando el flujo del Context Builder de forma genérica.

**Entregable:** agregar un pack nuevo pasa a ser tarea de contenido (prompt + schema), no de arquitectura.

### 7.1. Extensión: personalidad como producto de marketplace

Mismo patrón que el Skill Registry, aplicado a **personajes** (no skills). Hoy la personalidad vive en un mapa hardcodeado (`personalityDescriptions` en `lib/ai.ts`) con 4 valores fijos. Para que el marketplace de personajes (`CharacterTemplate`, ya existe en schema) sea real y no solo catálogo estático, se agrega:

```prisma
model CharacterTemplate {
  // ya existe: key, rol, voz, stats, priceCents
  personalityPrompt String   // texto libre escrito por el creador, reemplaza el mapa hardcodeado
}
```

Flujo: creador escribe `personalityPrompt` en el portal de creadores (ya en el roadmap) → pasa curaduría → se publica → comprador lo adquiere igual que hoy adquiere un `Part` (mismo `Ownership`, mismo `/api/marketplace/checkout`) → al runtime, `lib/ai.ts` usa el `personalityPrompt` del `CharacterTemplate` comprado en vez del mapa fijo.

**Riesgo de seguridad que esto introduce — prompt injection vía marketplace:** un `personalityPrompt` de un creador externo se inyecta directo al system prompt. Sin capas, un personaje malicioso podría intentar pisar reglas de seguridad del sistema. **Mitigación obligatoria:** system prompt en dos capas — núcleo inmutable (reglas no-negociables, ya definidas en `lib/ai.ts`) + `personalityPrompt` del creador como capa configurable que nunca puede sobreescribir el núcleo. La curaduría del marketplace debe revisar el contenido del prompt en sí, no solo nombre/avatar/voz.

---

### Fase 8 — Memoria semántica

**Objetivo:** que el compañero recuerde información relevante del usuario más allá de la ventana corta de mensajes recientes — la parte del pitch que dice "te conoce", "recuerda lo que hiciste ayer".

**Por qué es su propia fase:** `CLAUDE.md` excluye explícitamente base de datos vectorial del MVP web ("memoria es JSON simple con últimas 20 interacciones"). Esta fase revisa esa decisión deliberadamente para la capa de escritorio, como evolución posterior al MVP, no como cambio silencioso de las reglas del MVP web.

**Qué incluye:**
- Tabla nueva `MemoryEntry` con extensión `pgvector` (compatible con Supabase): `{ id, characterId, content, embedding, kind: fact | preference | event, createdAt }`.
- Después de cada turno, de forma asíncrona (sin bloquear la respuesta al usuario), un modelo barato (Haiku) extrae hechos durables del intercambio — no se guarda la conversación cruda, se guardan hechos destilados ("prefiere respuestas cortas", "trabaja en un proyecto en TypeScript").
- En la Etapa C del Context Builder, se hace una búsqueda por similitud (top-k) sobre `MemoryEntry` filtrada por personaje, y los hechos relevantes se inyectan al system prompt.

**Por qué no rompe la economía de tokens:** la extracción es asíncrona y con modelo barato; a cambio, ahorra tokens a futuro porque se envían hechos destilados en vez de reenviar historial completo una y otra vez.

**Entregable:** el compañero incorpora información persistente sobre el usuario entre sesiones, no solo dentro de una conversación.

---

### Fase 9 — Integración con marketplace y negocio (simplificada)

**Objetivo original vs. decisión final:** en un primer diseño, esta fase incluía pagos reales vía Stripe. Se simplificó por decisión explícita: no hace falta Stripe real ni un marketplace propio dentro de la app de escritorio.

**Qué incluye en su versión final:**
- La app de escritorio abre/enlaza el marketplace ya existente en `companion.wuju.dev` (en un webview o en el navegador del sistema), que ya tiene login y pago simulado (`Order.status: "paid_simulated"`, ya implementado y documentado en `docs/CONTRATOS.md`).
- Sesión compartida: el mismo login (cookie `companion_session`, tabla `Session`, ya existentes en `apps/web/lib/auth.ts`) permite que una compra hecha en la web se refleje en el escritorio, porque ambos consultan la misma API (`GET /api/marketplace/catalog`, `GET /api/character`, etc.) sobre la misma base de datos.

**Por qué esta simplificación es correcta y no un recorte:** `CLAUDE.md` prohíbe explícitamente pagos reales en el MVP ("Pagos reales con Stripe — marketplace visual y mockeado"). Mantener el pago simulado en la web y solo enlazar desde el escritorio es coherente con esa regla, no la contradice.

**Fuera de esta fase (workstream aparte, no técnico):** los "agentes empresariales pre-configurados" del modelo de negocio (`docs/PITCH.md`) son trabajo de configuración y ventas — armar un paquete de personaje + packs curados para una empresa específica usando los modelos `CharacterTemplate` y `Pack` que ya existen en el esquema — no motor de software nuevo.

**Entregable:** el usuario puede comprar personajes/packs desde la web y verlos reflejados en el escritorio, sin duplicar lógica de pagos ni de marketplace.

---

## 8. Flujo de demo end-to-end (walkthrough validado por el equipo)

Este es el recorrido concreto que se debe poder mostrar una vez completadas las fases relevantes — sirve como guion de demo/pitch y como checklist de aceptación.

```
1. Login en la landing (companion.wuju.dev)                     → ya existe hoy
2. Descargar el instalador de escritorio desde la landing        → Fase 6
3. Instalar con el instalador nativo (doble-click .exe/.dmg/.AppImage,
   NO un flujo de terminal/CLI)                                  → Fase 6
4. Abrir la app: lo que ya está desbloqueado/comprado en el       → Fase 9
   marketplace aparece solo, por sesión compartida con la
   cuenta de la landing — SIN ningún paso de "subir" o
   "importar" un archivo manualmente. Esto se repitió como
   malentendido varias veces: no existe ese mecanismo, ni
   siquiera al terminar todas las fases.
5. Pantalla de PERSONALIZACIÓN (elegir personaje, wardrobe,       → Fase 1
   voz) — corre dentro de la propia app, reusando el frontend
   de `apps/web/companion` casi intacto, no es pantalla nueva
6. Pantalla de CONFIGURACIÓN/AJUSTES (distinta de la anterior):   → Fase 6,
   acá se pega la API key (proveedor a elección — hoy se           sección 2.3
   prueba con la key de OpenAI ya cargada en `.env`) y se
   ven/tocan los permisos por función (toggle, ver boceto
   de la sección 7, Fase 6)
7. Confirmar que n8n sigue funcionando — probar con el comando    → Fase 5
   curl ya documentado en `docs/DEV-D.md` contra el webhook
   `audit-critical`, o disparando un audit real con código
   vulnerable desde el chat
```

Los pasos 1 y 4 (login, marketplace) y el paso 7 (n8n) **ya funcionan hoy en la web**, sin código nuevo — se pueden demostrar ahora mismo. Los pasos 2, 3, 6 no existen todavía: son exactamente las Fases 0 a 6 de este plan. El paso 5 (personalización) ya funciona en la web hoy; en desktop es la misma pantalla, sin cambios de lógica.

## 9. Alcance final — qué cubre el 100% del pitch

| Promesa del pitch | Fase(s) que la cubre | Estado al completar todas las fases |
|---|---|---|
| Quién es (personaje, voz) | ya existe en la web | Heredado, sin cambios |
| Voz continua, conversación natural | 0, 1, 3 | Completo |
| Ve la pantalla cuando hace falta | 4 | Completo |
| **Qué puede tocar** (permisos reales, revocables, auditables) | 6 | Completo — el núcleo diferencial del producto |
| Instalable, firmado, actualizable, multiplataforma | 6 | Completo (Windows, macOS, Linux vía CI) |
| Qué sabe (packs por profesión) | 7 | Completo — arquitectura genérica, packs como contenido |
| Recuerda al usuario entre sesiones | 8 | Completo |
| Marketplace, compras reflejadas en escritorio | 9 | Completo (vía integración con `companion.wuju.dev`) |
| Modelo de negocio: agentes empresariales | fuera de este plan | Workstream de producto/ventas, no técnico |

Al completar las Fases 0 a 9, el producto cumple el 100% de lo técnicamente prometido por el pitch. El único punto que queda deliberadamente fuera de este documento es la ejecución comercial de "agentes empresariales pre-configurados", que es un proceso de ventas y configuración, no una tarea de ingeniería adicional — la base de datos para soportarlo (`CharacterTemplate`, `Pack`) ya existe.

---

## 10. Decisiones — cerradas (2026-07-04)

- **ElevenLabs:** confirmado — sigue siendo key de equipo, server-side (ya está en `.env` y en `.github/workflows/ci.yml`). No pasa a BYO. A diferencia de la key del LLM, que sí es del usuario (sección 2.3).
- **Motor de OCR local:** Tesseract confirmado, pero con alcance acotado — ver regla corregida en la sección 5.3 (portapapeles para código, OCR solo para texto de UI general, visión directa para código en pantalla sin portapapeles o contenido no textual).
- **Runners de CI para Fase 6:** hospedados por GitHub (no propios). El repo ya usa `runs-on: ubuntu-latest` en `.github/workflows/ci.yml` — se extiende ese mismo pipeline con una matriz (`windows-latest`, `macos-latest`, `ubuntu-latest`) para los instaladores. Sin fricción nueva, mismo patrón ya en uso.
