# DEV C — Compañero UI + Mascota + Wardrobe + Chat

> Tu responsabilidad: toda la experiencia dentro del producto. Es la parte más visible del demo.

## Tu carpeta

```
apps/web/app/companion/       ← página del compañero
components/companion/         ← todos tus componentes
```

## Docs que tenés que leer antes de empezar

1. `AGENTS.md` — reglas del repo
2. `docs/SKETCH.md` — layout del compañero (LEER TODO)
3. `docs/CONTRATOS.md` — endpoints que consumís (todos los `/api/character`, `/api/inventory`, `/api/chat`, `/api/audit`, `/api/tts`, `/api/skills/toggle`)
4. `docs/BRAND.md` — colores, tipografía
5. `docs/ASSETS.md` — cómo componer las partes

## Entregables

### Sí
- Página `/companion` con el layout completo del sketch
- Componente `<Character />` que compone las partes
- Wardrobe funcional con paginación
- Chat con streaming del LLM + reproducción de voz
- Componente `<AuditReport />` para el Guardián de código
- Onboarding: pantalla "elegí un nombre" en primera visita

### No
- Múltiples ventanas / multi-tab
- Sistema de arrastrar y soltar
- Modo oscuro (fuera del MVP, dejar solo modo claro)

## Prompts iniciales para Codex/Cursor

### Prompt 1 — onboarding

```
Basándote en docs/CONTRATOS.md endpoint GET /api/character?userName=X,
creá apps/web/app/companion/page.tsx que:

1. Al montar, revisa localStorage por "characterId"
2. Si NO existe → muestra <Onboarding /> con un input "elegí un nombre" y botón continuar
3. Al continuar → llama GET /api/character?userName=<nombre>, guarda characterId en localStorage
4. Si YA existe → muestra <CompanionApp characterId={id} />

components/companion/Onboarding.tsx — client component con:
- Input controlado
- Botón continuar (deshabilitado si input vacío)
- Loading state mientras crea el personaje
- Bienvenida centrada con el estilo de la BRAND
```

### Prompt 2 — layout principal

```
Creá components/companion/CompanionApp.tsx que renderiza el layout del sketch:

Zona 1 (arriba): <WardrobeSelector /> con pestañas de 5 categorías (hair, eyes, mouth, accessory, clothing)
Zona 2 (medio):
  - Izquierda: <Character /> renderizando la mascota
  - Derecha: <PartsGrid category={selectedCategory} /> grid 3x3 con paginación
Zona 3 (abajo):
  - Izquierda: <AssistantData /> con nombre, personalidad, voz, skills
  - Derecha: <CharacterInfo /> con nombre usuario, ítems, botón "abrir chat"

Container max-w-4xl mx-auto, padding py-8.
Usá grid CSS o flex, mobile-first (en mobile todo apila vertical).
```

### Prompt 3 — el componente Character

```
Creá components/companion/Character.tsx que recibe:
props: { parts: { hair: Part | null, eyes: Part | null, ... }, state: "idle" | "talking" | "thinking" }

Renderiza las partes superpuestas usando next/image con position absolute.
Z-index en este orden (de abajo a arriba):
1. body (siempre, imagen base /parts/body.png)
2. clothing
3. hair
4. eyes
5. mouth
6. accessory

Container relative, tamaño 300x300 en desktop, 200x200 en mobile.

Animaciones con Framer Motion:
- idle: scale de 1 a 1.02 en loop de 2s (respiración)
- talking: scale de la boca de 0.9 a 1.1 (300ms toggle)
- thinking: rotate de -1deg a 1deg cada 800ms

Todas respetan prefers-reduced-motion.
```

### Prompt 4 — wardrobe y grid

```
Creá components/companion/WardrobeSelector.tsx (5 tabs con íconos Lucide) y
components/companion/PartsGrid.tsx que:

1. Recibe category como prop
2. Fetchea GET /api/inventory al montar
3. Filtra por la categoría seleccionada
4. Renderiza grid 3x3 de PartCell (cada una imagen clickeable)
5. Paginación abajo: flechas izquierda/derecha + contador "01/05"
6. Al hacer click en una parte → PATCH /api/character con { characterId, category, partId }
7. Optimistic update: cambia la parte visible antes de que responda el servidor
8. Si el server responde error, revierte

Estado local del grid con useState para página actual.
```

### Prompt 5 — chat con voz

```
Creá components/companion/Chat.tsx usando useChat de Vercel AI SDK:

import { useChat } from "ai/react";

const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: "/api/chat",
  body: { characterId, activeSkill: "chat-base" }
});

UI:
- Historial de mensajes scrolleable (últimos 20 visibles)
- Burbujas alineadas: usuario a la derecha, assistant a la izquierda
- Input abajo con botón enviar (usa shadcn Input y Button)
- Indicador "escribiendo..." cuando isLoading

Al llegar un nuevo mensaje del assistant (isLoading pasa de true a false):
1. Llama POST /api/tts con el content del último mensaje
2. Reproduce el audio automáticamente con new Audio(URL.createObjectURL(blob))
3. Cambia el state del Character a "talking" mientras el audio se reproduce

Cachear audios ya escuchados en un Map<hash, Blob> local.
```

### Prompt 6 — panel de skills y activación de audit

```
Creá components/companion/SkillsPanel.tsx dentro de AssistantData:

- Muestra los skills disponibles como pills toggleables: "Chat base", "Guardián de código"
- Estado activo/inactivo por skill
- Al toggle → POST /api/skills/toggle

Cuando "Guardián de código" está activo:
- Agregar botón "Auditar código" al lado del input del chat
- Al click → abre un modal con textarea grande para pegar código + select de lenguaje
- Al enviar → POST /api/audit
- Response se renderiza con <AuditReport />
- Se llama TTS con response.characterVoicedSummary
```

### Prompt 7 — AuditReport

```
Creá components/companion/AuditReport.tsx que recibe el response de /api/audit.

Renderiza:
- Summary arriba en un banner (color según cantidad de críticos: rojo si hay, amarillo si solo altas/medias, verde si nada)
- Lista de findings como tarjetas colapsables:
  - Header: severity badge, título, línea
  - Body (expandible): description, suggestion, fixExample (con syntax highlight, usá shiki o prism)

Colores de severidad según BRAND.md:
- critical: rojo (#E53E3E)
- high: naranja (#DD6B20)
- medium: amarillo (#D69E2E)
- low: azul (#3182CE)
```

## Herramientas extra útiles

- **Vercel AI SDK docs** — `useChat` hook es una línea para tener streaming
- **Framer Motion Playground** — probar animaciones sin build
- **shadcn/ui docs** — hay ejemplos de chat prontos que podés adaptar
- **Shiki** o **Prism** para syntax highlighting en el AuditReport
- **Loom** para grabar tu screencast cuando esté listo (para Dev B)

## Checkpoints de tu progreso

- **H+2:** setup base, onboarding funcional, mascota se renderiza con placeholders
- **H+6:** wardrobe funcional con partes reales de Dev B, cambio de partes funciona
- **H+10:** chat con voz funcional, mascota animada bien
- **H+14:** Guardián de código y AuditReport funcionan end-to-end
- **H+16:** grabás un screencast completo para Dev B
- **H+20:** pulido visual, todos los estados de la mascota bien
- **H+22:** QA final del flujo

## Riesgos específicos tuyos

1. **La animación del compañero se ve robótica.** Mitigación: mirá referencias en Dribbble de "chibi mascot animation", copiá timing (300-500ms es lo que se ve natural).
2. **El chat se rompe con textos largos.** Mitigación: probar con respuestas de 2-3 párrafos desde el inicio, no solo "hola".
3. **La reproducción de audio no se auto-play.** Mitigación: navegadores bloquean autoplay sin interacción — la primera vez requiere click del usuario. Manejar ese caso mostrando botón "reproducir voz".

## Coordinación con otros devs

- **Con Dev B:** en H+2 pedile los primeros 5 assets, en H+6 el resto. Si no llegan a tiempo, usás placeholders geométricos (círculos de colores) y los reemplazás después.
- **Con Dev D:** en H+2 acordá el formato exacto del streaming del chat y el formato del response del audit. En H+8 probá el pipeline completo.
- **Con Dev E:** en H+2 acordá que GET /api/character devuelva las partes ya en formato de objeto con imageUrl (no solo IDs).
