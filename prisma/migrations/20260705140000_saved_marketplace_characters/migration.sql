-- CreateTable
-- Adaptado de main (feat/dev-c-landing-rebrand): personajes de marketplace
-- guardados al perfil. Se liga a "Character" (auth vieja), no a "User" 1:1.
CREATE TABLE "SavedMarketplaceCharacter" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "marketplaceCharacterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "tagTone" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedMarketplaceCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedMarketplaceCharacter_characterId_idx" ON "SavedMarketplaceCharacter"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedMarketplaceCharacter_characterId_marketplaceCharacterId_key" ON "SavedMarketplaceCharacter"("characterId", "marketplaceCharacterId");

-- AddForeignKey
ALTER TABLE "SavedMarketplaceCharacter" ADD CONSTRAINT "SavedMarketplaceCharacter_characterId_fkey"
    FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
