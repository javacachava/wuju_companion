"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import { Loader2, Send, ShieldCheck, Volume2, X } from "lucide-react";
import type { CharacterProfile } from "@/lib/companion/types";
import type { CharacterState } from "./CharacterContext";
import { AuditReport, type AuditReportData } from "./AuditReport";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  character: CharacterProfile;
  codeGuardianEnabled: boolean;
  onCharacterStateChange: (state: CharacterState) => void;
};

function decodeDataStreamLine(line: string) {
  const separator = line.indexOf(":");
  if (separator === -1) {
    return null;
  }

  const type = line.slice(0, separator);
  const raw = line.slice(separator + 1);

  try {
    return { type, value: JSON.parse(raw) as unknown };
  } catch {
    return null;
  }
}

export function ChatPanel({
  character,
  codeGuardianEnabled,
  onCharacterStateChange,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditCode, setAuditCode] = useState("");
  const [auditLanguage, setAuditLanguage] = useState("javascript");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioCache = useRef(new Map<string, Blob>());

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        return;
      }

      const key = `${character.voiceId}:${text}`;
      setVoiceLoading(true);

      try {
        let audio = audioCache.current.get(key);
        if (!audio) {
          const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              voiceId: character.voiceId,
            }),
          });

          if (!response.ok) {
            throw new Error("tts_failed");
          }

          audio = await response.blob();
          audioCache.current.set(key, audio);
        }

        const url = URL.createObjectURL(audio);
        const player = new Audio(url);
        onCharacterStateChange("talking");
        player.onended = () => {
          URL.revokeObjectURL(url);
          onCharacterStateChange("idle");
        };
        player.onerror = () => {
          URL.revokeObjectURL(url);
          onCharacterStateChange("idle");
        };
        await player.play();
      } catch {
        onCharacterStateChange("idle");
      } finally {
        setVoiceLoading(false);
      }
    },
    [character.voiceId, onCharacterStateChange],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || chatLoading) {
      return;
    }

    setError(null);
    setInput("");
    setChatLoading(true);
    onCharacterStateChange("thinking");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    setMessages((current) => [...current, userMessage, assistantMessage]);

    let fullText = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          activeSkill: "chat-base",
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("chat_failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const part = decodeDataStreamLine(line);
          if (!part) {
            continue;
          }

          if (part.type === "0" && typeof part.value === "string") {
            fullText += part.value;
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessage.id ? { ...item, content: fullText } : item,
              ),
            );
          }

          if (part.type === "3" && typeof part.value === "string") {
            fullText = part.value;
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessage.id ? { ...item, content: fullText } : item,
              ),
            );
          }
        }
      }

      if (fullText) {
        await speak(fullText);
      } else {
        onCharacterStateChange("idle");
      }
    } catch {
      setError("No pude enviar el mensaje. Probá de nuevo.");
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? { ...item, content: "No pude responder ahora. Probemos de nuevo en un momento." }
            : item,
        ),
      );
      onCharacterStateChange("idle");
    } finally {
      setChatLoading(false);
    }
  };

  const handleAudit = async () => {
    const code = auditCode.trim();
    if (!code || auditLoading) {
      return;
    }

    setAuditLoading(true);
    setError(null);
    setAuditReport(null);
    onCharacterStateChange("thinking");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: auditLanguage,
        }),
      });

      const data = (await response.json()) as AuditReportData | { message?: string };
      if (!response.ok || !("findings" in data)) {
        throw new Error("message" in data ? data.message : "audit_failed");
      }

      setAuditReport(data);
      await speak(data.characterVoicedSummary);
    } catch {
      setError("No pude auditar ese código ahora. Probá de nuevo.");
      onCharacterStateChange("idle");
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Chat y Guardián
          </h2>
          <p className="text-xs text-slate-500">
            {voiceLoading ? "Reproduciendo voz..." : "Responde con texto y voz."}
          </p>
        </div>
        {codeGuardianEnabled ? (
          <button
            type="button"
            onClick={() => setAuditOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            <ShieldCheck className="h-4 w-4" />
            Auditar código
          </button>
        ) : null}
      </div>

      <div className="mt-4 max-h-72 min-h-40 space-y-3 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay mensajes. Decile hola al Compañero.
          </p>
        ) : (
          messages.slice(-20).map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {message.content || (chatLoading ? "Escribiendo..." : "")}
              </div>
            </div>
          ))
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribí un mensaje"
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
        />
        <button
          type="submit"
          disabled={chatLoading || !input.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="Enviar"
        >
          {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {messages.some((message) => message.role === "assistant" && message.content) ? (
        <button
          type="button"
          onClick={() => {
            const last = [...messages].reverse().find((message) => message.role === "assistant");
            if (last) void speak(last.content);
          }}
          className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-800"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Repetir voz
        </button>
      ) : null}

      {auditOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Auditar código"
          onClick={() => setAuditOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Guardián de código</h3>
              <button
                type="button"
                onClick={() => setAuditOpen(false)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
              <label className="text-sm font-medium text-slate-700">
                Lenguaje
                <select
                  value={auditLanguage}
                  onChange={(event) => setAuditLanguage(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="sql">SQL</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Código
                <textarea
                  value={auditCode}
                  onChange={(event) => setAuditCode(event.target.value)}
                  rows={10}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none ring-slate-300 transition focus:ring-2"
                  placeholder="Pegá acá el código que querés revisar"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => void handleAudit()}
              disabled={auditLoading || !auditCode.trim()}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {auditLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {auditLoading ? "Auditando..." : "Auditar"}
            </button>

            {auditReport ? (
              <div className="mt-4">
                <AuditReport report={auditReport} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
