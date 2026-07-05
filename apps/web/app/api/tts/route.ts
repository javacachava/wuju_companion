import { z } from "zod";

import { synthesizeSpeech } from "@/lib/tts";
import { enforceRateLimit } from "@/lib/rate-limit";

const TtsRequestSchema = z
  .object({
    text: z.string().min(1).max(5_000),
    voiceId: z.string().min(1),
  })
  .strict();

export async function POST(request: Request) {
  const limited = enforceRateLimit("tts", request);
  if (limited) return limited;

  try {
    const body = TtsRequestSchema.parse(await request.json());
    const audio = await synthesizeSpeech(body.text, body.voiceId);

    return new Response(audio, {
      headers: {
        "Cache-Control": "private, max-age=3600",
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/tts] failed", error);
    return Response.json({ error: "TTS failed" }, { status: 500 });
  }
}
