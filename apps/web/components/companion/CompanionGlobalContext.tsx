"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createCharacter as createCharacterFromApi,
  getCharacter,
  saveCharacter,
} from "@/lib/companion/mock-api";
import type { CharacterProfile } from "@/lib/companion/types";

const CHARACTER_ID_KEY = "characterId";

type CompanionStatus = "checking" | "onboarding" | "selecting" | "ready";

type CompanionGlobalContextValue = {
  status: CompanionStatus;
  character: CharacterProfile | null;
  isLauncherOpen: boolean;
  openLauncher: () => void;
  closeLauncher: () => void;
  createCharacter: (userName: string) => Promise<void>;
  updateCharacter: (character: CharacterProfile) => void;
  completeSelection: () => Promise<void>;
};

const CompanionGlobalContext = createContext<CompanionGlobalContextValue | null>(null);

type CompanionGlobalProviderProps = {
  children: React.ReactNode;
};

export function CompanionGlobalProvider({ children }: CompanionGlobalProviderProps) {
  const [status, setStatus] = useState<CompanionStatus>("checking");
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCharacter = async () => {
      const cachedId = localStorage.getItem(CHARACTER_ID_KEY);
      if (!cachedId) {
        if (active) setStatus("onboarding");
        return;
      }

      const existing = await getCharacter(cachedId);
      if (!active) return;

      if (!existing) {
        localStorage.removeItem(CHARACTER_ID_KEY);
        setStatus("onboarding");
        return;
      }

      setCharacter(existing);
      setStatus(existing.assistant ? "ready" : "selecting");
    };

    void loadCharacter();

    return () => {
      active = false;
    };
  }, []);

  const openLauncher = useCallback(() => {
    setIsLauncherOpen(true);
  }, []);

  const closeLauncher = useCallback(() => {
    setIsLauncherOpen(false);
  }, []);

  const createCharacter = useCallback(async (userName: string) => {
    const next = await createCharacterFromApi(userName);
    localStorage.setItem(CHARACTER_ID_KEY, next.id);
    setCharacter(next);
    setStatus("selecting");
  }, []);

  const updateCharacter = useCallback((next: CharacterProfile) => {
    setCharacter(next);
  }, []);

  const completeSelection = useCallback(async () => {
    if (!character?.assistant) return;
    await saveCharacter(character);
    setStatus("ready");
    setIsLauncherOpen(false);
  }, [character]);

  const value = useMemo<CompanionGlobalContextValue>(
    () => ({
      status,
      character,
      isLauncherOpen,
      openLauncher,
      closeLauncher,
      createCharacter,
      updateCharacter,
      completeSelection,
    }),
    [
      character,
      closeLauncher,
      completeSelection,
      createCharacter,
      isLauncherOpen,
      openLauncher,
      status,
      updateCharacter,
    ],
  );

  return (
    <CompanionGlobalContext.Provider value={value}>
      {children}
    </CompanionGlobalContext.Provider>
  );
}

export function useCompanionGlobal() {
  const context = useContext(CompanionGlobalContext);
  if (!context) {
    throw new Error("useCompanionGlobal must be used inside CompanionGlobalProvider");
  }
  return context;
}
