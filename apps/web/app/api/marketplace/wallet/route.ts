import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { ensureCharacterForUser } from "@/lib/companion/server";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const characterId = await ensureCharacterForUser(session.user.id, session.user.email);

    const character = await db.character.findUniqueOrThrow({
      where: { id: characterId },
      select: { coins: true },
    });
    return Response.json({ coins: character.coins });
  } catch (error) {
    console.error("[api/marketplace/wallet] failed", error);
    return Response.json({ error: "Wallet request failed" }, { status: 500 });
  }
}
