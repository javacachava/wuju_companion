// Fase 6 de DESKTOP-MIGRATION-PLAN.md: pantalla de permisos por función.
//
// Nota de arquitectura importante: las capabilities de Tauri v2 son ACL ESTÁTICO
// (definidas en apps/desktop/src-tauri/capabilities/*.json, cargadas al build/arranque).
// No existe en Tauri un mecanismo nativo de "el usuario togglea esto en runtime y el
// SO lo revoca en vivo" como en Android/iOS. Las capabilities le otorgan a la app COMO
// UN TODO la posibilidad técnica de usar mic/clipboard/screen; lo que el usuario "revoca"
// desde esta pantalla es una preferencia a nivel de APP, guardada acá, que las features
// (ver ChatPanel.tsx) chequean antes de invocar cada capacidad. Es la pieza que cumple
// "permisos revocables" del pitch dentro de lo que Tauri realmente permite.

export type PermissionKey = "mic" | "clipboard" | "screen";

export type PermissionState = Record<PermissionKey, boolean>;

const STORAGE_KEY = "companion-permissions";

const DEFAULT_PERMISSIONS: PermissionState = {
  mic: true,
  clipboard: true,
  screen: true,
};

export const PERMISSION_LABELS: Record<PermissionKey, { label: string; description: string }> = {
  mic: {
    label: "Micrófono",
    description: "Grabar tu voz para transcribirla y chatear hablando.",
  },
  clipboard: {
    label: "Portapapeles",
    description: "Leer lo que tenés copiado cuando pedís usar contexto.",
  },
  screen: {
    label: "Pantalla",
    description: "Capturar y leer (OCR) tu pantalla cuando el portapapeles está vacío.",
  },
};

export function getPermissions(): PermissionState {
  if (typeof window === "undefined") {
    return DEFAULT_PERMISSIONS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PERMISSIONS;
    }

    const parsed = JSON.parse(raw) as Partial<PermissionState>;
    return { ...DEFAULT_PERMISSIONS, ...parsed };
  } catch {
    return DEFAULT_PERMISSIONS;
  }
}

export function setPermission(key: PermissionKey, enabled: boolean): PermissionState {
  const next = { ...getPermissions(), [key]: enabled };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function isPermissionEnabled(key: PermissionKey): boolean {
  return getPermissions()[key];
}
