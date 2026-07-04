// TODO Dev E: implementar seed completo según docs/SEED.md y docs/CONTRATOS.md
//
// - 15 partes gratis (isPremium: false) + 10 partes premium (isPremium: true)
// - Character "demo" con partes puestas por default e inventario completo de partes gratis
// - ActiveSkill "chat-base" para el Character "demo"
// - Usar prisma.part.upsert / createMany con skipDuplicates y prisma.$transaction
//   para que el seed sea idempotente

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // TODO Dev E: implementar
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
