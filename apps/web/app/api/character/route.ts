import { z } from "zod";

import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { ensureCharacterForUser, serializeCharacter } from "@/lib/companion/server";

const categories = ["hair", "eyes", "mouth", "accessory", "clothing"] as const;
const CategorySchema = z.enum(categories);

const slotFieldByCategory: Record<
  (typeof categories)[number],
  "hairId" | "eyesId" | "mouthId" | "accessoryId" | "clothingId"
> = {
  hair: "hairId",
  eyes: "eyesId",
  mouth: "mouthId",
  accessory: "accessoryId",
  clothing: "clothingId",
};

const PatchCharacterSchema = z
  .object({
    category: CategorySchema,
    partId: z.string().min(1),
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
    return Response.json(await serializeCharacter(characterId));
  } catch (error) {
    console.error("[api/character] GET failed", error);
    return Response.json({ error: "Character request failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const characterId = await getAuthenticatedCharacterId();
    if (!characterId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = PatchCharacterSchema.parse(await request.json());

    const inventoryItem = await db.inventoryItem.findFirst({
      where: {
        characterId,
        partId: body.partId,
      },
      include: { part: true },
    });

    if (!inventoryItem) {
      return Response.json({ error: "Part is not in character inventory" }, { status: 403 });
    }

    if (inventoryItem.part.category !== body.category) {
      return Response.json(
        { error: "Part category does not match requested slot" },
        { status: 400 },
      );
    }

    await db.character.update({
      where: { id: characterId },
      data: {
        [slotFieldByCategory[body.category]]: body.partId,
      },
    });

    return Response.json(await serializeCharacter(characterId));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/character] PATCH failed", error);
    return Response.json({ error: "Character update failed" }, { status: 500 });
  }
}
