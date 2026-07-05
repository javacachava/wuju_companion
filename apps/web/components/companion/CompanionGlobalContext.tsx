"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCharacter, saveCharacter } from "@/lib/companion/api";
import { useSession } from "@/components/auth/SessionContext";
import type { CharacterProfile } from "@/lib/companion/types";

const CHARACTER_ID_KEY = "characterId";

// "checking" = sesión cargando · "auth" = sin login (mostrar AuthForm) ·
// "selecting" = logueado, falta elegir asistente · "ready" = todo listo.
type CompanionStatus = "checking" | "auth" | "selecting" | "ready";

type CompanionGlobalContextValue = {
  status: CompanionStatus;
  character: CharacterProfile | null;
  isLauncherOpen: boolean;
  openLauncher: () => void;
  closeLauncher: () => void;
  updateCharacter: (character: CharacterProfile) => void;
  completeSelection: () => Promise<void>;
};

const CompanionGlobalContext = createContext<CompanionGlobalContextValue | null>(null);

type CompanionGlobalProviderProps = {
  children: React.ReactNode;
};

export function CompanionGlobalProvider({ children }: CompanionGlobalProviderProps) {
  const { user, loading: sessionLoading } = useSession();
  const [status, setStatus] = useState<CompanionStatus>("checking");
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCharacter = async () => {
      if (sessionLoading) {
        setStatus("checking");
        return;
      }

      if (!user) {
        setCharacter(null);
        if (typeof window !== "undefined") localStorage.removeItem(CHARACTER_ID_KEY);
        setStatus("auth");
        return;
      }

      try {
        const existing = await getCharacter();
        if (!active) return;

        if (typeof window !== "undefined") localStorage.setItem(CHARACTER_ID_KEY, existing.id);
        setCharacter(existing);
        setStatus(existing.assistant ? "ready" : "selecting");
      } catch {
        if (active) {
          setCharacter(null);
          setStatus("auth");
        }
      }
    };

    void loadCharacter();

    return () => {
      active = false;
    };
  }, [user, sessionLoading]);

  const openLauncher = useCallback(() => setIsLauncherOpen(true), []);
  const closeLauncher = useCallback(() => setIsLauncherOpen(false), []);
  const updateCharacter = useCallback((next: CharacterProfile) => setCharacter(next), []);

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
      updateCharacter,
      completeSelection,
    }),
    [
      character,
      closeLauncher,
      completeSelection,
      isLauncherOpen,
      openLauncher,
      status,
      updateCharacter,
    ],
  );

  return (
    <CompanionGlobalContext.Provider value={value}>{children}</CompanionGlobalContext.Provider>
  );
}

export function useCompanionGlobal() {
  const context = useContext(CompanionGlobalContext);
  if (!context) {
    throw new Error("useCompanionGlobal must be used inside CompanionGlobalProvider");
  }
  return context;
}
