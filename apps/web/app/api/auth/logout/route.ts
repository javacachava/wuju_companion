import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[api/auth/logout] failed", error);
    return Response.json({ error: "No se pudo cerrar sesión." }, { status: 500 });
  }
}
