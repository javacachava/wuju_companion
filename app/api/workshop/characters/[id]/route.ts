import { NextRequest, NextResponse } from "next/server";
import { getWorkshopCharacterById } from "@/lib/domain/characterService";
import { getUserInventory } from "@/lib/domain/customizationService";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get("x-user-id") ?? "demo-user";
  const params = await context.params;
  try {
    const [character, inventory] = await Promise.all([
      getWorkshopCharacterById(params.id),
      getUserInventory(userId)
    ]);

    if (!character) {
      return NextResponse.json({ error: "Personaje no encontrado." }, { status: 404 });
    }

    const installedVersion = inventory.installed.find(
      (item) => item.characterId === character.id
    )?.version;

    return NextResponse.json({
      data: {
        ...character,
        installed: Boolean(installedVersion),
        installedVersion
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado en detalle.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
