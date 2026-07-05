import type { ParsedBundle } from "@/lib/domain/types";
import { sanitizePlainText } from "@/lib/utils/sanitize";

function parseSemver(version: string): [number, number, number] {
  const parts = version.split(".").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Versión inválida: ${version}`);
  }
  return [parts[0], parts[1], parts[2]];
}

function isLowerSemver(a: string, b: string): boolean {
  const [amajor, aminor, apatch] = parseSemver(a);
  const [bmajor, bminor, bpatch] = parseSemver(b);
  if (amajor !== bmajor) return amajor < bmajor;
  if (aminor !== bminor) return aminor < bminor;
  return apatch < bpatch;
}

export function validateBundleForInstall(
  parsed: ParsedBundle,
  latestInstalledVersion?: string
): ParsedBundle {
  const safeName = sanitizePlainText(parsed.metadata.name);
  const safeAuthor = sanitizePlainText(parsed.metadata.author);
  const safeDescription = sanitizePlainText(parsed.metadata.description);

  if (!safeName || !safeAuthor || !safeDescription) {
    throw new Error("Metadatos inválidos tras sanitización.");
  }

  if (latestInstalledVersion) {
    const incoming = parsed.metadata.version;
    if (isLowerSemver(incoming, latestInstalledVersion)) {
      throw new Error(
        `Downgrade bloqueado: instalada ${latestInstalledVersion}, bundle ${incoming}.`
      );
    }
  }

  return {
    ...parsed,
    metadata: {
      ...parsed.metadata,
      name: safeName,
      author: safeAuthor,
      description: safeDescription
    }
  };
}
