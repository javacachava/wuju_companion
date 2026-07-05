import { NextRequest, NextResponse } from "next/server";
import { listWorkshopCharacters } from "@/lib/domain/characterService";
import { getUserInventory } from "@/lib/domain/customizationService";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const userId = request.headers.get("x-user-id") ?? "demo-user";

  try {
    const [characters, inventory] = await Promise.all([
      listWorkshopCharacters({ category, search, userId }),
      getUserInventory(userId)
    ]);
    const installedSet = new Set(inventory.installed.map((item) => item.characterId));

    const payload = characters.map((character) => ({
      ...character,
      installed: installedSet.has(character.id)
    }));
    return NextResponse.json({ data: payload });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado en catálogo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
