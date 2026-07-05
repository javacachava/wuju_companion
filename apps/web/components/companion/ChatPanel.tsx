"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Github, Loader2, Mic, ScanText, Send, ShieldCheck, Square, Volume2, X } from "lucide-react";
import type { CharacterProfile } from "@/lib/companion/types";
import { captureScreenContext, formatContextForPrompt, type ScreenContext } from "@/lib/context-builder";
import { isPermissionEnabled } from "@/lib/permissions";
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
  // "full" = vista chat principal (más alto, tipo ChatGPT). Default = panel compacto.
  variant?: "full" | "compact";
};

type TauriGlobal = {
  core?: {
    invoke: <Result>(command: string, args?: Record<string, unknown>) => Promise<Result>;
  };
  fs?: {
    readFile: (path: string) => Promise<Uint8Array | number[] | ArrayBuffer>;
    remove: (path: string) => Promise<void>;
  };
};

declare global {
  interface Window {
    __TAURI__?: TauriGlobal;
  }
}

const START_RECORDING_COMMAND = "plugin:mic-recorder|start_recording";
const STOP_RECORDING_COMMAND = "plugin:mic-recorder|stop_recording";
const READ_FILE_COMMAND = "plugin:fs|read_file";
const REMOVE_FILE_COMMAND = "plugin:fs|remove";

// Salvavidas: sin esto, el usuario podría dejar el mic grabando indefinidamente
// y generar un WAV que supera el límite de 25MB que acepta /api/voice-spike/transcribe.
const MAX_RECORDING_MS = 60_000;

function toUint8Array(value: Uint8Array | number[] | ArrayBuffer) {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  return new Uint8Array(value);
}

async function readTauriFile(tauri: TauriGlobal, path: string) {
  if (tauri.fs?.readFile) {
    return toUint8Array(await tauri.fs.readFile(path));
  }

  if (!tauri.core?.invoke) {
    throw new Error("tauri_fs_unavailable");
  }

  return toUint8Array(
    await tauri.core.invoke<Uint8Array | number[] | ArrayBuffer>(READ_FILE_COMMAND, { path }),
  );
}

async function removeTauriFile(tauri: TauriGlobal, path: string) {
  try {
    if (tauri.fs?.remove) {
      await tauri.fs.remove(path);
      return;
    }

    await tauri.core?.invoke(REMOVE_FILE_COMMAND, { path });
  } catch (cleanupError) {
    // No bloqueamos el flujo de chat por un WAV temporal que no se pudo borrar.
    console.error("[voice-spike] no pude borrar el audio temporal:", cleanupError);
  }
}

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
  variant = "compact",
}: ChatPanelProps) {
  const messagesHeightClass =
    variant === "full" ? "min-h-[52vh] max-h-[62vh]" : "max-h-72 min-h-40";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditCode, setAuditCode] = useState("");
  const [auditLanguage, setAuditLanguage] = useState("javascript");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReportData | null>(null);
  const [repoAuditOpen, setRepoAuditOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [voiceSpikeAvailable, setVoiceSpikeAvailable] = useState(false);
  const [voiceSpikeRecording, setVoiceSpikeRecording] = useState(false);
  const [voiceSpikeTranscribing, setVoiceSpikeTranscribing] = useState(false);
  const [screenContextCapturing, setScreenContextCapturing] = useState(false);
  const [screenContextReady, setScreenContextReady] = useState<ScreenContext["source"] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const audioCache = useRef(new Map<string, Blob>());
  const formRef = useRef<HTMLFormElement>(null);
  const pendingVoiceSubmit = useRef<string | null>(null);
  const pendingScreenContext = useRef<ScreenContext | null>(null);
  const maxRecordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVoiceSpikeAvailable(Boolean(window.__TAURI__?.core?.invoke));
  }, []);

  const handleCaptureScreenContext = async () => {
    const tauri = window.__TAURI__;
    if (!tauri?.core?.invoke || screenContextCapturing) {
      return;
    }

    if (!isPermissionEnabled("clipboard") && !isPermissionEnabled("screen")) {
      setError("Portapapeles y pantalla están desactivados en Permisos.");
      return;
    }

    setError(null);
    setScreenContextCapturing(true);
    setScreenContextReady(null);

    try {
      const context = await captureScreenContext(
        { invoke: (command, args) => tauri.core!.invoke(command, args) },
        {
          clipboardAllowed: isPermissionEnabled("clipboard"),
          screenAllowed: isPermissionEnabled("screen"),
        },
      );

      if (!context) {
        setError("No encontré nada copiado ni texto legible en pantalla.");
        pendingScreenContext.current = null;
        return;
      }

      pendingScreenContext.current = context;
      setScreenContextReady(context.source);
    } catch {
      setError("No pude capturar el contexto de pantalla.");
      pendingScreenContext.current = null;
    } finally {
      setScreenContextCapturing(false);
    }
  };

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
    const displayMessage = (pendingVoiceSubmit.current ?? input).trim();
    pendingVoiceSubmit.current = null;

    if (!displayMessage || chatLoading) {
      return;
    }

    // Si hay contexto de pantalla/portapapeles capturado (Fase 4), va SOLO al
    // servidor — el usuario en pantalla sigue viendo únicamente lo que escribió.
    const screenContext = pendingScreenContext.current;
    pendingScreenContext.current = null;
    setScreenContextReady(null);
    const apiMessage = screenContext
      ? formatContextForPrompt(screenContext, displayMessage)
      : displayMessage;

    setError(null);
    setInput("");
    setChatLoading(true);
    onCharacterStateChange("thinking");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: displayMessage,
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
          characterId: character.id,
          message: apiMessage,
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

  const injectVoiceTextAndSubmit = (text: string) => {
    const message = text.trim();
    if (!message) {
      setError("No pude reconocer texto en el audio.");
      return;
    }

    pendingVoiceSubmit.current = message;
    setInput(message);
    window.setTimeout(() => formRef.current?.requestSubmit(), 0);
  };

  const clearMaxRecordingTimer = useCallback(() => {
    if (maxRecordingTimer.current !== null) {
      clearTimeout(maxRecordingTimer.current);
      maxRecordingTimer.current = null;
    }
  }, []);

  const stopVoiceSpikeAndTranscribe = useCallback(async () => {
    const tauri = window.__TAURI__;
    clearMaxRecordingTimer();

    if (!tauri?.core?.invoke) {
      return;
    }

    setVoiceSpikeRecording(false);
    setVoiceSpikeTranscribing(true);
    onCharacterStateChange("thinking");

    let recordingPath: string | null = null;

    try {
      recordingPath = await tauri.core.invoke<string>(STOP_RECORDING_COMMAND);
    } catch {
      setError("No pude detener la grabación.");
      onCharacterStateChange("idle");
      setVoiceSpikeTranscribing(false);
      return;
    }

    try {
      const audioBuffer = await readTauriFile(tauri, recordingPath);

      const formData = new FormData();
      formData.append("file", new File([audioBuffer], "voice-spike.wav", { type: "audio/wav" }));
      formData.append("language", "es");

      const response = await fetch("/api/voice-spike/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as { text?: string } | null;

      if (!response.ok || typeof data?.text !== "string") {
        setError(
          response.status === 504
            ? "La transcripción tardó demasiado. Probá de nuevo."
            : "No pude transcribir el audio. Probá de nuevo.",
        );
        onCharacterStateChange("idle");
        return;
      }

      injectVoiceTextAndSubmit(data.text);
    } catch {
      setError("No pude leer el audio grabado.");
      onCharacterStateChange("idle");
    } finally {
      setVoiceSpikeTranscribing(false);
      void removeTauriFile(tauri, recordingPath);
    }
  }, [clearMaxRecordingTimer, onCharacterStateChange]);

  const handleVoiceSpike = async () => {
    const tauri = window.__TAURI__;
    if (!tauri?.core?.invoke || voiceSpikeTranscribing || chatLoading) {
      return;
    }

    setError(null);

    if (voiceSpikeRecording) {
      await stopVoiceSpikeAndTranscribe();
      return;
    }

    if (!isPermissionEnabled("mic")) {
      setError("El micrófono está desactivado en Permisos.");
      return;
    }

    try {
      await tauri.core.invoke<unknown>(START_RECORDING_COMMAND);
      setVoiceSpikeRecording(true);
      onCharacterStateChange("thinking");
      clearMaxRecordingTimer();
      maxRecordingTimer.current = setTimeout(() => {
        void stopVoiceSpikeAndTranscribe();
      }, MAX_RECORDING_MS);
    } catch {
      setError("No pude iniciar el micrófono.");
      onCharacterStateChange("idle");
    }
  };

  useEffect(() => clearMaxRecordingTimer, [clearMaxRecordingTimer]);

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
          characterId: character.id,
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

  // Modo Byte Warden: audita un repo público de GitHub.
  const handleAuditRepo = async () => {
    const url = repoUrl.trim();
    if (!url || auditLoading) {
      return;
    }

    setAuditLoading(true);
    setError(null);
    setAuditReport(null);
    onCharacterStateChange("thinking");

    try {
      const response = await fetch("/api/audit-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: character.id, repoUrl: url }),
      });

      const data = (await response.json()) as AuditReportData | { error?: string; message?: string };
      if (!response.ok || !("findings" in data)) {
        const code = "error" in data ? data.error : undefined;
        setError(
          code === "repo_not_found"
            ? "No encontré ese repo (¿es público?)."
            : code === "no_code_files"
              ? "No hay archivos de código para auditar en ese repo."
              : "No pude auditar ese repo ahora. Probá de nuevo.",
        );
        onCharacterStateChange("idle");
        return;
      }

      setAuditReport(data);
      await speak(data.characterVoicedSummary);
    } catch {
      setError("No pude leer ese repo ahora. Probá de nuevo.");
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
            {voiceSpikeRecording
              ? "Grabando voz..."
              : voiceSpikeTranscribing
                ? "Transcribiendo voz..."
                : screenContextCapturing
                  ? "Mirando portapapeles/pantalla..."
                  : screenContextReady === "clipboard"
                    ? "Listo: uso lo que tenés copiado en tu próximo mensaje."
                    : screenContextReady === "ocr"
                      ? "Listo: uso lo que leí en pantalla en tu próximo mensaje."
                      : voiceLoading
                        ? "Reproduciendo voz..."
                        : "Responde con texto y voz."}
          </p>
        </div>
        {codeGuardianEnabled ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAuditOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              <ShieldCheck className="h-4 w-4" />
              Auditar código
            </button>
            <button
              type="button"
              onClick={() => setRepoAuditOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-[#06162b] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0b2342]"
            >
              <Github className="h-4 w-4" />
              Auditar repo
            </button>
          </div>
        ) : null}
      </div>

      <div className={`mt-4 ${messagesHeightClass} space-y-3 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3`}>
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

      <form ref={formRef} onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribí un mensaje"
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
        />
        {voiceSpikeAvailable ? (
          <button
            type="button"
            onClick={() => handleCaptureScreenContext()}
            disabled={chatLoading || screenContextCapturing}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 ${
              screenContextReady ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-300 bg-white"
            }`}
            aria-label="Usar lo copiado o la pantalla como contexto"
            title="Usar lo copiado o la pantalla como contexto"
          >
            {screenContextCapturing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanText className="h-4 w-4" />
            )}
          </button>
        ) : null}
        {voiceSpikeAvailable ? (
          <button
            type="button"
            onClick={() => void handleVoiceSpike()}
            disabled={chatLoading || voiceSpikeTranscribing}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
            aria-label={voiceSpikeRecording ? "Detener grabación" : "Grabar voz"}
            title={voiceSpikeRecording ? "Detener grabación" : "Grabar voz"}
          >
            {voiceSpikeTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : voiceSpikeRecording ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={chatLoading || !input.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="Enviar"
        >
          {chatLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
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

      {repoAuditOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Auditar repositorio"
          onClick={() => setRepoAuditOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Github className="h-5 w-5" />
                  Modo Byte Warden
                </h3>
                <p className="text-xs text-slate-500">
                  Pegá un repo público de GitHub y busco vulnerabilidades en su código.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRepoAuditOpen(false)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <input
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://github.com/usuario/repo"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleAuditRepo()}
              disabled={auditLoading || !repoUrl.trim()}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#06162b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2342] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {auditLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {auditLoading ? "Leyendo el repo..." : "Auditar repo"}
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
