"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getAuthSession,
  getCharacter,
  loginWithEmail,
  logoutSession,
  registerWithEmail,
  saveCharacter,
} from "@/lib/companion/api";
import type { CharacterProfile } from "@/lib/companion/types";

type CompanionStatus = "checking" | "auth" | "ready";

type CompanionGlobalContextValue = {
  status: CompanionStatus;
  character: CharacterProfile | null;
  userEmail: string | null;
  isLauncherOpen: boolean;
  openLauncher: () => void;
  closeLauncher: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCharacter: (character: CharacterProfile) => void;
};

const CompanionGlobalContext = createContext<CompanionGlobalContextValue | null>(null);

type CompanionGlobalProviderProps = {
  children: React.ReactNode;
};

export function CompanionGlobalProvider({ children }: CompanionGlobalProviderProps) {
  const [status, setStatus] = useState<CompanionStatus>("checking");
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCharacter = async () => {
      const session = await getAuthSession().catch(() => ({ authenticated: false as const }));
      if (!active) return;

      if (!session.authenticated) {
        setUserEmail(null);
        setCharacter(null);
        setStatus("auth");
        return;
      }

      try {
        const existing = await getCharacter();
        if (!active) return;

        setUserEmail(session.user.email);
        setCharacter(existing);
        setStatus("ready");
      } catch {
        setUserEmail(null);
        setCharacter(null);
        if (active) setStatus("auth");
      }
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

  const login = useCallback(async (email: string, password: string) => {
    await loginWithEmail(email, password);
    const next = await getCharacter();
    setUserEmail(email.trim().toLowerCase());
    setCharacter(next);
    setStatus("ready");
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await registerWithEmail(email, password);
    const next = await getCharacter();
    setUserEmail(email.trim().toLowerCase());
    setCharacter(next);
    setStatus("ready");
  }, []);

  const updateCharacter = useCallback((next: CharacterProfile) => {
    setCharacter(next);
  }, []);

  const logout = useCallback(async () => {
    await logoutSession();
    setUserEmail(null);
    setCharacter(null);
    setStatus("auth");
    setIsLauncherOpen(false);
  }, []);

  useEffect(() => {
    if (!character?.assistant) return;
    void saveCharacter(character);
  }, [character]);

  const value = useMemo<CompanionGlobalContextValue>(
    () => ({
      status,
      character,
      userEmail,
      isLauncherOpen,
      openLauncher,
      closeLauncher,
      login,
      register,
      logout,
      updateCharacter,
    }),
    [
      character,
      closeLauncher,
      isLauncherOpen,
      login,
      openLauncher,
      logout,
      register,
      status,
      userEmail,
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
