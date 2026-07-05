import type { PartCategory } from "@/lib/companion/types";

export const CATEGORY_LABEL: Record<PartCategory, string> = {
  hair: "Pelo",
  eyes: "Ojos",
  mouth: "Boca",
  accessory: "Accesorio",
  clothing: "Ropa",
};

export const CATEGORY_EMOJI: Record<PartCategory, string> = {
  hair: "💇",
  eyes: "👀",
  mouth: "👄",
  accessory: "🎩",
  clothing: "👕",
};

export type MarketplaceFilter = "todo" | PartCategory;

export const FILTERS: Array<{ key: MarketplaceFilter; label: string }> = [
  { key: "todo", label: "Todo" },
  { key: "hair", label: "Pelo" },
  { key: "eyes", label: "Ojos" },
  { key: "mouth", label: "Boca" },
  { key: "accessory", label: "Accesorio" },
  { key: "clothing", label: "Ropa" },
];

export function isMarketplaceFilter(value: string | null): value is MarketplaceFilter {
  return value === "todo" || value === "hair" || value === "eyes" || value === "mouth" || value === "accessory" || value === "clothing";
}
