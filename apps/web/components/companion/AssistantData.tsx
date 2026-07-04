"use client";

import { useCharacter } from "./CharacterContext";

export function AssistantData() {
  const { character } = useCharacter();
  const selectedAssistant = character.assistant;

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
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
          code-guardian (off)
        </span>
      </div>
    </section>
  );
}
