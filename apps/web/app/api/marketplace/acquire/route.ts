import { z } from "zod";

import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { ensureCharacterForUser } from "@/lib/companion/server";

const AcquirePartSchema = z
  .object({
    partId: z.string().min(1),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = AcquirePartSchema.parse(await request.json());
    const session = await getSessionFromCookie();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const characterId = await ensureCharacterForUser(session.user.id, session.user.email);

    const [character, part, existing] = await Promise.all([
      db.character.findUnique({ where: { id: characterId } }),
      db.part.findUnique({ where: { id: body.partId } }),
      db.inventoryItem.findUnique({
        where: {
          characterId_partId: {
            characterId,
            partId: body.partId,
          },
        },
      }),
    ]);

    if (!character || !part) {
      return Response.json({ error: "Character or part not found" }, { status: 404 });
    }

    // Ya la tiene: no volvemos a cobrar (idempotente).
    if (existing) {
      return Response.json({ inventoryItem: existing, coins: character.coins });
    }

    // Saldo real: si es de pago y no alcanza, no tocamos nada.
    if (part.price > 0 && character.coins < part.price) {
      return Response.json(
        { error: "insufficient_funds", coins: character.coins, price: part.price },
        { status: 402 },
      );
    }

    // Cobro + alta de inventario en una sola transacción atómica.
    const [updatedCharacter, inventoryItem] = await db.$transaction([
      db.character.update({
        where: { id: characterId },
        data: { coins: { decrement: part.price } },
        select: { coins: true },
      }),
      db.inventoryItem.create({
        data: {
          characterId,
          partId: body.partId,
        },
      }),
    ]);

    return Response.json({ inventoryItem, coins: updatedCharacter.coins });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/marketplace/acquire] failed", error);
    return Response.json({ error: "Acquire request failed" }, { status: 500 });
  }
}
