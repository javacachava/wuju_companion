"use client";

import { createContext, useContext } from "react";
import type { CharacterProfile } from "@/lib/companion/types";

type CharacterContextValue = {
  character: CharacterProfile;
  setCharacter: (character: CharacterProfile) => void;
};

const CharacterContext = createContext<CharacterContextValue | null>(null);

type CharacterProviderProps = {
  value: CharacterContextValue;
  children: React.ReactNode;
};

export function CharacterProvider({ value, children }: CharacterProviderProps) {
  return (
    <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>
  );
}

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error("useCharacter must be used inside CharacterProvider");
  }
  return ctx;
}
