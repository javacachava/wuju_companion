import { z } from "zod";

import { createSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";

const RegisterSchema = z
  .object({
    email: z.string().email().max(254),
    name: z.string().min(2).max(80),
    password: z.string().min(8).max(128),
  })
  .strict();

export async function POST(request: Request) {
  const limited = enforceRateLimit("auth", request);
  if (limited) return limited;

  try {
    const body = RegisterSchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Ese email ya tiene una cuenta." }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        email,
        name: body.name.trim(),
        passwordHash: await hashPassword(body.password),
      },
      select: { id: true, email: true, name: true },
    });

    await createSession(user.id);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Datos inválidos", issues: error.issues }, { status: 400 });
    }

    console.error("[api/auth/register] failed", error);
    return Response.json({ error: "No se pudo crear la cuenta." }, { status: 500 });
  }
}
