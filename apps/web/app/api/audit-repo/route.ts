import { z } from "zod";

import { auditCode } from "@/lib/ai";
import { describeAiError, getAiClientErrorMessage, isAiQuotaError } from "@/lib/ai-errors";
import { db } from "@/lib/db";
import { triggerAuditCritical } from "@/lib/n8n";
import { enforceRateLimit } from "@/lib/rate-limit";

// Modo Byte Warden: pegás un repo público de GitHub, lo leemos y lo auditamos.
const AuditRepoSchema = z
  .object({
    characterId: z.string().min(1),
    repoUrl: z.string().min(1),
  })
  .strict();

const CODE_EXTENSIONS = new Set([
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "go",
  "rb",
  "php",
  "java",
  "cs",
  "c",
  "cpp",
  "rs",
  "sql",
]);

const MAX_FILES = 6;
const MAX_TOTAL_CHARS = 28_000;

function parseRepo(input: string): { owner: string; repo: string } | null {
  const cleaned = input.trim().replace(/\.git$/, "");
  const match = cleaned.match(/github\.com[/:]([^/]+)\/([^/]+)/i);
  if (match) return { owner: match[1]!, repo: match[2]! };
  const short = cleaned.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (short) return { owner: short[1]!, repo: short[2]! };
  return null;
}

async function ghJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "wuju-companion" },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function POST(request: Request) {
  const limited = enforceRateLimit("audit", request);
  if (limited) return limited;

  try {
    const body = AuditRepoSchema.parse(await request.json());

    const parsed = parseRepo(body.repoUrl);
    if (!parsed) {
      return Response.json({ error: "invalid_repo_url" }, { status: 400 });
    }

    const character = await db.character.findUnique({
      where: { id: body.characterId },
      select: { id: true, personality: true },
    });
    if (!character) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    // 1) rama por defecto
    const meta = await ghJson<{ default_branch?: string }>(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    );
    if (!meta) {
      return Response.json({ error: "repo_not_found" }, { status: 404 });
    }
    const branch = meta.default_branch ?? "main";

    // 2) árbol de archivos
    const tree = await ghJson<{ tree?: Array<{ path: string; type: string; size?: number }> }>(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`,
    );
    const codePaths = (tree?.tree ?? [])
      .filter((node) => node.type === "blob")
      .filter((node) => CODE_EXTENSIONS.has(node.path.split(".").pop()?.toLowerCase() ?? ""))
      .filter((node) => (node.size ?? 0) < 12_000)
      .slice(0, MAX_FILES);

    if (codePaths.length === 0) {
      return Response.json({ error: "no_code_files" }, { status: 422 });
    }

    // 3) contenido de cada archivo (raw)
    let combined = "";
    for (const node of codePaths) {
      if (combined.length >= MAX_TOTAL_CHARS) break;
      const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${node.path}`;
      const res = await fetch(rawUrl, { headers: { "User-Agent": "wuju-companion" } });
      if (!res.ok) continue;
      const text = await res.text();
      combined += `\n// ===== ${node.path} =====\n${text.slice(0, 8_000)}\n`;
    }

    if (!combined.trim()) {
      return Response.json({ error: "could_not_read_files" }, { status: 422 });
    }

    const report = await auditCode({
      code: combined.slice(0, MAX_TOTAL_CHARS),
      language: "mixed",
      personality: character.personality,
    });

    const criticalCount = report.findings.filter((f) => f.severity === "critical").length;
    if (criticalCount > 0) {
      void triggerAuditCritical({
        characterId: character.id,
        criticalCount,
        summary: report.summary,
      });
    }

    return Response.json({
      ...report,
      repo: `${parsed.owner}/${parsed.repo}`,
      filesAudited: codePaths.map((n) => n.path),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("[api/audit-repo] failed:", describeAiError(error));
    return Response.json(
      { error: "audit_repo_failed", message: getAiClientErrorMessage(error) },
      { status: isAiQuotaError(error) ? 503 : 500 },
    );
  }
}
