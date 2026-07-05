# El Compañero Desktop

Cliente Tauri v2 delgado para la Fase 1 de `DESKTOP-MIGRATION-PLAN.md`.

Esta app no contiene lógica de servidor ni capacidades del sistema operativo. Solo abre una ventana nativa que carga el frontend existente.

## URLs

- Desarrollo: `http://localhost:3000/companion`, configurado en `src-tauri/tauri.conf.json` como `build.devUrl`.
- Producción: `https://companion.wuju.dev/companion`, configurado en `src-tauri/tauri.conf.json` como `build.frontendDist`.

Si cambia el dominio del VPS, actualizá `build.frontendDist`. El desktop sigue consumiendo el mismo deploy Next.js descrito en `docs/DEPLOY.md`.

## Comandos

```bash
pnpm --filter desktop dev
```

En WSL o Linux con problemas de EGL/Mesa:

```bash
pnpm --filter desktop dev:wsl
```

## Fase 2 — capacidades del sistema operativo

Ya registrados en `src-tauri/src/lib.rs`, verificados con `cargo check` (compila limpio):

- `tauri-plugin-mic-recorder` — grabación de micrófono (`start_recording`/`stop_recording`).
- `tauri-plugin-fs` — lectura/borrado de archivos, acotado por scope en `capabilities/default.json` a las carpetas de mic-recorder y screenshots.
- `tauri-plugin-clipboard-manager` — lectura de texto del portapapeles (`read_text`).
- `tauri-plugin-screenshots` — captura de pantalla por monitor (`get_screenshotable_monitors`, `get_monitor_screenshot`, `remove_monitor_screenshot`).

Faltan todavía (fases posteriores): atajo global, notificaciones, tray.

## Fase 3 — STT ya funciona acá

El botón de mic + transcripción vive en `apps/web/components/companion/ChatPanel.tsx` (frontend compartido, cargado por `devUrl`/`frontendDist`). Como este cliente ya tiene `mic-recorder` y `fs` registrados (Fase 2), la grabación→Whisper→chat funciona acá sin código nuevo — no hace falta portar nada desde `desktop-voice-spike/`. Esa carpeta queda como referencia histórica del spike de Fase 0.

## Fase 4 — Context Builder + snaps on-demand

Botón "usar contexto" en `ChatPanel.tsx` (mismo frontend compartido), respaldado por `apps/web/lib/context-builder.ts`. Sigue la regla de la sección 5.3 del plan: **portapapeles primero** (`clipboard-manager:allow-read-text`, gratis y exacto — ideal para código copiado), **OCR local como fallback** (captura con `tauri-plugin-screenshots` + comando propio `ocr_screenshot` que shellea a `tesseract` del sistema). Nunca se dispara solo — siempre por click explícito del usuario, nunca por temporizador.

**Requisito de sistema no verificable en CI/sandbox:** el comando `ocr_screenshot` shellea al binario `tesseract` del sistema operativo (no es un binding Rust). Instalar:

```bash
# Ubuntu/Debian
sudo apt install -y tesseract-ocr

# macOS
brew install tesseract
```

Sin este binario instalado, el fallback de OCR falla (`tesseract_not_available`) — el portapapeles sigue funcionando igual, no depende de esto.

**Permiso custom:** `ocr_screenshot` no es un comando de plugin, así que necesita su propio archivo `src-tauri/permissions/ocr_screenshot.toml` (identificador ACL `ocr-screenshot`, con guión — los identificadores no aceptan `_`). Sin este archivo, `cargo check` falla en build.rs con "invalid plugin or permission identifier" — ya verificado y corregido.
