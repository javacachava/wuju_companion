import { NextResponse } from "next/server";

import { getSessionFromCookie } from "@/lib/auth/session";
import { ensureCharacterForUser, serializeCharacter } from "@/lib/companion/server";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const characterId = await ensureCharacterForUser(session.user.id, session.user.email);
    const character = await serializeCharacter(characterId);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      character,
    });
  } catch (error) {
    console.error("[api/auth/session] failed", error);
    return NextResponse.json({ error: "Session request failed" }, { status: 500 });
  }
}
