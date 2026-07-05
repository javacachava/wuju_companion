import { z } from "zod";

import { chatWithCompanion } from "@/lib/ai";
import { db } from "@/lib/db";
import { triggerConversationLog } from "@/lib/n8n";
import { enforceRateLimit } from "@/lib/rate-limit";
import { toSafeDataStreamResponse } from "@/lib/safe-stream";

const ChatRequestSchema = z
  .object({
    characterId: z.string().min(1),
    message: z.string().min(1),
    activeSkill: z.enum(["chat-base", "code-guardian"]),
  })
  .strict();

const STREAM_ERROR_MESSAGE = "No pude responder ahora. Probemos de nuevo en un momento.";

export async function POST(request: Request) {
  const limited = enforceRateLimit("chat", request);
  if (limited) return limited;

  try {
    const body = ChatRequestSchema.parse(await request.json());

    if (body.activeSkill === "code-guardian") {
      return Response.json(
        { error: "Usa /api/audit para el skill code-guardian" },
        { status: 400 },
      );
    }

    const character = await db.character.findUnique({
      where: { id: body.characterId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 8,
        },
      },
    });

    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    const lastMessages = character.messages
      .slice()
      .reverse()
      .map((message) => ({
        role: message.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: message.content,
      }));

    const result = chatWithCompanion({
      characterName: character.userName,
      message: body.message,
      personality: character.personality,
      lastMessages,
      onFinish: async (assistantMessage) => {
        await db.$transaction([
          db.message.create({
            data: {
              characterId: body.characterId,
              role: "user",
              content: body.message,
              skillUsed: body.activeSkill,
            },
          }),
          db.message.create({
            data: {
              characterId: body.characterId,
              role: "assistant",
              content: assistantMessage,
              skillUsed: body.activeSkill,
            },
          }),
        ]);

        void triggerConversationLog({
          characterId: body.characterId,
          userMessage: body.message,
          assistantMessage,
          skillUsed: body.activeSkill,
        });
      },
    });

    return toSafeDataStreamResponse(result, STREAM_ERROR_MESSAGE, "api/chat");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/chat] failed", error);
    return Response.json({ error: "Chat failed" }, { status: 500 });
  }
}
