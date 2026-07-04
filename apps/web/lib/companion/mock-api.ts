import type { CharacterProfile, CharacterPart, PartCategory } from "./types";

const STORAGE_PREFIX = "companion-mock-character:";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const BASE_PARTS: Record<PartCategory, CharacterPart> = {
  hair: {
    id: "hair-corto",
    name: "Corto",
    imageUrl: "/parts/hair-corto.png",
  },
  eyes: {
    id: "eyes-grandes",
    name: "Grandes",
    imageUrl: "/parts/eyes-grandes.png",
  },
  mouth: {
    id: "mouth-sonrisa",
    name: "Sonrisa",
    imageUrl: "/parts/mouth-sonrisa.png",
  },
  accessory: {
    id: "accessory-ninguno",
    name: "Ninguno",
    imageUrl: "/parts/accessory-ninguno.png",
  },
  clothing: {
    id: "clothing-remera",
    name: "Remera",
    imageUrl: "/parts/clothing-remera.png",
  },
};

const buildCharacter = (userName: string): CharacterProfile => ({
  id: `mock-${crypto.randomUUID()}`,
  userName: userName.trim().toLowerCase(),
  personality: "amigable",
  voiceId: "21m00Tcm4TlvDq8ikWAM",
  parts: {
    hair: BASE_PARTS.hair,
    eyes: BASE_PARTS.eyes,
    mouth: BASE_PARTS.mouth,
    accessory: BASE_PARTS.accessory,
    clothing: BASE_PARTS.clothing,
  },
  assistant: null,
});

const keyFor = (characterId: string) => `${STORAGE_PREFIX}${characterId}`;

export async function createCharacter(userName: string): Promise<CharacterProfile> {
  await wait(400);
  const next = buildCharacter(userName);
  localStorage.setItem(keyFor(next.id), JSON.stringify(next));
  return next;
}

export async function getCharacter(
  characterId: string,
): Promise<CharacterProfile | null> {
  await wait(220);
  const raw = localStorage.getItem(keyFor(characterId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CharacterProfile>;

    return {
      id: parsed.id ?? characterId,
      userName: parsed.userName ?? "usuario",
      personality: parsed.personality ?? "amigable",
      voiceId: parsed.voiceId ?? "21m00Tcm4TlvDq8ikWAM",
      parts: parsed.parts ?? {
        hair: BASE_PARTS.hair,
        eyes: BASE_PARTS.eyes,
        mouth: BASE_PARTS.mouth,
        accessory: BASE_PARTS.accessory,
        clothing: BASE_PARTS.clothing,
      },
      assistant: parsed.assistant ?? null,
    };
  } catch {
    return null;
  }
}

export async function saveCharacter(character: CharacterProfile): Promise<void> {
  await wait(180);
  localStorage.setItem(keyFor(character.id), JSON.stringify(character));
}
