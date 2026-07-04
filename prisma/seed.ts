import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const parts = [
  {
    category: "hair",
    name: "Corto",
    imageUrl: "/parts/hair-corto.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "hair",
    name: "Largo",
    imageUrl: "/parts/hair-largo.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "hair",
    name: "Rizado",
    imageUrl: "/parts/hair-rizado.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "eyes",
    name: "Grandes",
    imageUrl: "/parts/eyes-grandes.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "eyes",
    name: "Chicos",
    imageUrl: "/parts/eyes-chicos.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "eyes",
    name: "Cerrados",
    imageUrl: "/parts/eyes-cerrados.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "mouth",
    name: "Sonrisa",
    imageUrl: "/parts/mouth-sonrisa.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "mouth",
    name: "Seria",
    imageUrl: "/parts/mouth-seria.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "mouth",
    name: "Riendo",
    imageUrl: "/parts/mouth-riendo.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "accessory",
    name: "Ninguno",
    imageUrl: "/parts/accessory-ninguno.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "accessory",
    name: "Sombrero",
    imageUrl: "/parts/accessory-sombrero.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "accessory",
    name: "Corbata",
    imageUrl: "/parts/accessory-corbata.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "clothing",
    name: "Remera",
    imageUrl: "/parts/clothing-remera.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "clothing",
    name: "Camisa",
    imageUrl: "/parts/clothing-camisa.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "clothing",
    name: "Sweater",
    imageUrl: "/parts/clothing-sweater.png",
    isPremium: false,
    price: 0,
  },
  {
    category: "hair",
    name: "Gorro",
    imageUrl: "/parts/hair-gorro.png",
    isPremium: true,
    price: 200,
  },
  {
    category: "hair",
    name: "Colita",
    imageUrl: "/parts/hair-colita.png",
    isPremium: true,
    price: 300,
  },
  {
    category: "eyes",
    name: "Guino",
    imageUrl: "/parts/eyes-guino.png",
    isPremium: true,
    price: 250,
  },
  {
    category: "eyes",
    name: "Lentes",
    imageUrl: "/parts/eyes-lentes.png",
    isPremium: true,
    price: 400,
  },
  {
    category: "mouth",
    name: "Sorprendida",
    imageUrl: "/parts/mouth-sorprendida.png",
    isPremium: true,
    price: 200,
  },
  {
    category: "mouth",
    name: "Picara",
    imageUrl: "/parts/mouth-picara.png",
    isPremium: true,
    price: 350,
  },
  {
    category: "accessory",
    name: "Audifonos",
    imageUrl: "/parts/accessory-audifonos.png",
    isPremium: true,
    price: 400,
  },
  {
    category: "accessory",
    name: "Bufanda",
    imageUrl: "/parts/accessory-bufanda.png",
    isPremium: true,
    price: 300,
  },
  {
    category: "clothing",
    name: "Hoodie",
    imageUrl: "/parts/clothing-hoodie.png",
    isPremium: true,
    price: 500,
  },
  {
    category: "clothing",
    name: "Formal",
    imageUrl: "/parts/clothing-formal.png",
    isPremium: true,
    price: 450,
  },
] as const;

const defaultParts = {
  hair: "Corto",
  eyes: "Grandes",
  mouth: "Sonrisa",
  accessory: "Ninguno",
  clothing: "Remera",
} as const;

async function upsertPart(part: (typeof parts)[number]) {
  const existing = await prisma.part.findFirst({
    where: {
      category: part.category,
      name: part.name,
    },
  });

  if (existing) {
    return prisma.part.update({
      where: { id: existing.id },
      data: part,
    });
  }

  return prisma.part.create({
    data: part,
  });
}

async function findDefaultPart(category: keyof typeof defaultParts) {
  const part = await prisma.part.findFirstOrThrow({
    where: {
      category,
      name: defaultParts[category],
    },
  });

  return part;
}

async function main() {
  for (const part of parts) {
    await upsertPart(part);
  }

  const freeParts = await prisma.part.findMany({
    where: { isPremium: false },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const [hair, eyes, mouth, accessory, clothing] = await Promise.all([
    findDefaultPart("hair"),
    findDefaultPart("eyes"),
    findDefaultPart("mouth"),
    findDefaultPart("accessory"),
    findDefaultPart("clothing"),
  ]);

  const demo = await prisma.character.upsert({
    where: { userName: "demo" },
    update: {
      hairId: hair.id,
      eyesId: eyes.id,
      mouthId: mouth.id,
      accessoryId: accessory.id,
      clothingId: clothing.id,
      personality: "amigable",
      voiceId: "21m00Tcm4TlvDq8ikWAM",
    },
    create: {
      userName: "demo",
      hairId: hair.id,
      eyesId: eyes.id,
      mouthId: mouth.id,
      accessoryId: accessory.id,
      clothingId: clothing.id,
      personality: "amigable",
      voiceId: "21m00Tcm4TlvDq8ikWAM",
    },
  });

  for (const part of freeParts) {
    await prisma.inventoryItem.upsert({
      where: {
        characterId_partId: {
          characterId: demo.id,
          partId: part.id,
        },
      },
      update: {},
      create: {
        characterId: demo.id,
        partId: part.id,
      },
    });
  }

  await prisma.activeSkill.upsert({
    where: {
      characterId_skillKey: {
        characterId: demo.id,
        skillKey: "chat-base",
      },
    },
    update: {},
    create: {
      characterId: demo.id,
      skillKey: "chat-base",
    },
  });

  const messageCount = await prisma.message.count({
    where: { characterId: demo.id },
  });

  if (messageCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          characterId: demo.id,
          role: "user",
          content: "Hola, que podes hacer?",
          skillUsed: "chat-base",
        },
        {
          characterId: demo.id,
          role: "assistant",
          content:
            "Hola! Soy tu Companero. Puedo charlar con vos, revisar codigo con el Guardian de codigo, y crecer con mas packs de habilidades.",
          skillUsed: "chat-base",
        },
      ],
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
