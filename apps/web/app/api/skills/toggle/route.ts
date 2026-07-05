import { z } from "zod";

import { db } from "@/lib/db";

const ToggleSkillSchema = z
  .object({
    characterId: z.string().min(1),
    skillKey: z.enum(["chat-base", "code-guardian"]),
    enabled: z.boolean(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = ToggleSkillSchema.parse(await request.json());

    const character = await db.character.findUnique({
      where: { id: body.characterId },
      select: { id: true },
    });

    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    if (body.enabled) {
      await db.activeSkill.upsert({
        where: {
          characterId_skillKey: {
            characterId: body.characterId,
            skillKey: body.skillKey,
          },
        },
        update: {},
        create: {
          characterId: body.characterId,
          skillKey: body.skillKey,
        },
      });
    } else if (body.skillKey !== "chat-base") {
      await db.activeSkill.deleteMany({
        where: {
          characterId: body.characterId,
          skillKey: body.skillKey,
        },
      });
    }

    const activeSkills = await db.activeSkill.findMany({
      where: { characterId: body.characterId },
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
