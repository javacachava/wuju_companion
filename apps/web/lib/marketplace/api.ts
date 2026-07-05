export type ProductType = "part" | "character" | "pack";

export type CatalogProduct = {
  productType: ProductType;
  productId: string;
  name: string;
  description: string;
  category: string | null;
  imageUrl: string | null;
  avatar: string | null;
  priceCents: number;
  isPremium: boolean;
  available: boolean;
  owned: boolean;
};

export type CheckoutResult = {
  orderId: string;
  totalCents: number;
  status: string;
  items: Array<{ name: string; priceCents: number }>;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(response.status, data.error ?? `Marketplace API ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getCatalog(): Promise<CatalogProduct[]> {
  const data = await readJson<{ products: CatalogProduct[] }>("/api/marketplace/catalog");
  return data.products;
}

export async function checkoutCart(
  items: Array<{ productType: ProductType; productId: string }>,
): Promise<CheckoutResult> {
  return readJson<CheckoutResult>("/api/marketplace/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}
