"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, KeyRound, Sparkles, X, Zap } from "lucide-react";
import {
  detectProvider,
  getSettings,
  MODEL_LABELS,
  saveSettings,
  type CompanionSettings,
  type ModelMode,
} from "@/lib/companion/settings";

type ConfigPanelProps = {
  open: boolean;
  onClose: () => void;
};

const MODEL_ICON: Record<ModelMode, typeof Zap> = {
  auto: Sparkles,
  fast: Zap,
  premium: Sparkles,
};

export function ConfigPanel({ open, onClose }: ConfigPanelProps) {
  const [settings, setSettings] = useState<CompanionSettings | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setSettings(getSettings());
      setSaved(false);
    }
  }, [open]);

  if (!open || !settings) return null;

  const provider = settings.apiKey ? detectProvider(settings.apiKey) : null;

  const update = (patch: Partial<CompanionSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    setSaved(false);
  };

  const handleSave = () => {
    if (settings) {
      saveSettings(settings);
      setSaved(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Configuración"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Configuración</h3>
            <p className="text-xs text-slate-500">API key, modelo y ahorro de tokens.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* API key */}
        <div className="mt-5">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <KeyRound className="h-4 w-4 text-slate-500" />
            Tu API key
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Pegá tu propia key (OpenAI o Claude). Se guarda solo en este dispositivo.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(event) => update({ apiKey: event.target.value.trim() })}
              placeholder="sk-... o sk-ant-..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              aria-label={showKey ? "Ocultar" : "Mostrar"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {provider ? (
            <p className="mt-1.5 text-xs font-medium text-slate-600">
              Proveedor detectado:{" "}
              <span className={provider === "desconocido" ? "text-amber-600" : "text-emerald-600"}>
                {provider === "anthropic" ? "Claude (Anthropic)" : provider === "openai" ? "OpenAI" : "desconocido"}
              </span>
            </p>
          ) : null}
        </div>

        {/* Modelo */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-800">Modelo</p>
          <div className="mt-2 grid gap-2">
            {(Object.keys(MODEL_LABELS) as ModelMode[]).map((mode) => {
              const Icon = MODEL_ICON[mode];
              const active = settings.model === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update({ model: mode })}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-blue-400 bg-blue-50 ring-1 ring-blue-100"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">
                      {MODEL_LABELS[mode].label}
                    </span>
                    <span className="block text-xs text-slate-500">{MODEL_LABELS[mode].hint}</span>
                  </span>
                  {active ? <Check className="ml-auto h-4 w-4 shrink-0 text-blue-600" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ahorro de tokens */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Ahorrar tokens</p>
              <p className="text-xs text-slate-500">
                Usa un modelo chico para tareas simples y sube a premium solo cuando hace falta.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.saveTokens}
              onClick={() => update({ saveTokens: !settings.saveTokens })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                settings.saveTokens ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  settings.saveTokens ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-5 w-full rounded-lg bg-[#06162b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2342]"
        >
          {saved ? "Guardado ✓" : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
