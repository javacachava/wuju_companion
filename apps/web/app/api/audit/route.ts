import { z } from "zod";

import { auditCode } from "@/lib/ai";
import { describeAiError, getAiClientErrorMessage, isAiQuotaError } from "@/lib/ai-errors";
import { db } from "@/lib/db";
import { triggerAuditCritical } from "@/lib/n8n";
import { enforceRateLimit } from "@/lib/rate-limit";

const AuditRequestSchema = z
  .object({
    characterId: z.string().min(1),
    code: z.string().min(1),
    language: z.string().min(1),
  })
  .strict();

export async function POST(request: Request) {
  const limited = enforceRateLimit("audit", request);
  if (limited) return limited;

  try {
    const body = AuditRequestSchema.parse(await request.json());

    const character = await db.character.findUnique({
      where: { id: body.characterId },
      select: {
        id: true,
        personality: true,
      },
    });

    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    const report = await auditCode({
      code: body.code,
      language: body.language,
      personality: character.personality,
    });

    const criticalCount = report.findings.filter(
      (finding) => finding.severity === "critical",
    ).length;

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

    console.error("[api/audit] failed:", describeAiError(error));

    return Response.json(
      {
        error: "Audit failed",
        message: getAiClientErrorMessage(error),
      },
      { status: isAiQuotaError(error) ? 503 : 500 },
    );
  }
}
