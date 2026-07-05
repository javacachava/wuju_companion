import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyCustomizationProfile } from "@/lib/domain/customizationService";

const applySchema = z.object({
  characterId: z.string().min(1),
  mindId: z.string().min(1),
  skinId: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id") ?? "demo-user";

  try {
    const body = await request.json();
    const payload = applySchema.parse(body);
    const data = await applyCustomizationProfile({
      userId,
      characterId: payload.characterId,
      mindId: payload.mindId,
      skinId: payload.skinId
    });
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo aplicar el personaje.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
