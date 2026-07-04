# Demo Video Script

Duración objetivo: 2:30.

## 0:00-0:15 — Intro

Pantalla: landing de El Compañero.

Narración:
> Los asistentes de hoy ayudan, pero suelen ser cajas negras sin identidad estable ni permisos claros. Este es El Compañero: libre, auditable, con cara y voz elegidas por el usuario.

## 0:15-0:45 — Problema

Pantalla: scroll corto por la sección de comparación.

Narración:
> Hoy usamos una herramienta para código, otra para conversación y otra para compañía. El Compañero une esas tres ideas en un cascarón abierto, extensible y con permisos explícitos.

## 0:45-1:25 — Compañero

Pantalla: `/companion`.

Acciones:
1. Crear o cargar usuario `demo`.
2. Elegir asistente del catálogo visual.
3. Abrir chat.
4. Enviar: `Hola, resumime qué podés hacer.`
5. Dejar sonar la respuesta con ElevenLabs.

Narración:
> El usuario elige quién es su compañero: personalidad, voz y presencia visual. El chat usa OpenAI y cada respuesta se reproduce con voz.

## 1:25-1:55 — Guardián de código

Pantalla: `/companion`, chat abierto.

Acciones:
1. Activar Guardián.
2. Abrir Auditar código.
3. Pegar:

```javascript
const userId = req.query.id;
const result = db.query("SELECT * FROM users WHERE id = " + userId);
```

4. Mostrar reporte con severidad crítica.
5. Dejar sonar `characterVoicedSummary`.

Narración:
> El primer pack completo es desarrollo. El Guardián encuentra vulnerabilidades reales, muestra severidad, línea y una corrección propuesta.

## 1:55-2:20 — Marketplace

Pantalla: `/marketplace`.

Acciones:
1. Abrir marketplace.
2. Comprar una parte premium con monedas de demo.
3. Volver a `/companion`.
4. Equipar la parte en wardrobe.

Narración:
> El marketplace usa moneda in-app de demo. No hay pagos reales, pero el saldo se valida en servidor y el inventario se actualiza.

## 2:20-2:30 — Cierre

Pantalla: landing + repo.

Narración:
> El core es AGPL-3.0. Empezamos por desarrollo, pero el mismo compañero puede crecer con packs de marketing, diseño, negocio y estudio.
