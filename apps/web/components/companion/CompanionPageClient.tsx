"use client";

import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useCompanionGlobal } from "./CompanionGlobalContext";
import { CompanionApp } from "./CompanionApp";
import { CompanionLaunchExperience } from "./CompanionLaunchExperience";

export function CompanionPageClient() {
  const { character, completeSelection, status, updateCharacter } = useCompanionGlobal();

  if (status === "checking") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col items-center justify-center gap-5 p-6">
        <span className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-200 opacity-60" />
          <span className="relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo local */}
            <img src="/icon.svg" alt="" className="h-11 w-11 animate-pulse object-contain" />
          </span>
        </span>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">Preparando tu compañero...</p>
          <p className="mt-1 text-xs text-slate-500">
            Creando tu personaje e inventario. Esto tarda unos segundos la primera vez.
          </p>
        </div>
        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-blue-500" />
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </main>
    );
  }

  // Sin sesión: se pide login/registro antes de cualquier cosa del compañero.
  if (status === "auth" || !character) {
    return (
      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    );
  }

  if (status === "selecting") {
    return (
      <CompanionLaunchExperience
        character={character}
        onCharacterChange={updateCharacter}
        onContinue={completeSelection}
      />
    );
  }

  return <CompanionApp character={character} onCharacterChange={updateCharacter} />;
}
