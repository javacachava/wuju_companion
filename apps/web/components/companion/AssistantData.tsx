"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useCharacter } from "./CharacterContext";

export function AssistantData() {
  const { character, codeGuardianEnabled, toggleCodeGuardian } = useCharacter();
  const [saving, setSaving] = useState(false);
  const selectedAssistant = character.assistant;

  const handleToggle = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      await toggleCodeGuardian(!codeGuardianEnabled);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Datos del asistente
      </h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Asistente activo</dt>
          <dd className="font-medium text-slate-900">
            {selectedAssistant?.name ?? "Sin seleccionar"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Usuario</dt>
          <dd className="font-medium text-slate-900">{character.userName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Personalidad</dt>
          <dd className="font-medium text-slate-900">{character.personality}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Voz</dt>
          <dd className="font-medium text-slate-900">
            {selectedAssistant?.voiceLabel ?? character.voiceId}
          </dd>
        </div>
      </dl>
      {selectedAssistant ? (
        <p className="mt-3 text-sm text-slate-700">{selectedAssistant.summary}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
          chat-base
        </span>
      </div>

      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={saving}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
          codeGuardianEnabled
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        } disabled:cursor-wait disabled:opacity-70`}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {codeGuardianEnabled ? "Guardián activo" : "Activar Guardián"}
      </button>
    </section>
  );
}
