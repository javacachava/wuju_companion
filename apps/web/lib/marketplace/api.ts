import type { PartCategory } from "@/lib/companion/types";

export type MarketplacePart = {
  id: string;
  category: PartCategory;
  name: string;
  imageUrl: string;
  isPremium: boolean;
  price: number;
};

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Marketplace API ${response.status}: ${body.slice(0, 160)}`);
  }

  return response.json() as Promise<T>;
}

export async function getMarketplaceParts(characterId?: string): Promise<MarketplacePart[]> {
  const query = characterId ? `?characterId=${encodeURIComponent(characterId)}` : "";
  return readJson<MarketplacePart[]>(`/api/marketplace/parts${query}`);
}

export async function acquirePart(characterId: string, partId: string): Promise<void> {
  await readJson(`/api/marketplace/acquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ characterId, partId }),
  });
}
