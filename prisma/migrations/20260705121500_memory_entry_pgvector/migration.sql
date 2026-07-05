-- Fase 8 de DESKTOP-MIGRATION-PLAN.md: memoria semántica.
-- Requiere que la extensión pgvector esté disponible en la instancia de Postgres.
-- En Supabase ya viene habilitable desde el dashboard (Database > Extensions > vector)
-- o corriendo este CREATE EXTENSION si el rol de conexión tiene permiso.

CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "MemoryEntry" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemoryEntry_characterId_idx" ON "MemoryEntry"("characterId");

-- AddForeignKey
ALTER TABLE "MemoryEntry" ADD CONSTRAINT "MemoryEntry_characterId_fkey"
    FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
