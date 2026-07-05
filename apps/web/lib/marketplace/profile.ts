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
  const data = await readJson<{ items: SavedMarketplaceCharacter[] }>(
    "/api/profile/marketplace-characters",
  );
  return data.items;
}

export async function saveMarketplaceCharacterToProfile(input: {
  marketplaceCharacter: MarketplaceCharacterPayload;
}): Promise<SavedMarketplaceCharacter> {
  const data = await readJson<{ saved: true; item: SavedMarketplaceCharacter }>(
    "/api/profile/marketplace-characters",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.item;
}
