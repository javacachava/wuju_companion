import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { ensureCharacterForUser } from "@/lib/companion/server";

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

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const characterId = await ensureCharacterForUser(session.user.id, session.user.email);

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
    console.error("[api/inventory] failed", error);
    return Response.json({ error: "Inventory request failed" }, { status: 500 });
  }
}
