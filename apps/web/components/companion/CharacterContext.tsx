"use client";

import { createContext, useContext } from "react";
import type {
  CharacterInventory,
  CharacterProfile,
  PartCategory,
} from "@/lib/companion/types";

export type CharacterState = "idle" | "talking" | "thinking";

type CharacterContextValue = {
  character: CharacterProfile;
  inventory: CharacterInventory | null;
  characterState: CharacterState;
  codeGuardianEnabled: boolean;
  setCharacter: (character: CharacterProfile) => void;
  setCharacterState: (state: CharacterState) => void;
  equipPart: (category: PartCategory, partId: string) => Promise<void>;
  toggleCodeGuardian: (enabled: boolean) => Promise<void>;
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
