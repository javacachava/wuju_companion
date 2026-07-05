import { formatDataStreamPart } from "ai";
import { z } from "zod";

import { chatWithCompanion } from "@/lib/ai";
import { describeAiError } from "@/lib/ai-errors";
import { db } from "@/lib/db";
import { triggerConversationLog } from "@/lib/n8n";

const ChatRequestSchema = z
  .object({
    characterId: z.string().min(1),
    message: z.string().min(1),
    activeSkill: z.enum(["chat-base", "code-guardian"]),
  })
  .strict();

const STREAM_ERROR_MESSAGE = "No pude responder ahora. Probemos de nuevo en un momento.";

function toSafeDataStreamResponse(result: ReturnType<typeof chatWithCompanion>) {
  const dataStream = result.toDataStream({
    getErrorMessage: () => STREAM_ERROR_MESSAGE,
  });

  const safeStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = dataStream.getReader();
      const encoder = new TextEncoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          controller.enqueue(value);
        }
      } catch (error) {
        console.error("[api/chat] stream failed:", describeAiError(error));
        controller.enqueue(
          encoder.encode(formatDataStreamPart("error", STREAM_ERROR_MESSAGE)),
        );
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(safeStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}

export async function POST(request: Request) {
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

    return toSafeDataStreamResponse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/chat] failed", error);
    return Response.json({ error: "Chat failed" }, { status: 500 });
  }
}
