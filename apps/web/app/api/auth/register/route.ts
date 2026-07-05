import { z } from "zod";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession, writeSessionCookie } from "@/lib/auth/session";
import { ensureCharacterForUser } from "@/lib/companion/server";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();
    const passwordHash = hashPassword(body.password);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      },
      select: { id: true, email: true },
    });

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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    console.error("[api/auth/register] failed", error);
    return NextResponse.json({ error: "Register failed" }, { status: 500 });
  }
}
