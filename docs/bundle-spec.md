# Especificación de `character.cmp` (v1)

`character.cmp` es un ZIP con una estructura autocontenida.

## Archivos requeridos

- `metadata.json`
- `personality.mb`
- `instructions.mb`
- `permissions.json`
- `voice.json`
- `version.json`
- `skin.png` (o imagen equivalente referenciada en `metadata.skin`)

## Archivos opcionales

- `preview.png`
- `icon.png`
- `assets/*`
- `animations/*`

## Reglas de validación

1. Todos los paths referenciados en `metadata.json` deben existir físicamente en el ZIP.
2. No se permiten rutas absolutas ni traversal (`../`).
3. Tamaño máximo comprimido y descomprimido: 25 MB.
4. `metadata.version` y `version.version` deben usar semver (`x.y.z`).
5. Se bloquea downgrade cuando el usuario ya tiene una versión mayor instalada.

## Ejemplo de `metadata.json`

```json
{
  "id": "code_guardian",
  "name": "Code Guardian",
  "author": "Julio",
  "version": "1.0.0",
  "description": "Especialista en auditoría de código.",
  "category": "Programming",
  "price": 5,
  "voice": "voice.json",
  "personality": "personality.mb",
  "instructions": "instructions.mb",
  "skin": "skin.png",
  "permissions": "permissions.json",
  "preview": "preview.png",
  "icon": "icon.png"
}
```
