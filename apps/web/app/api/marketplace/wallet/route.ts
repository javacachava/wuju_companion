import { z } from "zod";

import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const characterId = z.string().min(1).parse(url.searchParams.get("characterId"));

    const character = await db.character.findUnique({
      where: { id: characterId },
      select: { coins: true },
    });

    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    return Response.json({ coins: character.coins });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/marketplace/wallet] failed", error);
    return Response.json({ error: "Wallet request failed" }, { status: 500 });
  }
}
