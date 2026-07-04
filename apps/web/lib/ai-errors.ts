const AI_UNAVAILABLE_CLIENT_MESSAGE =
  "El proveedor de IA no esta disponible ahora. Revisa creditos o billing de OpenAI.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNestedString(value: unknown, path: string[]): string | null {
  let current: unknown = value;

  for (const key of path) {
    if (!isRecord(current)) {
      return null;
    }

    current = current[key];
  }

  return typeof current === "string" ? current : null;
}

function hasInsufficientQuotaMarker(error: unknown): boolean {
  if (error instanceof Error && error.message.includes("insufficient_quota")) {
    return true;
  }

  if (!isRecord(error)) {
    return false;
  }

  const directCode = getNestedString(error, ["code"]);
  const dataCode = getNestedString(error, ["data", "error", "code"]);
  const responseBody = getNestedString(error, ["responseBody"]);

  if (
    directCode === "insufficient_quota" ||
    dataCode === "insufficient_quota" ||
    responseBody?.includes("insufficient_quota")
  ) {
    return true;
  }

  const lastError = error.lastError;
  if (lastError && hasInsufficientQuotaMarker(lastError)) {
    return true;
  }

  const errors = error.errors;
  if (Array.isArray(errors)) {
    return errors.some(hasInsufficientQuotaMarker);
  }

  return false;
}

export function isAiQuotaError(error: unknown) {
  return hasInsufficientQuotaMarker(error);
}

export function describeAiError(error: unknown) {
  if (isAiQuotaError(error)) {
    return "OpenAI insufficient_quota";
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message.slice(0, 180)}`;
  }

  return "Unknown AI provider error";
}

export function getAiClientErrorMessage(error: unknown) {
  if (isAiQuotaError(error)) {
    return AI_UNAVAILABLE_CLIENT_MESSAGE;
  }

  return "El proveedor de IA fallo. Probemos de nuevo en un momento.";
}
