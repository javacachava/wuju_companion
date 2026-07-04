"use client";

import { createContext, useContext } from "react";
import type {
  CharacterInventory,
  CharacterProfile,
  PartCategory,
} from "@/lib/companion/types";

type CharacterContextValue = {
  character: CharacterProfile;
  inventory: CharacterInventory | null;
  setCharacter: (character: CharacterProfile) => void;
  equipPart: (category: PartCategory, partId: string) => Promise<void>;
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
