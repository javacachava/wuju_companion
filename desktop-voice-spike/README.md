# El Compañero Voice Spike

> **Superado por `apps/desktop`** (2026-07-05): Fase 2 agregó `tauri-plugin-mic-recorder` y `tauri-plugin-fs` al cliente real. Como el código de voz vive en `apps/web/components/companion/ChatPanel.tsx` (frontend compartido, no acá), la grabación+transcripción ya funciona en `apps/desktop` sin duplicar nada. Esta carpeta queda como referencia histórica del spike de Fase 0 — no se borra, pero no es la base de desarrollo real.

Spike descartable de Fase 0 para validar el loop:

1. Tauri v2 carga `apps/web` en `/companion`.
2. `tauri-plugin-mic-recorder` graba el micrófono a un WAV local.
3. `ChatPanel.tsx` lee ese WAV desde Tauri, lo manda a `/api/voice-spike/transcribe`.
4. La ruta llama a OpenAI Whisper (`whisper-1`) con `OPENAI_API_KEY`.
5. El texto se inyecta en el input existente y dispara el submit normal de `/api/chat`.

## Correr

```bash
cd desktop-voice-spike
pnpm install
pnpm dev
```

En Ubuntu/Linux, instalá antes los prerequisitos nativos:

```bash
./scripts/install-ubuntu-prereqs.sh
```

Notas:

- Requiere Rust/Cargo instalado para compilar Tauri.
- La ruta de transcripción es deliberadamente temporal y no forma parte de `docs/CONTRATOS.md`.
- El build empaquetado no es objetivo de esta fase; esto apunta al dev server local del MVP web.
