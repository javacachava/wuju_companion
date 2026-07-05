// Fase 4 de DESKTOP-MIGRATION-PLAN.md: captura de contexto on-demand (nunca continua).
// Regla de la sección 5.3: código -> portapapeles primero (gratis, exacto).
// Texto de UI general -> OCR local. Nunca se dispara solo, siempre por gesto explícito
// del usuario (botón), nunca por temporizador.

export type TauriInvoke = {
  invoke: <Result>(command: string, args?: Record<string, unknown>) => Promise<Result>;
};

export type ScreenContext = {
  source: "clipboard" | "ocr";
  text: string;
};

const READ_CLIPBOARD_COMMAND = "plugin:clipboard-manager|read_text";
const GET_MONITORS_COMMAND = "plugin:screenshots|get_screenshotable_monitors";
const GET_MONITOR_SCREENSHOT_COMMAND = "plugin:screenshots|get_monitor_screenshot";
const REMOVE_MONITOR_SCREENSHOT_COMMAND = "plugin:screenshots|remove_monitor_screenshot";
const OCR_SCREENSHOT_COMMAND = "ocr_screenshot";

type ScreenshotableMonitor = { id: number; name: string };

async function readClipboardText(tauri: TauriInvoke): Promise<string | null> {
  try {
    const text = await tauri.invoke<string>(READ_CLIPBOARD_COMMAND);
    return text.trim() ? text : null;
  } catch {
    // Portapapeles vacío, sin permiso, o con contenido no-texto (imagen, etc).
    return null;
  }
}

async function captureScreenOcr(tauri: TauriInvoke): Promise<string | null> {
  const monitors = await tauri.invoke<ScreenshotableMonitor[]>(GET_MONITORS_COMMAND);
  const monitor = monitors[0];
  if (!monitor) {
    return null;
  }

  const screenshotPath = await tauri.invoke<string>(GET_MONITOR_SCREENSHOT_COMMAND, {
    id: monitor.id,
  });

  try {
    const text = await tauri.invoke<string>(OCR_SCREENSHOT_COMMAND, { path: screenshotPath });
    return text.trim() ? text : null;
  } finally {
    // Cleanup: no dejamos capturas de pantalla acumulándose en disco.
    await tauri.invoke(REMOVE_MONITOR_SCREENSHOT_COMMAND, { id: monitor.id }).catch(() => {});
  }
}

export type ScreenContextPermissions = {
  clipboardAllowed: boolean;
  screenAllowed: boolean;
};

/**
 * Etapas A+C del Context Builder para el caso "screen-query": intenta portapapeles
 * primero (gratis, exacto, ideal para código copiado); si está vacío, cae a
 * captura de pantalla + OCR local (ideal para texto de UI, diálogos, no código).
 *
 * Respeta los permisos de Fase 6 (lib/permissions.ts) — nunca intenta una fuente
 * que el usuario desactivó, aunque técnicamente la capability de Tauri lo permita.
 */
export async function captureScreenContext(
  tauri: TauriInvoke,
  permissions: ScreenContextPermissions,
): Promise<ScreenContext | null> {
  if (permissions.clipboardAllowed) {
    const clipboardText = await readClipboardText(tauri);
    if (clipboardText) {
      return { source: "clipboard", text: clipboardText };
    }
  }

  if (permissions.screenAllowed) {
    const ocrText = await captureScreenOcr(tauri);
    if (ocrText) {
      return { source: "ocr", text: ocrText };
    }
  }

  return null;
}

export function formatContextForPrompt(context: ScreenContext, userMessage: string): string {
  const label =
    context.source === "clipboard" ? "Esto tengo copiado" : "Esto veo en mi pantalla";

  return `[${label}]\n${context.text.trim()}\n\n[Pregunta]\n${userMessage}`;
}
