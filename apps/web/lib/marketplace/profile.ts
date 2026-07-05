export type MarketplaceCharacterPayload = {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  image: string;
  tag: string;
  tagTone: "blue" | "slate" | "cyan" | "gold" | "rose" | "green" | "violet";
  background: string;
  isNew?: boolean;
  isPopular?: boolean;
};

export type SavedMarketplaceCharacter = {
  id: string;
  characterId: string;
  marketplaceCharacterId: string;
  name: string;
  category: string;
  categoryId: string;
  image: string;
  tag: string;
  tagTone: MarketplaceCharacterPayload["tagTone"];
  background: string;
  isNew: boolean;
  isPopular: boolean;
  savedAt: string;
};

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("authentication_required");
    this.name = "AuthenticationRequiredError";
  }
}

// Auth vieja: no hay resolución de personaje por sesión, así que se usa el
// mismo characterId que ya cachea CompanionGlobalContext en localStorage.
function getStoredCharacterId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("characterId");
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (response.status === 401) {
    throw new AuthenticationRequiredError();
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Profile API ${response.status}: ${body.slice(0, 160)}`);
  }

  return response.json() as Promise<T>;
}

export async function getSavedMarketplaceCharacters(): Promise<SavedMarketplaceCharacter[]> {
  const characterId = getStoredCharacterId();
  if (!characterId) {
    throw new AuthenticationRequiredError();
  }

  const data = await readJson<{ items: SavedMarketplaceCharacter[] }>(
    `/api/profile/marketplace-characters?characterId=${encodeURIComponent(characterId)}`,
  );
  return data.items;
}

export async function saveMarketplaceCharacterToProfile(input: {
  marketplaceCharacter: MarketplaceCharacterPayload;
}): Promise<SavedMarketplaceCharacter> {
  const characterId = getStoredCharacterId();
  if (!characterId) {
    throw new AuthenticationRequiredError();
  }

  const data = await readJson<{ saved: true; item: SavedMarketplaceCharacter }>(
    "/api/profile/marketplace-characters",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, ...input }),
    },
  );
  return data.item;
}
