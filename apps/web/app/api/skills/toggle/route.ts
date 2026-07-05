import { z } from "zod";

import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { ensureCharacterForUser } from "@/lib/companion/server";

const ToggleSkillSchema = z
  .object({
    skillKey: z.enum(["chat-base", "code-guardian"]),
    enabled: z.boolean(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = ToggleSkillSchema.parse(await request.json());

    const session = await getSessionFromCookie();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const characterId = await ensureCharacterForUser(session.user.id, session.user.email);

    if (body.enabled) {
      await db.activeSkill.upsert({
        where: {
          characterId_skillKey: {
            characterId,
            skillKey: body.skillKey,
          },
        },
        update: {},
        create: {
          characterId,
          skillKey: body.skillKey,
        },
      });
    } else {
      await db.activeSkill.deleteMany({
        where: {
          characterId,
          skillKey: body.skillKey,
        },
      });
    }

    const activeSkills = await db.activeSkill.findMany({
      where: { characterId },
      orderBy: { enabledAt: "asc" },
    });

    return Response.json(activeSkills);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/skills/toggle] failed", error);
    return Response.json({ error: "Skill request failed" }, { status: 500 });
  }
}
