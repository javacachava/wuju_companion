import { env } from "@/lib/env";

type AuditCriticalPayload = {
  characterId: string;
  criticalCount: number;
  summary: string;
};

type ConversationLogPayload = {
  characterId: string;
  userMessage: string;
  assistantMessage: string;
  skillUsed: string;
};

function getWebhookConfig() {
  if (!env.N8N_WEBHOOK_URL || !env.N8N_WEBHOOK_SECRET) {
    return null;
  }

  return {
    baseUrl: env.N8N_WEBHOOK_URL.replace(/\/$/, ""),
    secret: env.N8N_WEBHOOK_SECRET,
  };
}

async function postWebhook(path: string, payload: Record<string, unknown>) {
  const config = getWebhookConfig();

  if (!config) {
    return;
  }

  try {
    const response = await fetch(`${config.baseUrl}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Companero-Secret": config.secret,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[n8n] ${path} respondio ${response.status}`);
    }
  } catch (error) {
    console.error(`[n8n] ${path} failed`, error);
  }
}

export async function triggerAuditCritical(payload: AuditCriticalPayload) {
  await postWebhook("audit-critical", {
    event: "audit-critical",
    ...payload,
  });
}

export async function triggerConversationLog(payload: ConversationLogPayload) {
  await postWebhook("conversation-log", {
    ...payload,
    timestamp: new Date().toISOString(),
  });
}
