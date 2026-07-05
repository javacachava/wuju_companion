import { NextResponse } from "next/server";

import { clearSessionCookie, revokeCurrentSession } from "@/lib/auth/session";

export async function POST() {
  await revokeCurrentSession();

  const response = NextResponse.json({ authenticated: false });
  clearSessionCookie(response);
  return response;
}
