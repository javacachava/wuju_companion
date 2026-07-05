import { NextResponse } from "next/server";
import { z } from "zod";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/flac",
  "audio/m4a",
  "audio/mp3",
  "audio/mp4",
  "audio/mpeg",
  "audio/mpga",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
]);

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
});

const transcriptionResponseSchema = z
  .object({
    text: z.string(),
  })
  .passthrough();

const requestSchema = z.object({
  file: z
    .custom<File>((value): value is File => value instanceof File)
    .refine((file) => file.size > 0, "empty_audio")
    .refine((file) => file.size <= MAX_AUDIO_BYTES, "audio_too_large")
    .refine((file) => !file.type || SUPPORTED_AUDIO_TYPES.has(file.type), "unsupported_audio"),
  language: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional(),
});

const TRANSCRIBE_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 2;

async function callWhisper(openAiFormData: FormData, apiKey: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TRANSCRIBE_TIMEOUT_MS);

    try {
      return await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: openAiFormData,
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error;
      // Solo reintentamos fallas de red/timeout, no una respuesta HTTP de error
      // (esa la maneja el caller con response.ok).
      if (attempt === MAX_ATTEMPTS) {
        throw lastError;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  const env = envSchema.safeParse(process.env);
  if (!env.success) {
    return NextResponse.json({ error: "missing_openai_key" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const parsed = requestSchema.safeParse({
      file: formData.get("file"),
      language: formData.get("language") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_audio" }, { status: 400 });
    }

    const openAiFormData = new FormData();
    openAiFormData.append("file", parsed.data.file, parsed.data.file.name || "voice-spike.wav");
    openAiFormData.append("model", "whisper-1");
    openAiFormData.append("response_format", "json");
    openAiFormData.append("language", parsed.data.language ?? "es");

    let response: Response;
    try {
      response = await callWhisper(openAiFormData, env.data.OPENAI_API_KEY);
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";
      return NextResponse.json(
        { error: timedOut ? "transcription_timeout" : "transcription_failed" },
        { status: timedOut ? 504 : 502 },
      );
    }

    if (!response.ok) {
      return NextResponse.json({ error: "transcription_failed" }, { status: 502 });
    }

    const data = transcriptionResponseSchema.safeParse(await response.json());
    if (!data.success) {
      return NextResponse.json({ error: "invalid_transcription_response" }, { status: 502 });
    }

    return NextResponse.json({ text: data.data.text });
  } catch {
    return NextResponse.json({ error: "transcription_failed" }, { status: 500 });
  }
}
