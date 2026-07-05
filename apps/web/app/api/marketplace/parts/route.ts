import { z } from "zod";

import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const characterId = z
      .string()
      .min(1)
      .optional()
      .parse(url.searchParams.get("characterId") ?? undefined);

    if (!characterId) {
      const premiumParts = await db.part.findMany({
        where: { isPremium: true },
        orderBy: [{ category: "asc" }, { price: "asc" }],
      });

      return Response.json(premiumParts);
    }

    const character = await db.character.findUnique({
      where: { id: characterId },
      select: { id: true },
    });

    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    const ownedItems = await db.inventoryItem.findMany({
      where: { characterId },
      select: { partId: true },
    });

    const ownedPartIds = ownedItems.map((item) => item.partId);
    const parts = await db.part.findMany({
      where: {
        id: {
          notIn: ownedPartIds,
        },
      },
      orderBy: [{ category: "asc" }, { price: "asc" }],
    });

    return Response.json(parts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/marketplace/parts] failed", error);
    return Response.json({ error: "Marketplace request failed" }, { status: 500 });
  }
}
