// Fase 7 de DESKTOP-MIGRATION-PLAN.md: Skill Registry.
//
// Agregar un pack nuevo (marketing, diseño, negocio) es agregar una entrada acá,
// no tocar arquitectura. Esta ruta (/api/skill/[skillKey]) es ADITIVA — convive
// con /api/chat y /api/audit, que se dejan intactos para no romper el frontend
// actual (ChatPanel.tsx los sigue usando directo). Migrar esos callers a esta
// ruta única es un paso de seguimiento, no parte de este pase.

import type { LlmProviderConfig } from "@/lib/ai";
import { auditCode, AuditReportSchema, chatWithCompanion } from "@/lib/ai";

export type SkillKey = "chat-base" | "code-guardian";

export function isSkillKey(value: string): value is SkillKey {
  return value === "chat-base" || value === "code-guardian";
}

export type SkillRunInput = {
  characterName: string;
  personality: string;
  message?: string;
  history?: { role: "user" | "assistant"; content: string }[];
  code?: string;
  language?: string;
  provider?: LlmProviderConfig;
  onFinish?: (assistantMessage: string) => Promise<void>;
};

export type SkillDefinition =
  | {
      key: "chat-base";
      kind: "stream";
      needsHistory: true;
      needsCode: false;
      run: (input: SkillRunInput) => ReturnType<typeof chatWithCompanion>;
    }
  | {
      key: "code-guardian";
      kind: "object";
      needsHistory: false;
      needsCode: true;
      outputSchema: typeof AuditReportSchema;
      run: (input: SkillRunInput) => ReturnType<typeof auditCode>;
    };

export const SKILL_REGISTRY: Record<SkillKey, SkillDefinition> = {
  "chat-base": {
    key: "chat-base",
    kind: "stream",
    needsHistory: true,
    needsCode: false,
    run: (input) =>
      chatWithCompanion({
        characterName: input.characterName,
        message: input.message ?? "",
        personality: input.personality,
        lastMessages: input.history ?? [],
        onFinish: input.onFinish,
        provider: input.provider,
      }),
  },
  "code-guardian": {
    key: "code-guardian",
    kind: "object",
    needsHistory: false,
    needsCode: true,
    outputSchema: AuditReportSchema,
    run: (input) =>
      auditCode({
        code: input.code ?? "",
        language: input.language ?? "text",
        personality: input.personality,
        provider: input.provider,
      }),
  },
};
