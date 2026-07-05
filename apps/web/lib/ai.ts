import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";
import { z } from "zod";

import { env } from "@/lib/env";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Fase 5 de DESKTOP-MIGRATION-PLAN.md: capa multi-provider, agnóstica (sección 2.3).
// Sin `provider`, el comportamiento es EXACTAMENTE el de siempre (team key, OpenAI) —
// esto es aditivo, no rompe /api/chat ni /api/audit del MVP web actual.
export type LlmProviderConfig = { apiKey: string };

function detectProviderKind(apiKey: string): "anthropic" | "openai" {
  return apiKey.startsWith("sk-ant-") ? "anthropic" : "openai";
}

function resolveChatModel(provider?: LlmProviderConfig) {
  if (!provider) {
    return openai("gpt-4o-mini");
  }

  if (detectProviderKind(provider.apiKey) === "anthropic") {
    return createAnthropic({ apiKey: provider.apiKey })("claude-haiku-4-5-20251001");
  }

  return createOpenAI({ apiKey: provider.apiKey })("gpt-4o-mini");
}

function resolveAuditModel(provider?: LlmProviderConfig) {
  if (!provider) {
    return openai("gpt-4o-mini");
  }

  if (detectProviderKind(provider.apiKey) === "anthropic") {
    return createAnthropic({ apiKey: provider.apiKey })("claude-sonnet-5");
  }

  return createOpenAI({ apiKey: provider.apiKey })("gpt-4o-mini");
}

const personalityDescriptions: Record<string, string> = {
  amigable: "Calido, cercano, usa buen humor moderado.",
  directo: "Sin rodeos, va al punto, minimalista.",
  entusiasta: "Optimista, energetico, celebra los logros del usuario.",
  formal: "Correcto, respetuoso, sin bromas.",
};

export const AuditFindingSchema = z
  .object({
    severity: z.enum(["critical", "high", "medium", "low"]),
    title: z.string(),
    line: z.number().int().nullable(),
    description: z.string(),
    suggestion: z.string(),
    fixExample: z.string(),
  })
  .strict();

export const AuditReportSchema = z
  .object({
    findings: z.array(AuditFindingSchema),
    summary: z.string(),
    characterVoicedSummary: z.string(),
  })
  .strict();

export type AuditReport = z.infer<typeof AuditReportSchema>;

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatWithCompanionInput = {
  characterName: string;
  message: string;
  personality: string;
  lastMessages: ChatHistoryMessage[];
  onFinish?: (assistantMessage: string) => Promise<void>;
  /** BYO-key opcional (sección 2.3 del plan desktop). Sin esto, usa la key de equipo. */
  provider?: LlmProviderConfig;
};

type AuditCodeInput = {
  code: string;
  language: string;
  personality: string;
  provider?: LlmProviderConfig;
};

function describePersonality(personality: string) {
  return personalityDescriptions[personality] ?? personalityDescriptions.amigable;
}

function formatLastMessages(messages: ChatHistoryMessage[]) {
  if (messages.length === 0) {
    return "Sin historial previo.";
  }

  return messages
    .map((message) => `${message.role === "user" ? "Usuario" : "Companero"}: ${message.content}`)
    .join("\n");
}

function buildChatSystemPrompt(
  characterName: string,
  personality: string,
  lastMessages: ChatHistoryMessage[],
) {
  return `Sos "El Companero", un asistente personal libre y de codigo abierto.
El usuario te llama por el nombre que le dio a tu personaje: ${characterName}.
Tu personalidad activa es: ${personality} (${describePersonality(personality)}).

Tu tono es calido pero directo. Hablas en espanol latinoamericano neutro (usas "vos" pero evitas modismos muy locales). Nunca sos vendedor ni corporativo.

Reglas de comportamiento:
- Sos honesto. Si no sabes algo, lo decis. No inventas.
- Sos breve por default. Respondes en 1-3 oraciones salvo que el usuario pida detalle.
- Tratas al usuario con respeto pero sin formalidad excesiva. No decis "estimado usuario".
- No haces preguntas de mas. Si el usuario dice "hola", respondes "hola" y esperas.
- Si el usuario te muestra codigo y no tenes activado el skill "code-guardian", no haces audit. Si te preguntan por seguridad, sugeri activar el Guardian de codigo.
- Nunca hablas de "IA", "modelo de lenguaje" o "sistema". Sos el Companero.
- No pedis disculpas excesivas. Si te equivocas, lo reconoces en una linea y seguis.

Contexto del usuario:
${formatLastMessages(lastMessages)}`;
}

function buildAuditSystemPrompt(personality: string) {
  return `Sos un pentester senior con anos de experiencia en OWASP Top 10 y analisis estatico de codigo.
Un usuario del Companero te muestra un fragmento de codigo y te pide auditarlo.

Tu objetivo: encontrar vulnerabilidades reales, no problemas de estilo.

Busca especificamente:
- Inyecciones (SQL, NoSQL, XSS, LDAP, Command Injection)
- Secretos hardcodeados (API keys, passwords, tokens, connection strings)
- Configuracion insegura (CORS abierto con "*", headers de seguridad faltantes, cookies sin HttpOnly/Secure/SameSite)
- Crypto obsoleto o mal usado (MD5/SHA1 para passwords, DES, RC4, IVs reutilizados)
- Validaciones faltantes (input sin sanitizar, output sin escapar, parametros sin verificar)
- Manejo debil de sesiones y autenticacion (JWT sin verificar firma, sesiones sin expiracion)
- Uso inseguro de deserializacion, XXE, path traversal
- Race conditions obvias en operaciones criticas
- Uso de dependencias con CVEs conocidas si mencionan versiones

Reglas del reporte:
- Severidad honesta. Un console.log() no es "critical".
- Ubicacion exacta: numero de linea si es posible, null si no aplica.
- Descripcion breve: que es el problema, en 1-2 oraciones.
- Sugerencia concreta: que codigo usar en lugar del actual, con ejemplo funcional.
- Nunca modifiques el codigo del usuario en tu respuesta. Solo senalas y sugeris.
- Si el codigo no tiene vulnerabilidades reales, devolves findings=[] y summary lo dice.
- No agregues campos que no esten en el schema.

Sobre characterVoicedSummary:
- Debe ser corto: 1-2 oraciones, maximo 30 palabras.
- Debe sonar natural con personalidad "${personality}" (${describePersonality(personality)}).
- Si hay un critical, empeza con "Uy!", "Ey!" u "Ojo!".
- No repitas toda la lista de findings. Es un titular hablado para abrir el reporte visual.`;
}

export function chatWithCompanion({
  characterName,
  message,
  personality,
  lastMessages,
  onFinish,
  provider,
}: ChatWithCompanionInput) {
  return streamText({
    model: resolveChatModel(provider),
    maxTokens: 300,
    system: buildChatSystemPrompt(characterName, personality, lastMessages),
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    onFinish: async ({ text }) => {
      await onFinish?.(text);
    },
  });
}

export async function auditCode({
  code,
  language,
  personality,
  provider,
}: AuditCodeInput): Promise<AuditReport> {
  const result = await generateObject({
    model: resolveAuditModel(provider),
    maxTokens: 1500,
    schema: AuditReportSchema,
    system: buildAuditSystemPrompt(personality),
    prompt: `Lenguaje: ${language}

Codigo a auditar:
\`\`\`${language}
${code}
\`\`\``,
  });

  return result.object;
}
