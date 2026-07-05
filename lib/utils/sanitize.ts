export function sanitizePlainText(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f]/g, "")
    .trim();
}

export function assertSafeZipPath(path: string): void {
  const normalized = path.replace(/\\/g, "/");
  if (
    normalized.startsWith("/") ||
    normalized.includes("../") ||
    normalized.includes("..\\")
  ) {
    throw new Error(`Ruta no segura detectada en bundle: ${path}`);
  }
}
