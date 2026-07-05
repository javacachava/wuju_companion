// Ajustes del compañero guardados en localStorage (BYO-key + modelo + economía
// de tokens). En esta etapa la selección de modelo y el ahorro son indicativos
// en la UI; el backend sigue usando la key de equipo por ahora.
export type ModelMode = "auto" | "fast" | "premium";

export type CompanionSettings = {
  apiKey: string;
  provider: "auto" | "openai" | "anthropic";
  model: ModelMode;
  saveTokens: boolean;
};

const STORAGE_KEY = "companion-settings";

const DEFAULTS: CompanionSettings = {
  apiKey: "",
  provider: "auto",
  model: "auto",
  saveTokens: true,
};

export const MODEL_LABELS: Record<ModelMode, { label: string; hint: string }> = {
  auto: { label: "Automático", hint: "Elige el modelo según la tarea. Ahorra tokens." },
  fast: { label: "Rápido", hint: "Modelo chico y barato. Ideal para chat simple." },
  premium: { label: "Premium", hint: "Mejor razonamiento. Para audits y tareas complejas." },
};

export function getSettings(): CompanionSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<CompanionSettings>) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(next: CompanionSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

// Detecta el proveedor por el prefijo de la key (sk-ant- = Anthropic).
export function detectProvider(apiKey: string): "openai" | "anthropic" | "desconocido" {
  if (apiKey.startsWith("sk-ant-")) return "anthropic";
  if (apiKey.startsWith("sk-")) return "openai";
  return "desconocido";
}

// Heurística simple de triage: decide si una tarea "necesita" el modelo premium.
// Simulado para mostrar el aviso de cambio de modelo en la UI.
export function needsPremiumModel(message: string): boolean {
  const t = message.toLowerCase();
  return (
    message.length > 240 ||
    /audit|vulnerab|seguridad|codigo|código|```|refactor|analiz|explica por qué|arquitect/.test(t)
  );
}
