import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveCharacterToProfile } from "@/lib/domain/installationService";

const installPayloadSchema = z.object({
  characterId: z.string().min(1),
  version: z.string().optional()
});

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id") ?? "demo-user";

  try {
    const body = await request.json();
    const payload = installPayloadSchema.parse(body);
    const result = await saveCharacterToProfile({
      userId,
      characterId: payload.characterId,
      version: payload.version
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo guardar el personaje en perfil.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
