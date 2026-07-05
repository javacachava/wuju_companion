import { z } from "zod";

import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { ensureCharacterForUser } from "@/lib/companion/server";

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
    marketplaceCharacter: marketplaceCharacterSchema,
  })
  .strict();

async function getAuthenticatedCharacterId() {
  const session = await getSessionFromCookie();
  if (!session) return null;
  return ensureCharacterForUser(session.user.id, session.user.email);
}

export async function GET() {
  try {
    const characterId = await getAuthenticatedCharacterId();
    if (!characterId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const characterId = await getAuthenticatedCharacterId();
    if (!characterId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = body.marketplaceCharacter;
    const item = await db.savedMarketplaceCharacter.upsert({
      where: {
        characterId_marketplaceCharacterId: {
          characterId,
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
        characterId,
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
