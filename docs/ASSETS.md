# ASSETS

> Especificación técnica y de estilo de los assets del compañero. Fuente de verdad para Dev B y consumida por Dev C.

## Reglas técnicas no negociables

| Regla | Valor |
|-------|-------|
| Formato | PNG con canal alfa (fondo transparente) |
| Tamaño | 512 x 512 píxeles exactos |
| Composición | Personaje/parte centrada, márgenes ~40px |
| Ubicación | `public/parts/` en el repo |
| Nomenclatura | `categoria-nombre.png` en kebab-case, sin acentos ni ñ |
| Peso máximo | 200 KB por archivo (comprimir con TinyPNG si excede) |

Los assets que no cumplan estas reglas se rechazan y se regeneran. Dev C no debe retocar archivos manualmente.

## Nomenclatura de archivos

Formato: `<category>-<name>.png`

Categorías válidas: `hair`, `eyes`, `mouth`, `accessory`, `clothing`

Ejemplos válidos:
- `hair-corto.png`
- `hair-rizado.png`
- `eyes-grandes.png`
- `mouth-sonrisa.png`
- `accessory-sombrero.png`
- `clothing-hoodie.png`

Ejemplos inválidos:
- `Hair-Corto.png` — no usar mayúsculas
- `pelo-corto.png` — la categoría siempre en inglés
- `hair_corto.png` — usar guion, no underscore
- `hair-largo-suelto.png` — nombres de una palabra

Además hay dos archivos base fuera de categoría:
- `body.png` — cuerpo base del compañero (siempre visible, no cambia)
- `placeholder.png` — imagen de fallback (usado por Dev C si un asset no cargó)

## Estilo visual (lockeado)

### Descripción base
Chibi kawaii, flat 2D, sin gradientes complejos, colores planos, contornos suaves. La mascota es un personaje redondeado, tierno, con proporciones caricaturescas (cabeza grande, cuerpo pequeño).

### Paleta base del personaje
- Piel/cuerpo: crema claro `#FFF3E0`
- Contornos: gris oscuro suave `#4A5568`
- Sombras: gris muy claro `#EDF2F7`

### Paletas para partes
Cada parte puede tener su color propio, pero debe armonizar con la base. Referencias:
- Pelo: negros, marrones, castaños, algún color de fantasía suave (rosa pastel, celeste, morado suave)
- Ropa: azules, verdes, rojos suaves, blancos, grises
- Accesorios: acentos vivos (amarillo, naranja) para llamar la atención

Evitar: colores neón, degradados fuertes, texturas fotorrealistas.

### Estilo de línea
- Contorno grueso pero suave (~4-6px equivalente en 512px)
- Sin sombras internas complejas (máximo una sombra plana)
- Sin brillos ni highlights fotorealistas

## Prompt maestro para Fal

Este es el prompt lockeado. Nadie lo cambia sin acuerdo del equipo.

```
chibi mascot character, kawaii style, flat 2D illustration,
minimalist design, transparent background, centered composition,
soft rounded outline, pastel palette, cute proportions,
[PART_DESCRIPTION]
```

Solo se modifica `[PART_DESCRIPTION]` según lo que se está generando.

### Configuración Fal
```json
{
  "prompt": "...",
  "seed": 42,
  "image_size": "square_hd",
  "num_inference_steps": 28,
  "guidance_scale": 3.5,
  "output_format": "png",
  "negative_prompt": "3D, realistic, dark, scary, photograph, gradient, glossy, complex shadows, extra limbs, deformed"
}
```

**El seed 42 se mantiene fijo para lockear consistencia.** Si un asset sale mal, no se cambia el seed — se ajusta el `PART_DESCRIPTION`.

## Descripciones por categoría

Estas van directo en `[PART_DESCRIPTION]`. Adaptar según lo que se genere.

### hair (pelo)
- `short black hair, simple` → `hair-corto.png`
- `long wavy hair, brown` → `hair-largo.png`
- `curly red hair, voluminous` → `hair-rizado.png`
- `wearing a red beanie hat` → `hair-gorro.png`
- `hair tied in a small ponytail, blonde` → `hair-colita.png`

### eyes (ojos)
- `big round eyes, black pupils, sparkly` → `eyes-grandes.png`
- `small dot eyes, minimalist` → `eyes-chicos.png`
- `closed eyes, peaceful expression` → `eyes-cerrados.png`
- `one eye winking, playful expression` → `eyes-guino.png`
- `wearing round glasses, black frames` → `eyes-lentes.png`

### mouth (boca)
- `small smile, closed mouth, friendly` → `mouth-sonrisa.png`
- `neutral straight mouth, calm` → `mouth-seria.png`
- `open mouth laughing, joyful` → `mouth-riendo.png`
- `open mouth surprised, small O shape` → `mouth-sorprendida.png`
- `mischievous smirk` → `mouth-picara.png`

### accessory (accesorios)
- `no accessory` → `accessory-ninguno.png` (transparente/vacío, es un asset "borrar accesorio")
- `wearing a small top hat, black` → `accessory-sombrero.png`
- `wearing a red bowtie` → `accessory-corbata.png`
- `wearing headphones, black and blue` → `accessory-audifonos.png`
- `wearing a striped scarf, red and white` → `accessory-bufanda.png`

### clothing (ropa)
- `wearing a plain white t-shirt` → `clothing-remera.png`
- `wearing a blue button-up shirt` → `clothing-camisa.png`
- `wearing a green knitted sweater` → `clothing-sweater.png`
- `wearing a gray hoodie` → `clothing-hoodie.png`
- `wearing formal white shirt with tie` → `clothing-formal.png`

## Composición del personaje en runtime

Dev C compone las partes en este orden de z-index (de fondo a frente):

1. `body.png` (siempre visible, base)
2. `clothing-*.png`
3. `hair-*.png`
4. `eyes-*.png`
5. `mouth-*.png`
6. `accessory-*.png` (más al frente, tipo sombrero encima del pelo)

Todas las partes deben estar alineadas al mismo centro y al mismo tamaño (512x512) para que la composición sea limpia. Esto es responsabilidad de Dev B: cada parte tiene que tener el mismo "punto de referencia" corporal.

**Truco práctico para Dev B:** generá primero UNA mascota completa como referencia, y para cada parte específica generá con el resto del cuerpo, después en Photoshop/Photopea recortás solo la parte y la centrás en un canvas 512x512 transparente. Esto asegura alineación perfecta.

## Log de generación

Dev B mantiene `docs/assets-log.md` con:
- El prompt exacto de cada asset
- El seed usado
- La fecha de generación
- Notas si se retocó manualmente

Esto permite regenerar un asset si se corrompe o si hay que iterar.

## Plan B si no da la consistencia

Si en H+2 el estilo no está lockeado o los assets no se ven consistentes:

1. **Cortar variantes:** de 5 opciones por categoría, bajar a 3. Total: 15 assets en lugar de 25.
2. **Cortar categorías:** de 5 categorías, dejar 3 (hair, eyes, accessory). Total: 9 assets.
3. **Última opción:** una sola mascota "hero" sin sistema de customización real, y en el pitch se muestra el wardrobe como "próximamente". Se pierde la esencia del sketch pero el resto del producto sigue en pie.

Cualquiera de estos planes se decide EN CONJUNTO con el equipo, no unilateralmente.
