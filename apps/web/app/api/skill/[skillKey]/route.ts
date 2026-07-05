import { z } from "zod";

import { describeAiError, getAiClientErrorMessage, isAiQuotaError } from "@/lib/ai-errors";
import { db } from "@/lib/db";
import { triggerAuditCritical, triggerConversationLog } from "@/lib/n8n";
import { enforceRateLimit } from "@/lib/rate-limit";
import { toSafeDataStreamResponse } from "@/lib/safe-stream";
import { isSkillKey, SKILL_REGISTRY } from "@/lib/skills/registry";

// Fase 7 de DESKTOP-MIGRATION-PLAN.md: ruta genérica por Skill Registry.
// Ver nota en lib/skills/registry.ts — convive con /api/chat y /api/audit,
// no los reemplaza en este pase.

const SkillRequestSchema = z
  .object({
    characterId: z.string().min(1),
    message: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    language: z.string().min(1).optional(),
  })
  .strict();

const STREAM_ERROR_MESSAGE = "No pude responder ahora. Probemos de nuevo en un momento.";

function rateLimitBucketFor(skillKey: string): "chat" | "audit" {
  return skillKey === "code-guardian" ? "audit" : "chat";
}

export async function POST(request: Request, { params }: { params: Promise<{ skillKey: string }> }) {
  const { skillKey } = await params;

  if (!isSkillKey(skillKey)) {
    return Response.json({ error: "unknown_skill", skillKey }, { status: 404 });
  }

  const limited = enforceRateLimit(rateLimitBucketFor(skillKey), request);
  if (limited) return limited;

  const skill = SKILL_REGISTRY[skillKey];

  try {
    const body = SkillRequestSchema.parse(await request.json());

    if (skill.needsCode && !body.code) {
      return Response.json({ error: "code_required" }, { status: 400 });
    }

    if (!skill.needsCode && !body.message) {
      return Response.json({ error: "message_required" }, { status: 400 });
    }

    const character = await db.character.findUnique({
      where: { id: body.characterId },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 8 } },
    });

    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    if (skill.kind === "stream") {
      const lastMessages = character.messages
        .slice()
        .reverse()
        .map((entry) => ({
          role: entry.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: entry.content,
        }));

      const result = skill.run({
        characterName: character.userName,
        personality: character.personality,
        message: body.message,
        history: lastMessages,
        onFinish: async (assistantMessage) => {
          await db.$transaction([
            db.message.create({
              data: {
                characterId: body.characterId,
                role: "user",
                content: body.message ?? "",
                skillUsed: skillKey,
              },
            }),
            db.message.create({
              data: {
                characterId: body.characterId,
                role: "assistant",
                content: assistantMessage,
                skillUsed: skillKey,
              },
            }),
          ]);

          void triggerConversationLog({
            characterId: body.characterId,
            userMessage: body.message ?? "",
            assistantMessage,
            skillUsed: skillKey,
          });
        },
      });

      return toSafeDataStreamResponse(result, STREAM_ERROR_MESSAGE, `api/skill/${skillKey}`);
    }

    const report = await skill.run({
      characterName: character.userName,
      personality: character.personality,
      code: body.code,
      language: body.language ?? "text",
    });

    const criticalCount = report.findings.filter((finding) => finding.severity === "critical").length;

    if (criticalCount > 0) {
      void triggerAuditCritical({
        characterId: character.id,
        criticalCount,
        summary: report.summary,
      });
    }

    return Response.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error(`[api/skill/${skillKey}] failed:`, describeAiError(error));

    return Response.json(
      { error: "skill_failed", message: getAiClientErrorMessage(error) },
      { status: isAiQuotaError(error) ? 503 : 500 },
    );
  }
}
