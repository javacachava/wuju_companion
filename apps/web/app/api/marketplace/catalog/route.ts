import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export type CatalogProduct = {
  productType: "part" | "character" | "pack";
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

export async function GET() {
  try {
    const user = await getSessionUser();

    const [parts, templates, packs, ownerships] = await Promise.all([
      db.part.findMany({ orderBy: [{ category: "asc" }, { price: "asc" }] }),
      db.characterTemplate.findMany({ orderBy: { priceCents: "asc" } }),
      db.pack.findMany({ orderBy: { priceCents: "asc" } }),
      user
        ? db.ownership.findMany({ where: { userId: user.id }, select: { productType: true, productId: true } })
        : Promise.resolve([]),
    ]);

    const owned = new Set(ownerships.map((o) => `${o.productType}:${o.productId}`));

    const products: CatalogProduct[] = [
      ...templates.map((t) => ({
        productType: "character" as const,
        productId: t.id,
        name: t.name,
        description: t.summary,
        category: t.role,
        imageUrl: null,
        avatar: t.avatar,
        priceCents: t.priceCents,
        isPremium: t.isPremium,
        available: true,
        owned: owned.has(`character:${t.id}`),
      })),
      ...packs.map((p) => ({
        productType: "pack" as const,
        productId: p.id,
        name: p.name,
        description: p.description,
        category: "pack",
        imageUrl: null,
        avatar: null,
        priceCents: p.priceCents,
        isPremium: p.isPremium,
        available: p.available,
        owned: owned.has(`pack:${p.id}`),
      })),
      ...parts.map((p) => ({
        productType: "part" as const,
        productId: p.id,
        name: p.name,
        description: `Parte de wardrobe: ${p.category}`,
        category: p.category,
        imageUrl: p.imageUrl,
        avatar: null,
        priceCents: p.price, // el campo price de Part ya está en centavos
        isPremium: p.isPremium,
        available: true,
        owned: owned.has(`part:${p.id}`),
      })),
    ];

    return Response.json({ products, user });
  } catch (error) {
    console.error("[api/marketplace/catalog] failed", error);
    return Response.json({ error: "Catalog request failed" }, { status: 500 });
  }
}
