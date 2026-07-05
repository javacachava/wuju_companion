import { formatDataStreamPart } from "ai";

import { describeAiError } from "@/lib/ai-errors";

type StreamTextResult = {
  toDataStream: (options: { getErrorMessage: () => string }) => ReadableStream<Uint8Array>;
};

/**
 * Envuelve el data stream de `streamText` para que un error a mitad de stream
 * (ej: la API del proveedor se cae) se traduzca a un mensaje legible en vez de
 * cortar la conexión sin explicación — regla 7 de AGENTS.md.
 */
export function toSafeDataStreamResponse(
  result: StreamTextResult,
  errorMessage: string,
  logPrefix: string,
) {
  const dataStream = result.toDataStream({
    getErrorMessage: () => errorMessage,
  });

  const safeStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = dataStream.getReader();
      const encoder = new TextEncoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          controller.enqueue(value);
        }
      } catch (error) {
        console.error(`[${logPrefix}] stream failed:`, describeAiError(error));
        controller.enqueue(encoder.encode(formatDataStreamPart("error", errorMessage)));
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(safeStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
