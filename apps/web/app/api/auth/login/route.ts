import { z } from "zod";

import { createSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";

const LoginSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export async function POST(request: Request) {
  const limited = enforceRateLimit("auth", request);
  if (limited) return limited;

  try {
    const body = LoginSchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();

    const user = await db.user.findUnique({ where: { email } });
    // Mismo mensaje si el email no existe o el password falla: no filtrar cuáles emails tienen cuenta.
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return Response.json({ error: "Email o contraseña incorrectos." }, { status: 401 });
    }

    await createSession(user.id);
    return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Datos inválidos", issues: error.issues }, { status: 400 });
    }

    console.error("[api/auth/login] failed", error);
    return Response.json({ error: "No se pudo iniciar sesión." }, { status: 500 });
  }
}
