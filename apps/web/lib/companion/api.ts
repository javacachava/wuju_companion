import type {
  CharacterInventory,
  CharacterPart,
  CharacterParts,
  CharacterProfile,
  PartCategory,
  SelectedAssistant,
} from "./types";

const categories = ["hair", "eyes", "mouth", "accessory", "clothing"] as const;
const ASSISTANT_STORAGE_PREFIX = "companion-assistant:";

type ApiCharacterPart = {
  id: string;
  imageUrl: string;
};

type ApiCharacter = {
  id: string;
  userName: string;
  personality: CharacterProfile["personality"];
  voiceId: string;
  parts: Record<PartCategory, ApiCharacterPart | null>;
};

type ApiInventory = Record<PartCategory, CharacterPart[]>;

function emptyInventory(): CharacterInventory {
  return {
    hair: [],
    eyes: [],
    mouth: [],
    accessory: [],
    clothing: [],
  };
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Companion API ${response.status}: ${body.slice(0, 160)}`);
  }

  return response.json() as Promise<T>;
}

function getStoredAssistant(characterId: string): SelectedAssistant | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(`${ASSISTANT_STORAGE_PREFIX}${characterId}`);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SelectedAssistant;
  } catch {
    return null;
  }
}

function saveStoredAssistant(characterId: string, assistant: SelectedAssistant | null) {
  if (typeof window === "undefined") {
    return;
  }

  const key = `${ASSISTANT_STORAGE_PREFIX}${characterId}`;
  if (!assistant) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(assistant));
}

function hydrateParts(character: ApiCharacter, inventory: CharacterInventory): CharacterParts {
  return Object.fromEntries(
    categories.map((category) => {
      const equipped = character.parts[category];
      if (!equipped) {
        return [category, null];
      }

      const inventoryPart = inventory[category].find((part) => part.id === equipped.id);
      return [
        category,
        {
          id: equipped.id,
          name: inventoryPart?.name ?? category,
          imageUrl: equipped.imageUrl,
        },
      ];
    }),
  ) as CharacterParts;
}

function toCharacterProfile(
  character: ApiCharacter,
  inventory: CharacterInventory,
): CharacterProfile {
  const assistant = getStoredAssistant(character.id);

  return {
    id: character.id,
    userName: character.userName,
    personality: assistant?.personality ?? character.personality,
    voiceId: assistant?.voiceId ?? character.voiceId,
    parts: hydrateParts(character, inventory),
    assistant,
  };
}

export async function getCharacter(userName: string): Promise<CharacterProfile> {
  const character = await readJson<ApiCharacter>(
    `/api/character?userName=${encodeURIComponent(userName)}`,
  );
  const inventory = await getInventory(character.id);

  return toCharacterProfile(character, inventory);
}

export async function createCharacter(userName: string): Promise<CharacterProfile> {
  return getCharacter(userName.trim().toLowerCase());
}

export async function getInventory(characterId: string): Promise<CharacterInventory> {
  const inventory = await readJson<ApiInventory>(
    `/api/inventory?characterId=${encodeURIComponent(characterId)}`,
  );

  return {
    ...emptyInventory(),
    ...inventory,
  };
}

export async function equipPart(
  character: CharacterProfile,
  category: PartCategory,
  partId: string,
): Promise<CharacterProfile> {
  const nextCharacter = await readJson<ApiCharacter>("/api/character", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      characterId: character.id,
      category,
      partId,
    }),
  });
  const inventory = await getInventory(nextCharacter.id);

  return {
    ...toCharacterProfile(nextCharacter, inventory),
    personality: character.personality,
    voiceId: character.voiceId,
    assistant: character.assistant,
  };
}

export async function saveCharacter(character: CharacterProfile): Promise<void> {
  saveStoredAssistant(character.id, character.assistant);
}
