import type { PartCategory } from "@/lib/companion/types";

export type MarketplacePart = {
  id: string;
  category: PartCategory;
  name: string;
  imageUrl: string;
  isPremium: boolean;
  price: number;
};

export type AcquireResult = {
  coins: number;
};

/** Error de saldo insuficiente devuelto por el server (HTTP 402). */
export class InsufficientFundsError extends Error {
  readonly coins: number;
  readonly price: number;

  constructor(coins: number, price: number) {
    super("insufficient_funds");
    this.name = "InsufficientFundsError";
    this.coins = coins;
    this.price = price;
  }
}

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

export async function getWallet(characterId: string): Promise<number> {
  const { coins } = await readJson<{ coins: number }>(
    `/api/marketplace/wallet?characterId=${encodeURIComponent(characterId)}`,
  );
  return coins;
}

export async function acquirePart(characterId: string, partId: string): Promise<AcquireResult> {
  const response = await fetch(`/api/marketplace/acquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ characterId, partId }),
  });

  if (response.status === 402) {
    const data = (await response.json().catch(() => ({}))) as {
      coins?: number;
      price?: number;
    };
    throw new InsufficientFundsError(data.coins ?? 0, data.price ?? 0);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Marketplace API ${response.status}: ${body.slice(0, 160)}`);
  }

  const data = (await response.json()) as { coins: number };
  return { coins: data.coins };
}
