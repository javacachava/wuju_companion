import { z } from "zod";

import { db } from "@/lib/db";

const AcquirePartSchema = z
  .object({
    characterId: z.string().min(1),
    partId: z.string().min(1),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = AcquirePartSchema.parse(await request.json());

    const [character, part] = await Promise.all([
      db.character.findUnique({ where: { id: body.characterId } }),
      db.part.findUnique({ where: { id: body.partId } }),
    ]);

    if (!character || !part) {
      return Response.json({ error: "Character or part not found" }, { status: 404 });
    }

    const inventoryItem = await db.inventoryItem.upsert({
      where: {
        characterId_partId: {
          characterId: body.characterId,
          partId: body.partId,
        },
      },
      update: {},
      create: {
        characterId: body.characterId,
        partId: body.partId,
      },
    });

    return Response.json(inventoryItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/marketplace/acquire] failed", error);
    return Response.json({ error: "Acquire request failed" }, { status: 500 });
  }
}
