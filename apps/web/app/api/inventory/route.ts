import { z } from "zod";

import { db } from "@/lib/db";

const categories = ["hair", "eyes", "mouth", "accessory", "clothing"] as const;

type InventoryResponse = Record<
  (typeof categories)[number],
  Array<{
    id: string;
    name: string;
    imageUrl: string;
  }>
>;

function emptyInventory(): InventoryResponse {
  return {
    hair: [],
    eyes: [],
    mouth: [],
    accessory: [],
    clothing: [],
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const characterId = z.string().min(1).parse(url.searchParams.get("characterId"));

    const character = await db.character.findUnique({
      where: { id: characterId },
      select: { id: true },
    });

    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    const items = await db.inventoryItem.findMany({
      where: { characterId },
      include: { part: true },
      orderBy: { acquiredAt: "asc" },
    });

    const inventory = emptyInventory();

    for (const item of items) {
      if (categories.includes(item.part.category as (typeof categories)[number])) {
        inventory[item.part.category as (typeof categories)[number]].push({
          id: item.part.id,
          name: item.part.name,
          imageUrl: item.part.imageUrl,
        });
      }
    }

    return Response.json(inventory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/inventory] failed", error);
    return Response.json({ error: "Inventory request failed" }, { status: 500 });
  }
}
