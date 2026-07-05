import { createHash } from "node:crypto";

import { env } from "@/lib/env";

const audioCache = new Map<string, Buffer>();

function cacheKey(text: string, voiceId: string) {
  return createHash("sha256").update(`${voiceId}:${text}`).digest("hex");
}

export async function synthesizeSpeech(text: string, voiceId: string) {
  const key = cacheKey(text, voiceId);
  const cachedAudio = audioCache.get(key);

  if (cachedAudio) {
    return cachedAudio;
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`ElevenLabs respondio ${response.status}: ${details}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  audioCache.set(key, audio);

  return audio;
}
