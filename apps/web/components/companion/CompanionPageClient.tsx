"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCharacter,
  getCharacter,
  saveCharacter,
} from "@/lib/companion/api";
import type { CharacterProfile } from "@/lib/companion/types";
import { CompanionApp } from "./CompanionApp";
import { CompanionLaunchExperience } from "./CompanionLaunchExperience";
import { Onboarding } from "./Onboarding";

const CHARACTER_ID_KEY = "characterId";
const CHARACTER_USER_NAME_KEY = "characterUserName";

type PageStatus = "checking" | "onboarding" | "selecting" | "ready";

export function CompanionPageClient() {
  const [status, setStatus] = useState<PageStatus>("checking");
  const [character, setCharacter] = useState<CharacterProfile | null>(null);

  useEffect(() => {
    let active = true;

    const loadCharacter = async () => {
      const cachedUserName = localStorage.getItem(CHARACTER_USER_NAME_KEY);
      if (!cachedUserName) {
        localStorage.removeItem(CHARACTER_ID_KEY);
        if (active) setStatus("onboarding");
        return;
      }

      try {
        const existing = await getCharacter(cachedUserName);
        if (!active) return;

        localStorage.setItem(CHARACTER_ID_KEY, existing.id);
        setCharacter(existing);
        setStatus(existing.assistant ? "ready" : "selecting");
      } catch {
        localStorage.removeItem(CHARACTER_ID_KEY);
        localStorage.removeItem(CHARACTER_USER_NAME_KEY);
        if (!active) return;
        setStatus("onboarding");
      }
    };

    void loadCharacter();

    return () => {
      active = false;
    };
  }, []);

  const handleCreateCharacter = useCallback(async (userName: string) => {
    const next = await createCharacter(userName);
    localStorage.setItem(CHARACTER_USER_NAME_KEY, next.userName);
    localStorage.setItem(CHARACTER_ID_KEY, next.id);
    setCharacter(next);
    setStatus("selecting");
  }, []);

  const handleContinueToCompanion = useCallback(async () => {
    if (!character?.assistant) return;
    await saveCharacter(character);
    setStatus("ready");
  }, [character]);

  if (status === "checking") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center p-6">
        <p className="text-sm text-slate-600">Cargando tu experiencia...</p>
      </main>
    );
  }

  if (status === "onboarding" || !character) {
    return <Onboarding onContinue={handleCreateCharacter} />;
  }

  if (status === "selecting") {
    return (
      <CompanionLaunchExperience
        character={character}
        onCharacterChange={setCharacter}
        onContinue={handleContinueToCompanion}
      />
    );
  }

  return <CompanionApp character={character} onCharacterChange={setCharacter} />;
}
