"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Boxes,
  Flame,
  Package,
  PackageOpen,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CharacterProfile } from "@/lib/companion/types";
import {
  ASSISTANT_CATALOG,
  type AssistantOption,
  buildAssistantProfile,
} from "./assistantCatalog";

type CompanionLaunchExperienceProps = {
  character: CharacterProfile;
  onCharacterChange: (next: CharacterProfile) => void;
  onContinue: () => void;
};

type LaunchStage = "intro" | "selector";

const BOX_STATES = [
  {
    id: "closed",
    label: "Caja sellada",
    description: "Esperando activación",
    Icon: Package,
    accent: "from-amber-200 to-amber-400",
  },
  {
    id: "opening",
    label: "Tapa abriendo",
    description: "Preparando asistente",
    Icon: PackageOpen,
    accent: "from-orange-200 to-orange-400",
  },
  {
    id: "spark",
    label: "Núcleo activo",
    description: "Inicializando habilidades",
    Icon: Flame,
    accent: "from-yellow-100 to-orange-500",
  },
  {
    id: "ready",
    label: "Asistente detectado",
    description: "Listo para elegir",
    Icon: Bot,
    accent: "from-blue-200 to-indigo-500",
  },
] as const;

const STORAGE_FILTERS = [
  "Todas las unidades",
  "Auditoría",
  "Construcción",
  "Exploración",
  "Soporte",
] as const;

const STAT_META: Array<{
  key: keyof AssistantOption["stats"];
  label: string;
  color: string;
}> = [
  { key: "analysis", label: "Análisis", color: "bg-fuchsia-600" },
  { key: "creativity", label: "Creatividad", color: "bg-blue-600" },
  { key: "speed", label: "Velocidad", color: "bg-amber-700" },
];

export function CompanionLaunchExperience({
  character,
  onCharacterChange,
  onContinue,
}: CompanionLaunchExperienceProps) {
  const [stage, setStage] = useState<LaunchStage>("intro");
  const [isAnimating, setIsAnimating] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const selectedAssistant = useMemo(
    () =>
      ASSISTANT_CATALOG.find((assistant) => assistant.id === character.assistant?.id) ??
      null,
    [character.assistant?.id],
  );

  useEffect(() => {
    if (!isAnimating) return;

    if (frameIndex >= BOX_STATES.length - 1) {
      const doneTimer = window.setTimeout(() => {
        setStage("selector");
        setIsAnimating(false);
      }, 480);
      return () => window.clearTimeout(doneTimer);
    }

    const timer = window.setTimeout(() => {
      setFrameIndex((prev) => Math.min(prev + 1, BOX_STATES.length - 1));
    }, 360);

    return () => window.clearTimeout(timer);
  }, [frameIndex, isAnimating]);

  const handleOpenBox = () => {
    if (isAnimating) return;
    setFrameIndex(0);
    setIsAnimating(true);
  };

  const handleSelectAssistant = (assistant: AssistantOption) => {
    onCharacterChange({
      ...character,
      personality: assistant.personality,
      voiceId: assistant.voiceId,
      assistant: buildAssistantProfile(assistant),
    });
  };

  const activeState = BOX_STATES[frameIndex];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center p-4 py-8 sm:p-6">
      <AnimatePresence mode="wait">
        {stage === "intro" ? (
          <motion.section
            key="launch-intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
                  Encendido del módulo
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Caja de asistentes
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
                  Abrí la caja para iniciar la terminal visual y elegir el
                  asistente del día para{" "}
                  <span className="font-semibold text-slate-900">{character.userName}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenBox}
                disabled={isAnimating}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isAnimating ? "Abriendo caja..." : "Abrir caja"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-4">
                {BOX_STATES.map((state, index) => {
                  const isActive = index === frameIndex;
                  return (
                    <motion.article
                      key={state.id}
                      initial={false}
                      animate={{
                        scale: isActive ? 1.02 : 1,
                        opacity: isAnimating ? (index <= frameIndex ? 1 : 0.35) : 1,
                      }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-xl border p-3 ${
                        isActive
                          ? "border-slate-300 bg-white shadow-sm"
                          : "border-slate-200 bg-slate-100"
                      }`}
                    >
                      <div
                        className={`inline-flex rounded-lg bg-gradient-to-br p-2 text-slate-900 ${state.accent}`}
                      >
                        <state.Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {state.label}
                      </p>
                      <p className="text-xs text-slate-500">{state.description}</p>
                    </motion.article>
                  );
                })}
              </div>

              <motion.div
                key={activeState.id}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              >
                Estado actual:{" "}
                <span className="font-semibold text-slate-900">{activeState.label}</span>
              </motion.div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="selector"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full rounded-3xl border border-slate-200 bg-slate-100/70 shadow-sm"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 sm:px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
                  Monster Storage
                </p>
                <p className="text-sm text-slate-600">Terminal de selección del asistente</p>
              </div>
              <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4" />
                Buscar asistente...
              </div>
            </header>

            <div className="grid gap-4 p-4 lg:grid-cols-[180px_minmax(0,1fr)_320px]">
              <aside className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Filtros
                </p>
                <nav className="mt-3 space-y-1">
                  {STORAGE_FILTERS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      className={`w-full rounded-md px-2 py-2 text-left text-sm transition ${
                        index === 0
                          ? "bg-fuchsia-700 font-medium text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </aside>

              <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Storage Box 01</h2>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Elegí el asistente del día
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {ASSISTANT_CATALOG.length} disponibles
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {ASSISTANT_CATALOG.map((assistant) => {
                    const selected = assistant.id === selectedAssistant?.id;
                    return (
                      <button
                        key={assistant.id}
                        type="button"
                        onClick={() => handleSelectAssistant(assistant)}
                        className={`rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-blue-300 bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg">
                            {assistant.avatar}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {assistant.name}
                            </p>
                            <p className="text-xs text-slate-500">{assistant.role}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-slate-500" />
                    Arrastrar y soltar llegará en otra iteración del MVP.
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-700">
                    Modo selección
                  </span>
                </div>
              </section>

              <aside className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
                  Character info
                </p>

                {selectedAssistant ? (
                  <>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl">
                          {selectedAssistant.avatar}
                        </span>
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {selectedAssistant.name}
                          </p>
                          <p className="text-xs text-slate-500">{selectedAssistant.role}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-700">{selectedAssistant.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                          {character.personality}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">
                          {selectedAssistant.voiceLabel}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {STAT_META.map((stat) => {
                        const value = selectedAssistant.stats[stat.key];
                        return (
                          <div key={stat.key}>
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>{stat.label}</span>
                              <span>{value}/100</span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-slate-200">
                              <div
                                className={`h-2 rounded-full ${stat.color}`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    Seleccioná un asistente para ver su perfil y estadísticas.
                  </div>
                )}

                <button
                  type="button"
                  onClick={onContinue}
                  disabled={!selectedAssistant}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Continuar a El Compañero
                  <Sparkles className="h-4 w-4" />
                </button>
              </aside>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
