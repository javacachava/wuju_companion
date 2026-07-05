# DEV A — Landing + Copy + Video + Deck

> Tu responsabilidad: todo lo que el jurado y el público ven ANTES de entrar al producto.

## Tu carpeta

```
apps/web/app/(marketing)/     ← tus páginas de landing
components/landing/           ← tus componentes específicos
```

Lo que compartís con el resto: `components/ui/` (shadcn) y estilos globales.

## Docs que tenés que leer antes de empezar

1. `AGENTS.md` — reglas del repo
2. `docs/BRAND.md` — paleta, tipografía, tono
3. `docs/PITCH.md` — versiones del pitch (usás la de 30s y 2min)
4. `docs/SKETCH.md` — sección "Layout de la landing"

## Entregables

### Sí
- Landing pública en el dominio del equipo (VPS) con URL compartible
- Video demo de 2-3 minutos embebido en la landing
- Deck del pitch (10-12 slides) en PDF o Google Slides con link público
- Copy final de cada sección alineado al `PITCH.md`

### No
- Blog, docs de usuario, changelog (fuera del MVP)
- Formularios reales que envían emails (usá `mailto:` o link a un Google Form si hace falta)

## Prompts iniciales para Codex/Cursor

Copia estos tal cual, en orden. Cada uno construye sobre el anterior.

### Prompt 1 — estructura base

```
Basándote en docs/SKETCH.md sección "Layout de la landing" y docs/BRAND.md,
creá la página raíz en apps/web/app/(marketing)/page.tsx con estas secciones:

1. Hero con título, subtítulo, dos CTAs, ilustración a la derecha (usa un placeholder por ahora)
2. Sección "Cómo funciona" con 3 columnas
3. Sección "El pack de desarrollo" con dos features
4. Sección "Roadmap"
5. Sección "Open source"
6. Sección "Para empresas"
7. Footer

Usá server components salvo donde haga falta interactividad.
Usá shadcn/ui (Button, Card).
Mobile-first, breakpoints Tailwind estándar (md, lg).
Container max-w-6xl mx-auto.
Padding secciones py-20 md:py-32.
```

### Prompt 2 — animaciones del hero

```
Marcá el hero como client component. Agregá animaciones con Framer Motion:
- El título entra desde abajo con fade + translateY, delay 0.1s
- El subtítulo entra 0.2s después con el mismo efecto
- Los dos CTAs entran 0.3s después
- La ilustración de la mascota entra desde la derecha con un rebote leve (spring)

Todo debe respetar `prefers-reduced-motion`.
```

### Prompt 3 — comparativa con competencia

```
Agregá una nueva sección "Cómo se compara" entre "El pack de desarrollo" y "Roadmap".
Es una tabla comparativa con:
- Filas: Cursor, ChatGPT, Character.ai, El Compañero
- Columnas: Personalidad, Voz, Permisos granulares, Multi-vertical, Código abierto

Usá íconos de Lucide: Check verde, X gris.
La fila de El Compañero destacada con fondo azul claro (#EBF8FF).
```

### Prompt 4 — copy final

```
Reemplazá TODOS los textos placeholder con el copy definitivo de docs/PITCH.md.
Título del hero: "Tu compañero de trabajo. Con la cara y voz que vos elegís."
Subtítulo: "Libre y auditable. Elegís quién es. Elegís qué puede hacer."

Para cada sección, revisá que el tono coincida con docs/BRAND.md sección "Tono de voz".
No inventes copy, usá literalmente el que está en PITCH.md.
```

### Prompt 5 — SEO y meta tags

```
Agregá metadata al layout de (marketing):
- title: "El Compañero — Tu asistente libre, con cara y voz"
- description: (usá el tagline corto de BRAND.md)
- Open Graph con imagen (por ahora placeholder /og.png)
- Twitter card summary_large_image

Asegurate de que Lighthouse dé al menos 90 en Performance, Accessibility y SEO.
```

## Herramientas extra útiles

- **v0.dev** para prototipar secciones y traerlas
- **Framer Motion Playground** (motion.dev) para probar animaciones
- **Lucide.dev** para explorar íconos
- **Excalidraw** para el guion visual del video
- **CapCut** o **DaVinci Resolve** para editar el video
- **Loom** o **OBS Studio** para grabar el screencast
- **Canva** para el deck (rápido, plantillas decentes)

## Checkpoints de tu progreso

- **H+2:** landing con estructura y placeholder desplegada en el VPS
- **H+6:** todas las secciones armadas con copy provisorio
- **H+10:** copy final aplicado, animaciones del hero listas
- **H+14:** deck del pitch al 70%
- **H+16:** empieza edición del video (necesitás screencasts de Dev C ya listos)
- **H+20:** video final subido, deck cerrado, landing pulida
- **H+22:** ensayo del pitch verbal 2 veces

## Riesgos específicos tuyos

1. **Depender de assets de Dev B para el hero.** Mitigación: usá una ilustración placeholder linda desde el inicio (SVG geométrico), reemplazala en H+10 cuando Dev B tenga los assets.
2. **Video que graba demasiado tarde.** Mitigación: grabá el screencast en H+14 con lo que hay, no esperes al MVP perfecto.
3. **Deck que se te va de tiempo.** Mitigación: template de Canva o Pitch.com, no armes desde cero.

## Coordinación con otros devs

- **Con Dev B:** cuando tenga assets del compañero, pedile 1 versión "hero" (más grande, más pulida) para el hero de la landing.
- **Con Dev C:** cuando su app esté en un estado presentable (H+14), pedile un screencast de 60 segundos para el video demo.
- **Con Dev D:** avisale del texto que va en la landing para "Cómo funciona" para asegurarse que coincide con lo que el sistema hace.
