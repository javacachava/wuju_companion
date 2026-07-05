import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY es requerida"),
  ELEVENLABS_API_KEY: z.string().min(1, "ELEVENLABS_API_KEY es requerida"),
  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  FAL_API_KEY: z.string().optional(),
  DATAMCP_MCP_URL: z.string().optional(),
  DATAMCP_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().min(1, "NEXT_PUBLIC_APP_URL es requerida"),
});

const parsedServer = serverSchema.safeParse(process.env);
if (!parsedServer.success) {
  throw new Error(
    `Variables de entorno server inválidas:\n${parsedServer.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")}`,
  );
}

const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
if (!parsedClient.success) {
  throw new Error(
    `Variables de entorno client inválidas:\n${parsedClient.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")}`,
  );
}

export const env = {
  ...parsedServer.data,
  ...parsedClient.data,
};
