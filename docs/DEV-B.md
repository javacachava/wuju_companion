# DEV B — Assets IA + Marketplace visual + Video demo

> Tu responsabilidad: el estilo visual del compañero + el marketplace navegable + el video final del demo.

## Tu carpeta

```
apps/web/app/marketplace/     ← página del marketplace
components/marketplace/       ← tus componentes
public/parts/                 ← assets generados por IA
docs/assets-log.md            ← log de prompts usados en Fal (creás vos)
```

## Docs que tenés que leer antes de empezar

1. `AGENTS.md` — reglas del repo
2. `docs/BRAND.md` — paleta, estilo visual
3. `docs/ASSETS.md` — especificación técnica de los assets
4. `docs/CONTRATOS.md` — endpoints `GET /api/marketplace/parts` y `POST /api/marketplace/acquire`
5. `docs/SEED.md` — qué partes tenés que generar

## Entregables

### Sí
- **25-30 assets del compañero** en `public/parts/` (5 categorías × 5-6 opciones), en el estilo visual lockeado
- **Página `/marketplace`** funcional con catálogo + modal + botón "agregar"
- **Video demo de 2-3 minutos** con screencast + narración + música
- **Log de prompts** en `docs/assets-log.md` para poder regenerar assets si se pierden

### No
- Assets 3D o animados (solo PNG estáticos)
- Sistema de compra real (es mock, ver `/api/marketplace/acquire`)

## Fase 1 — Lockeo del estilo visual (H+0 a H+2)

**Esto es lo más importante que hagas.** Si el estilo no queda lockeado en la hora 2, todo el proyecto se ve inconsistente.

### Prompt maestro para Fal

```
chibi mascot character, kawaii style, flat 2D illustration,
minimalist design, transparent background, centered composition,
soft outline, pastel colors, [PART_DESCRIPTION]
```

### Fase de exploración

Generá 15-20 versiones de la mascota completa cambiando `[PART_DESCRIPTION]` con:
- "cute round body"
- "simple friendly face"
- "gentle expression"

Fijate en:
- ¿El estilo se mantiene consistente entre generaciones?
- ¿El fondo transparente sale limpio?
- ¿Centrado?

### Cuando encontrés el que te gusta

**Guardá el `seed` de Fal.** Es CRÍTICO. Todos los assets posteriores usan el mismo seed para mantener consistencia.

Ejemplo de configuración en Fal:
```json
{
  "prompt": "chibi mascot character, kawaii style, flat 2D...",
  "seed": 42,
  "image_size": "square_hd",
  "num_inference_steps": 28,
  "guidance_scale": 3.5
}
```

### Plan B si Fal no da consistencia

- Cambiá a un modelo más determinista (SDXL con LoRA de estilo)
- Como último recurso: generá UNA mascota completa y en Photoshop/Photopea recortás las partes manualmente
- Reduce el catálogo a 3 categorías × 3 opciones = 9 assets (suficiente para demo)

## Fase 2 — Generación masiva (H+2 a H+6)

Con el estilo lockeado, generá cada parte por categoría:

### Categorías y variantes

| Categoría | Cantidad | Descripciones |
|-----------|----------|---------------|
| hair      | 5        | corto, largo, rizado, gorro, colita |
| eyes      | 5        | grandes, chicos, cerrados, guiño, con lentes |
| mouth     | 5        | sonrisa, seria, riendo, sorprendida, pícara |
| accessory | 5        | ninguno, sombrero, corbata, audífonos, bufanda |
| clothing  | 5        | camisa, sweater, hoodie, camisa formal, remera |

**Nomenclatura obligatoria:**
```
hair-corto.png
hair-largo.png
hair-rizado.png
eyes-grandes.png
mouth-sonrisa.png
```

### Log en `docs/assets-log.md`

Por cada asset, registrá:
```markdown
### hair-corto.png
- Prompt: [prompt exacto]
- Seed: 42
- Generado: [fecha]
- Notas: se usó img2img con base [X]
```

## Fase 3 — Marketplace UI (H+6 a H+10)

### Prompts iniciales para Codex

### Prompt 1 — página del marketplace

```
Basándote en docs/SKETCH.md sección "Layout del marketplace" y docs/CONTRATOS.md
(endpoints /api/marketplace/parts y /api/marketplace/acquire), creá:

apps/web/app/marketplace/page.tsx — página principal con:
- Header con título y filtros por categoría (todo, personajes, packs, pelo, ojos, boca, accesorio, ropa)
- Grid responsivo de tarjetas: 4 cols desktop, 2 tablet, 1 mobile
- Server component que fetchea /api/marketplace/parts en el server

components/marketplace/PartCard.tsx — client component tarjeta con:
- Imagen (aspect-square, object-contain)
- Nombre
- Badge "Premium" si isPremium (color púrpura de BRAND.md)
- Precio o "Gratis"
- Botón "Ver detalle"
```

### Prompt 2 — modal de detalle

```
Creá components/marketplace/PartDetailModal.tsx usando shadcn Dialog.
Muestra:
- Imagen grande (max 400x400)
- Nombre y descripción
- Botón grande "Agregar al inventario"

Al hacer click en agregar:
1. Toma characterId de localStorage
2. Hace POST a /api/marketplace/acquire con { characterId, partId }
3. Muestra toast de shadcn Sonner: "Agregado! Ya está en tu wardrobe"
4. Cierra el modal
```

### Prompt 3 — filtros

```
Agregá state para filtrar por categoría. Los filtros son chips clickeables arriba del grid.
Cuando se selecciona una categoría, solo se muestran las partes de esa categoría.
La categoría "todo" muestra todas. Estado inicial: "todo".
Usá URL search params (?category=hair) para que el filtro sea compartible.
```

## Fase 4 — Video demo (H+14 a H+20)

### Estructura del video (2 minutos 30 segundos)

- **0:00-0:15** — Intro: logo, tagline, música suave
- **0:15-0:45** — Problema: mostrar screenshots de asistentes actuales, narración corta
- **0:45-1:30** — Demo del compañero: elegir nombre, chatear, escuchar la voz
- **1:30-2:00** — Demo del Guardián de código: pegar código, ver audit, escuchar mascota narrando
- **2:00-2:20** — Marketplace: agregar personaje, aparece en wardrobe
- **2:20-2:30** — Cierre: pitch corto + tracks patrocinados + link al repo

### Herramientas
- **OBS Studio** para grabar el screencast (gratis, todos los OS)
- **CapCut** o **DaVinci Resolve** para editar
- **Freesound** o **Epidemic Sound** para música (usá libres de copyright)
- Podés generar voz de narración con ElevenLabs también

## Herramientas extra útiles

- **Fal.ai** — assets (aprovechen los créditos)
- **Photopea** — Photoshop web gratis, para recortes y ajustes
- **remove.bg** — quitar fondos si Fal no los da transparentes
- **TinyPNG** — comprimir los PNGs finales
- **v0.dev** — prototipar el marketplace rápido

## Checkpoints de tu progreso

- **H+2:** estilo visual lockeado, seed guardado, primeros 5 assets subidos
- **H+6:** los 25 assets subidos, seed y log completos
- **H+10:** marketplace UI funcional con datos mock
- **H+14:** marketplace conectado a los endpoints reales, primeras grabaciones de screencast
- **H+18:** video en edición
- **H+20:** video final subido, disponible para Dev A

## Riesgos específicos tuyos

1. **Consistencia visual entre assets.** Mitigación: mismo seed siempre. Si un asset no encaja, regeneralo o descartalo, no lo dejes.
2. **Timing del video.** Mitigación: no arranques a editar hasta H+14. Grabar y editar antes = grabar cosas que no van a estar en el demo final.
3. **Los assets no se ven bien en el chibi armado.** Mitigación: probá cada asset armando la mascota completa con Dev C antes de considerarlo terminado.

## Coordinación con otros devs

- **Con Dev C:** en H+2, mandale los primeros 5 assets para que empiece a integrar. En H+6 mandale el lote completo.
- **Con Dev E:** en H+6, dale el listado final de nombres de archivos para actualizar el seed de la DB.
- **Con Dev A:** en H+10, dale la ilustración más pulida de la mascota para el hero de la landing.
- **Con Dev D:** avisale si vas a grabar demo del audit, para que el prompt esté afinado.
