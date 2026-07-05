import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    return Response.json({ user });
  } catch (error) {
    console.error("[api/auth/me] failed", error);
    return Response.json({ user: null }, { status: 500 });
  }
}
