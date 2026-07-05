import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

const categories = ["hair", "eyes", "mouth", "accessory", "clothing"] as const;
const CategorySchema = z.enum(categories);

type Category = (typeof categories)[number];

const slotFieldByCategory: Record<
  Category,
  "hairId" | "eyesId" | "mouthId" | "accessoryId" | "clothingId"
> = {
  hair: "hairId",
  eyes: "eyesId",
  mouth: "mouthId",
  accessory: "accessoryId",
  clothing: "clothingId",
};

const defaultPartNames: Record<Category, string> = {
  hair: "Corto",
  eyes: "Grandes",
  mouth: "Sonrisa",
  accessory: "Ninguno",
  clothing: "Remera",
};

const PatchCharacterSchema = z
  .object({
    characterId: z.string().min(1),
    category: CategorySchema,
    partId: z.string().min(1),
  })
  .strict();

async function serializeCharacter(characterId: string) {
  const character = await db.character.findUniqueOrThrow({
    where: { id: characterId },
  });

  const slotIds = categories
    .map((category) => character[slotFieldByCategory[category]])
    .filter((partId): partId is string => Boolean(partId));

  const parts = await db.part.findMany({
    where: {
      id: { in: slotIds },
    },
  });

  const partsById = new Map(parts.map((part) => [part.id, part]));

  return {
    id: character.id,
    userName: character.userName,
    personality: character.personality,
    voiceId: character.voiceId,
    parts: Object.fromEntries(
      categories.map((category) => {
        const partId = character[slotFieldByCategory[category]];
        const part = partId ? partsById.get(partId) : null;

        return [
          category,
          part
            ? {
                id: part.id,
                imageUrl: part.imageUrl,
              }
            : null,
        ];
      }),
    ),
  };
}

async function getDefaultParts() {
  const parts = await Promise.all(
    categories.map((category) =>
      db.part.findFirstOrThrow({
        where: {
          category,
          name: defaultPartNames[category],
          isPremium: false,
        },
      }),
    ),
  );

  return Object.fromEntries(parts.map((part) => [part.category, part])) as Record<
    Category,
    (typeof parts)[number]
  >;
}

async function createCharacter(userName: string, userId: string | null) {
  const defaults = await getDefaultParts();
  const freeParts = await db.part.findMany({
    where: { isPremium: false },
  });

  return db.$transaction(async (tx) => {
    const character = await tx.character.create({
      data: {
        userName,
        userId,
        hairId: defaults.hair.id,
        eyesId: defaults.eyes.id,
        mouthId: defaults.mouth.id,
        accessoryId: defaults.accessory.id,
        clothingId: defaults.clothing.id,
        skills: {
          create: {
            skillKey: "chat-base",
          },
        },
      },
    });

    // Un solo round-trip en vez de N secuenciales — con latencia real de red
    // (pooler de Supabase) el loop de creates uno-por-uno superaba el timeout
    // por default de la transacción interactiva de Prisma (5s).
    await tx.inventoryItem.createMany({
      data: freeParts.map((part) => ({
        characterId: character.id,
        partId: part.id,
      })),
    });

    return character;
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userName = z.string().trim().min(1).parse(url.searchParams.get("userName"));

    const [character, sessionUser] = await Promise.all([
      db.character.findUnique({ where: { userName } }),
      getSessionUser(),
    ]);

    let resolvedCharacter = character;
    if (!resolvedCharacter) {
      resolvedCharacter = await createCharacter(userName, sessionUser?.id ?? null);
    } else if (!resolvedCharacter.userId && sessionUser) {
      // Personaje huérfano (creado antes de loguearse): se adopta a la cuenta.
      await db.character.update({
        where: { id: resolvedCharacter.id },
        data: { userId: sessionUser.id },
      });
    }

    return Response.json(await serializeCharacter(resolvedCharacter.id));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/character] GET failed", error);
    return Response.json({ error: "Character request failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = PatchCharacterSchema.parse(await request.json());

    const [character, inventoryItem] = await Promise.all([
      db.character.findUnique({
        where: { id: body.characterId },
        select: { id: true },
      }),
      db.inventoryItem.findFirst({
        where: {
          characterId: body.characterId,
          partId: body.partId,
        },
        include: { part: true },
      }),
    ]);

    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    if (!inventoryItem) {
      return Response.json({ error: "Part is not in character inventory" }, { status: 403 });
    }

    if (inventoryItem.part.category !== body.category) {
      return Response.json(
        { error: "Part category does not match requested slot" },
        { status: 400 },
      );
    }

    await db.character.update({
      where: { id: body.characterId },
      data: {
        [slotFieldByCategory[body.category]]: body.partId,
      },
    });

    return Response.json(await serializeCharacter(body.characterId));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/character] PATCH failed", error);
    return Response.json({ error: "Character update failed" }, { status: 500 });
  }
}
