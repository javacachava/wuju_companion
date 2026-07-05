import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";

const CheckoutSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productType: z.enum(["part", "character", "pack"]),
            productId: z.string().min(1),
          })
          .strict(),
      )
      .min(1)
      .max(50),
  })
  .strict();

type ResolvedItem = {
  productType: "part" | "character" | "pack";
  productId: string;
  name: string;
  priceCents: number;
};

export async function POST(request: Request) {
  const limited = enforceRateLimit("api", request);
  if (limited) return limited;

  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "Iniciá sesión para comprar." }, { status: 401 });
    }

    const body = CheckoutSchema.parse(await request.json());

    // Dedupe defensivo del carrito.
    const unique = new Map(body.items.map((item) => [`${item.productType}:${item.productId}`, item]));

    // Resolver cada ítem contra la DB: el precio SIEMPRE sale del server.
    const resolved: ResolvedItem[] = [];
    for (const item of unique.values()) {
      if (item.productType === "part") {
        const part = await db.part.findUnique({ where: { id: item.productId } });
        if (!part) return Response.json({ error: `Parte no encontrada: ${item.productId}` }, { status: 404 });
        resolved.push({ ...item, name: part.name, priceCents: part.price });
      } else if (item.productType === "character") {
        const template = await db.characterTemplate.findUnique({ where: { id: item.productId } });
        if (!template) return Response.json({ error: `Personaje no encontrado: ${item.productId}` }, { status: 404 });
        resolved.push({ ...item, name: template.name, priceCents: template.priceCents });
      } else {
        const pack = await db.pack.findUnique({ where: { id: item.productId } });
        if (!pack) return Response.json({ error: `Pack no encontrado: ${item.productId}` }, { status: 404 });
        if (!pack.available) {
          return Response.json({ error: `${pack.name} todavía no está disponible.` }, { status: 409 });
        }
        resolved.push({ ...item, name: pack.name, priceCents: pack.priceCents });
      }
    }

    // No cobrar lo ya poseído.
    const ownerships = await db.ownership.findMany({
      where: { userId: user.id },
      select: { productType: true, productId: true },
    });
    const owned = new Set(ownerships.map((o) => `${o.productType}:${o.productId}`));
    const toBuy = resolved.filter((item) => !owned.has(`${item.productType}:${item.productId}`));

    if (toBuy.length === 0) {
      return Response.json({ error: "Ya tenés todo lo que hay en el carrito." }, { status: 409 });
    }

    const totalCents = toBuy.reduce((sum, item) => sum + item.priceCents, 0);

    // Pago SIMULADO: no hay pasarela. La orden queda registrada como 'paid_simulated'.
    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          totalCents,
          status: "paid_simulated",
          items: {
            create: toBuy.map((item) => ({
              productType: item.productType,
              productId: item.productId,
              name: item.name,
              priceCents: item.priceCents,
            })),
          },
        },
        include: { items: true },
      });

      await tx.ownership.createMany({
        data: toBuy.map((item) => ({
          userId: user.id,
          productType: item.productType,
          productId: item.productId,
        })),
        skipDuplicates: true,
      });

      // Las partes compradas se acreditan al personaje del usuario si ya tiene uno.
      const character = await tx.character.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (character) {
        const partItems = toBuy.filter((item) => item.productType === "part");
        for (const item of partItems) {
          await tx.inventoryItem.upsert({
            where: { characterId_partId: { characterId: character.id, partId: item.productId } },
            update: {},
            create: { characterId: character.id, partId: item.productId },
          });
        }
      }

      return created;
    });

    return Response.json({
      orderId: order.id,
      totalCents: order.totalCents,
      status: order.status,
      items: order.items.map((item) => ({ name: item.name, priceCents: item.priceCents })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Datos inválidos", issues: error.issues }, { status: 400 });
    }

    console.error("[api/marketplace/checkout] failed", error);
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}
