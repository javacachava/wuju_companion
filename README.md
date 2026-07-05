# Workshop de Personajes (MVP)

Implementación de un Workshop tipo marketplace para personajes autocontenidos:

- Mente (`personality.mb`, `instructions.mb`, permisos, voz)
- Cuerpo (`skin`, `preview`, `icon`)
- Guardado transaccional en perfil e inventario por usuario
- Personalización y aplicación de perfil activo

## Estructura

- `app/workshop`: catálogo y ficha de personaje.
- `app/customization`: panel de personalización.
- `app/api/workshop/*`: catálogo y guardado en perfil.
- `app/api/customization/apply`: aplicar personaje.
- `lib/bundle/*`: parser, schemas y validación de bundle `.cmp`.
- `supabase/migrations/*`: modelo relacional, RLS y funciones RPC.
- `tests/e2e`: prueba de flujo completo.
- `tests/unit`: pruebas de validación de bundles.

## Variables de entorno

Crear `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Sin esas variables, el sistema usa un modo local con datos mock para desarrollo.

## Comandos

```bash
npm install
npm run dev
npm run test
npm run test:e2e
```
