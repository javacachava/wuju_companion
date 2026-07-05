import JSZip from "jszip";
import type { ParsedBundle } from "@/lib/domain/types";
import {
  metadataSchema,
  permissionsSchema,
  versionSchema,
  voiceSchema
} from "@/lib/bundle/schemas";
import { assertSafeZipPath } from "@/lib/utils/sanitize";

const MAX_BUNDLE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

function hasAllowedImageExtension(path: string): boolean {
  const lower = path.toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export async function parseBundle(
  input: Uint8Array | ArrayBuffer | SharedArrayBuffer
): Promise<ParsedBundle> {
  const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (buffer.byteLength > MAX_BUNDLE_SIZE_BYTES) {
    throw new Error("El bundle supera el límite máximo permitido (25 MB).");
  }

  const zip = await JSZip.loadAsync(buffer);
  const files: Record<string, Uint8Array> = {};
  let totalUncompressed = 0;

  const entries = Object.values(zip.files);
  for (const entry of entries) {
    if (entry.dir) continue;
    assertSafeZipPath(entry.name);
    const bytes = await entry.async("uint8array");
    totalUncompressed += bytes.byteLength;
    if (totalUncompressed > MAX_BUNDLE_SIZE_BYTES) {
      throw new Error("Contenido descomprimido excede el límite permitido.");
    }
    files[entry.name] = bytes;
  }

  const required = [
    "metadata.json",
    "personality.mb",
    "instructions.mb",
    "permissions.json",
    "voice.json",
    "version.json"
  ] as const;

  for (const requiredFile of required) {
    if (!files[requiredFile]) {
      throw new Error(`Archivo requerido faltante en el bundle: ${requiredFile}`);
    }
  }

  const metadata = metadataSchema.parse(
    JSON.parse(decodeUtf8(files["metadata.json"]))
  );
  const permissions = permissionsSchema.parse(
    JSON.parse(decodeUtf8(files["permissions.json"]))
  );
  const voice = voiceSchema.parse(JSON.parse(decodeUtf8(files["voice.json"])));
  const versionInfo = versionSchema.parse(
    JSON.parse(decodeUtf8(files["version.json"]))
  );

  if (!files[metadata.skin]) {
    throw new Error("El metadata referencia un skin que no existe.");
  }
  if (!hasAllowedImageExtension(metadata.skin)) {
    throw new Error("El skin debe ser una imagen permitida.");
  }
  if (!files[metadata.personality] || !files[metadata.instructions]) {
    throw new Error("El metadata referencia personalidad/instrucciones inválidas.");
  }
  if (!files[metadata.permissions]) {
    throw new Error("El metadata referencia permisos inválidos.");
  }

  if (metadata.preview && !files[metadata.preview]) {
    throw new Error("El preview referenciado no existe en el bundle.");
  }
  if (metadata.icon && !files[metadata.icon]) {
    throw new Error("El icon referenciado no existe en el bundle.");
  }

  const personalityRaw = decodeUtf8(files[metadata.personality]);
  const instructionsRaw = decodeUtf8(files[metadata.instructions]);

  return {
    metadata,
    permissions,
    voice,
    versionInfo,
    personalityRaw,
    instructionsRaw,
    files
  };
}

export const bundleLimits = {
  maxBundleSizeBytes: MAX_BUNDLE_SIZE_BYTES
};
