# BRAND

> Identidad visual y tono de voz de El Compañero. Consistente en landing, app y marketplace.

## Nombre
**El Compañero** (o simplemente "el Compañero" con mayúscula intencional).

## Tagline
> "Un compañero libre. La cara y voz que vos elijas. Para el trabajo que sea."

## Tagline corto (para hero)
> "Tu compañero de trabajo, con la cara y voz que vos elegís."

## Tono de voz

- **Directo, no vendedor.** Nada de "revoluciona tu productividad".
- **Cálido, no infantil.** Habla de vos, no le dice "amiguito" al usuario.
- **Honesto, no misterioso.** Si algo no está listo, se dice.
- **Latinoamericano neutro.** Usa "vos" pero evita modismos muy locales en copy oficial.

**Ejemplos:**
- ✅ "Elegís quién es, elegís qué puede hacer. Trabaja al lado tuyo."
- ❌ "Descubre el poder de tu asistente definitivo."
- ✅ "Este es el primer pack completo. Vienen más."
- ❌ "Innovación disruptiva en el mundo de los asistentes de IA."

## Paleta de colores

### Principal
- `#1A365D` — Azul profundo (títulos, hero)
- `#2C5282` — Azul medio (subtítulos, acentos)
- `#3182CE` — Azul brillante (CTAs, links)

### Neutros
- `#1A202C` — Casi negro (texto principal)
- `#4A5568` — Gris medio (texto secundario)
- `#A0AEC0` — Gris claro (borders, muted)
- `#F7FAFC` — Casi blanco (fondos suaves)
- `#FFFFFF` — Blanco (fondo principal)

### Semánticos
- `#E53E3E` — Rojo (severidad crítica en audits)
- `#DD6B20` — Naranja (severidad alta)
- `#D69E2E` — Amarillo (severidad media)
- `#3182CE` — Azul (severidad baja)
- `#38A169` — Verde (éxito, "todo bien")

### Marketplace / premium
- `#805AD5` — Púrpura (badge premium, packs Pro)

## Tipografía

### Principal
- **Inter** (variable, weights 400/500/600/700)
- Uso: todo el texto, títulos, UI

### Código
- **JetBrains Mono** o **Fira Code**
- Uso: snippets en la landing, código en el audit report

### Configuración Next.js
```typescript
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

## Espaciado y ritmo

- Sistema de 4px (Tailwind default)
- Contenedor máximo landing: `max-w-6xl mx-auto`
- Contenedor máximo app: `max-w-4xl mx-auto`
- Padding secciones landing: `py-20 md:py-32`

## Componentes clave

- **Botones:** shadcn `Button` con `variant="default"` para CTAs principales, `variant="outline"` para secundarios
- **Cards:** shadcn `Card` sin bordes duros, sombra sutil (`shadow-sm`)
- **Toasts:** shadcn `Sonner`, esquina inferior derecha
- **Modales:** shadcn `Dialog`, centrado

## Iconos

- **Lucide React** exclusivamente.
- Tamaños: `size={16}` en inline, `size={20}` en botones, `size={24}` en features.

## Assets del compañero

Ver `docs/ASSETS.md` para las reglas de estilo de los personajes.

## Copy: qué decir y qué no

### Sí decir
- "El Compañero" (con artículo)
- "Software libre bajo AGPL-3.0"
- "Packs de capacidades"
- "Guardián de código", "Guardián de despliegue"
- "Elegí quién es"

### No decir
- "Revolucionario", "disruptivo", "único en su tipo"
- "IA de última generación"
- "Nuestros usuarios adoran..."
- "El futuro del trabajo"
- Emojis en la landing (uno o dos en el chat de demo está bien, más satura)

## Referencias visuales

Landing/marketing:
- Linear (linear.app)
- Vercel (vercel.com)
- Cursor (cursor.com)

App / compañero:
- La estética del sketch original: chibi flat 2D, personaje redondo, colores planos.

## Logo

En el MVP no hay logo formal — el nombre "El Compañero" con la mascota base de la app funciona como identidad. Dev A o Dev B puede armar uno simple si sobra tiempo (tipografía + silueta de la mascota).
