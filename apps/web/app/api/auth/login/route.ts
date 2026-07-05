import { z } from "zod";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, writeSessionCookie } from "@/lib/auth/session";
import { ensureCharacterForUser } from "@/lib/companion/server";

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await ensureCharacterForUser(user.id, user.email);
    const { token, expiresAt } = await createSession(user.id);

    const response = NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email },
    });
    writeSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", issues: error.issues },
        { status: 400 },
      );
    }

    console.error("[api/auth/login] failed", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
