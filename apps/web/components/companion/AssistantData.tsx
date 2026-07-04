"use client";

import { useCharacter } from "./CharacterContext";

export function AssistantData() {
  const { character } = useCharacter();
  const selectedAssistant = character.assistant;
  const stats = selectedAssistant?.stats;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
        Character info
      </p>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg">
            {selectedAssistant?.avatar ?? "PJ"}
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {selectedAssistant?.name ?? "Mascota sin asignar"}
            </p>
            <p className="text-xs text-slate-500">{selectedAssistant?.role ?? "Rol base"}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          {selectedAssistant?.summary ?? "Elegí un asistente para personalizar su perfil."}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
            {character.personality}
          </span>
          <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">
            {selectedAssistant?.voiceLabel ?? character.voiceId}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Metric label="Análisis" value={stats?.analysis ?? 60} />
        <Metric label="Creatividad" value={stats?.creativity ?? 60} />
        <Metric label="Velocidad" value={stats?.speed ?? 60} />
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Usuario</dt>
          <dd className="font-medium text-slate-900">{character.userName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Asistente</dt>
          <dd className="font-medium text-slate-900">{selectedAssistant?.name ?? "Base"}</dd>
        </div>
      </dl>
    </section>
  );
}

type MetricProps = {
  label: string;
  value: number;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
