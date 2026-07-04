# SKETCH

> Descripción textual del sketch original de la app. Fuente visual para Dev C y Dev B.

## Layout general del compañero

La ventana del compañero se divide en tres zonas verticales, apilada de arriba a abajo:

### Zona 1 (arriba): Wardrobe / inventario
Barra horizontal de "slots de categoría": pelo, ojos, boca, accesorios, ropa. Cada slot muestra un mini-preview del ítem actualmente puesto. Al hacer click en un slot, se abre la zona 2 mostrando las opciones de esa categoría.

Debajo del selector de categoría hay un **grid de 3x3** con las partes disponibles en esa categoría. Cada celda es un ítem clickeable. Si el usuario tiene más de 9 ítems, aparece paginación abajo del grid (flechas izquierda/derecha con contador "01/05").

### Zona 2 (centro-izquierda): La mascota
La mascota se muestra grande, centrada en su propia caja. Se compone superponiendo las partes activas:
1. Fondo (opcional)
2. Cuerpo base
3. Ropa
4. Pelo
5. Ojos
6. Boca
7. Accesorios (encima de todo)

La mascota tiene animaciones sutiles: respiración (idle), habla (mueve la boca), pensamiento (leve rotación del cuerpo).

Al lado de la mascota, en la zona 2 derecha: el **grid de wardrobe** que se sincroniza con la categoría seleccionada arriba.

### Zona 3 (abajo): Datos y chat

Dos cajas lado a lado:

**Assistant Data (izquierda)** — información del compañero:
- Nombre del personaje
- Personalidad activa
- Voz seleccionada (con botón "escuchar sample")
- Skills activos (pills)
- Botón "cambiar personaje"

**Información del PJ (derecha)** — información del usuario/su avatar:
- Nombre del usuario
- Cantidad de ítems desbloqueados
- Últimas conversaciones (resumen)
- Botón "abrir chat" que expande el chat completo

Cuando el usuario abre el chat, la zona 3 se expande cubriendo la mascota. El chat tiene:
- Historial scrolleable arriba
- Input abajo con botón enviar
- Indicador "escribiendo..." mientras el LLM piensa
- Reproducción automática de audio con la voz del compañero

## Layout del marketplace

Página separada (`/marketplace`).

### Header
Título "Marketplace del Compañero" + filtros por categoría (todo, personajes, packs, pelo, ojos, etc.).

### Grid principal
Tarjetas de items en grid responsivo:
- 4 columnas en desktop
- 2 en tablet
- 1 en mobile

Cada tarjeta:
- Imagen del ítem (cuadrada, 1:1)
- Nombre
- Badge "Premium" si aplica (color púrpura)
- Precio en "monedas" del demo (o "Gratis" si no es premium)
- Botón "Agregar al inventario"

### Modal de detalle
Al clickear una tarjeta se abre un modal con:
- Imagen grande
- Descripción
- Preview de cómo se ve puesto en la mascota (opcional en MVP)
- Botón grande "Agregar al inventario"

Después de agregar: toast "Agregado! Ya está en tu wardrobe."

## Layout de la landing

Página raíz (`/`).

### Hero
- Título grande: "Tu compañero de trabajo. Con la cara y voz que elegís."
- Sub: "Libre y auditable. Elegís quién es. Elegís qué puede hacer."
- Dos CTAs: "Probalo ahora" (a `/companion`) + "Ver en GitHub"
- Ilustración: la mascota base a la derecha, animada (idle)

### Sección "Cómo funciona"
Tres columnas:
1. **Elegís quién es** — mascota + voz + personalidad
2. **Elegís qué sabe** — packs de capacidades
3. **Elegís qué puede tocar** — permisos granulares

### Sección "El pack de desarrollo"
Con dos features:
- **Guardián de código** — mockup de un audit report
- **Guardián de despliegue** — mockup + badge "Próximamente"

### Sección "Roadmap"
Lista de próximos packs:
- Marketing
- Diseño
- Negocios
- Estudio

Cada uno con un ícono y una descripción de una línea.

### Sección "Open source"
- Logo AGPL
- Link al repo GitHub
- Descripción de por qué es importante: "Porque un asistente que ve tus archivos debería ser un asistente que podés leer."

### Sección "Para empresas"
Placeholder con la propuesta de agentes senior + botón "Hablemos" (link a mailto o form).

### Footer
- Tracks del hackathon (ElevenLabs, n8n, Codex)
- Link al repo
- Créditos del equipo

## Notas importantes

- **Todas las zonas del compañero son fijas en el MVP.** No hay drag & drop de paneles, no hay redimensionamiento.
- **El wardrobe se sincroniza con el marketplace** vía el mismo `/api/inventory` — cuando el usuario agrega algo, aparece en el wardrobe automáticamente.
- **El personaje que ve en pantalla debe verse ARMADO** desde la primera carga. Si Dev B no tiene los assets aún, Dev C usa placeholders geométricos (círculos, cuadrados con colores) para no bloquearse.
