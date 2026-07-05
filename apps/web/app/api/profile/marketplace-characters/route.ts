import { z } from "zod";

import { db } from "@/lib/db";

const tagToneSchema = z.enum(["blue", "slate", "cyan", "gold", "rose", "green", "violet"]);

const marketplaceCharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  categoryId: z.string().min(1),
  image: z.string().min(1),
  tag: z.string().min(1),
  tagTone: tagToneSchema,
  background: z.string().min(1),
  isNew: z.boolean().optional(),
  isPopular: z.boolean().optional(),
});

const saveSchema = z
  .object({
    characterId: z.string().min(1),
    marketplaceCharacter: marketplaceCharacterSchema,
  })
  .strict();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const characterId = z.string().min(1).parse(url.searchParams.get("characterId"));

    const items = await db.savedMarketplaceCharacter.findMany({
      where: { characterId },
      orderBy: { savedAt: "desc" },
    });

    return Response.json({ items });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/profile/marketplace-characters] GET failed", error);
    return Response.json({ error: "Failed to load saved characters" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = saveSchema.parse(await request.json());
    const payload = body.marketplaceCharacter;

    const item = await db.savedMarketplaceCharacter.upsert({
      where: {
        characterId_marketplaceCharacterId: {
          characterId: body.characterId,
          marketplaceCharacterId: payload.id,
        },
      },
      update: {
        name: payload.name,
        category: payload.category,
        categoryId: payload.categoryId,
        image: payload.image,
        tag: payload.tag,
        tagTone: payload.tagTone,
        background: payload.background,
        isNew: payload.isNew ?? false,
        isPopular: payload.isPopular ?? false,
      },
      create: {
        characterId: body.characterId,
        marketplaceCharacterId: payload.id,
        name: payload.name,
        category: payload.category,
        categoryId: payload.categoryId,
        image: payload.image,
        tag: payload.tag,
        tagTone: payload.tagTone,
        background: payload.background,
        isNew: payload.isNew ?? false,
        isPopular: payload.isPopular ?? false,
      },
    });

    return Response.json({ saved: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/profile/marketplace-characters] POST failed", error);
    return Response.json({ error: "Failed to save character" }, { status: 500 });
  }
}
