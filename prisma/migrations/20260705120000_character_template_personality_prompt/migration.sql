-- AlterTable
-- Fase 7.1 de DESKTOP-MIGRATION-PLAN.md: personalidad como producto de marketplace.
-- Nullable a propósito: los 6 personajes preset existentes no necesitan este campo,
-- siguen usando el mapa fijo de `personality`. Solo personajes nuevos creados vía
-- portal de creadores (post-curaduría) lo llenan.
ALTER TABLE "CharacterTemplate" ADD COLUMN "personalityPrompt" TEXT;
