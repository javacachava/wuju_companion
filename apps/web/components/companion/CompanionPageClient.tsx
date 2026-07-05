"use client";

import { useCompanionGlobal } from "./CompanionGlobalContext";
import { CompanionApp } from "./CompanionApp";
import { CompanionLaunchExperience } from "./CompanionLaunchExperience";
import { Onboarding } from "./Onboarding";

export function CompanionPageClient() {
  const {
    character,
    completeSelection,
    createCharacter,
    status,
    updateCharacter,
  } = useCompanionGlobal();

  if (status === "checking") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center p-6">
        <p className="text-sm text-slate-600">Cargando tu experiencia...</p>
      </main>
    );
  }

  if (status === "onboarding" || !character) {
    return <Onboarding onContinue={createCharacter} />;
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
