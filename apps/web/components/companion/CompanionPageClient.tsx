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
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center p-6">
        <p className="text-sm text-slate-600">Cargando tu experiencia...</p>
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
