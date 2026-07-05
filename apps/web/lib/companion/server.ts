import type { Part, Prisma } from "@prisma/client";

import { db } from "@/lib/db";

const categories = ["hair", "eyes", "mouth", "accessory", "clothing"] as const;

type Category = (typeof categories)[number];
type SerializedPart = { id: string; imageUrl: string };

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

function normalizeUserNameSeed(email: string): string {
  const seed = email.split("@")[0] ?? "usuario";
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 20);
  return normalized.length > 0 ? normalized : "usuario";
}

async function generateUniqueUserName(
  tx: Prisma.TransactionClient,
  email: string,
): Promise<string> {
  const base = normalizeUserNameSeed(email);
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? base : `${base}-${suffix}`;
    const existing = await tx.character.findUnique({
      where: { userName: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    suffix += 1;
  }
}

async function getDefaultParts(tx: Prisma.TransactionClient) {
  const parts: Part[] = await Promise.all(
    categories.map((category) =>
      tx.part.findFirstOrThrow({
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

export async function ensureCharacterForUser(userId: string, email: string) {
  const existing = await db.character.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) return existing.id;

  const character = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const defaults = await getDefaultParts(tx);
    const freeParts = await tx.part.findMany({
      where: { isPremium: false },
    });
    const userName = await generateUniqueUserName(tx, email);

    const created = await tx.character.create({
      data: {
        userId,
        userName,
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

    for (const part of freeParts) {
      await tx.inventoryItem.create({
        data: {
          characterId: created.id,
          partId: part.id,
        },
      });
    }

    return created;
  });

  return character.id;
}

export async function serializeCharacter(characterId: string) {
  const character = await db.character.findUniqueOrThrow({
    where: { id: characterId },
  });

  const slotIds = categories
    .map((category) => character[slotFieldByCategory[category]])
    .filter((partId): partId is string => Boolean(partId));

  const parts: Part[] = await db.part.findMany({
    where: { id: { in: slotIds } },
  });

  const partsById = new Map<string, Part>(parts.map((part) => [part.id, part]));
  const serializedParts: Record<Category, SerializedPart | null> = Object.fromEntries(
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
  ) as Record<Category, SerializedPart | null>;

  return {
    id: character.id,
    userName: character.userName,
    personality: character.personality,
    voiceId: character.voiceId,
    parts: serializedParts,
  };
}
