"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type AuditFinding = {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  line: number | null;
  description: string;
  suggestion: string;
  fixExample: string;
};

export type AuditReportData = {
  findings: AuditFinding[];
  summary: string;
  characterVoicedSummary: string;
};

const severityMeta: Record<
  AuditFinding["severity"],
  { label: string; badge: string; border: string }
> = {
  critical: {
    label: "Crítica",
    badge: "bg-red-50 text-red-700 ring-red-200",
    border: "border-red-200",
  },
  high: {
    label: "Alta",
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    border: "border-orange-200",
  },
  medium: {
    label: "Media",
    badge: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    border: "border-yellow-200",
  },
  low: {
    label: "Baja",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    border: "border-blue-200",
  },
};

function summaryClass(findings: AuditFinding[]) {
  if (findings.some((finding) => finding.severity === "critical")) {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (findings.some((finding) => finding.severity === "high" || finding.severity === "medium")) {
    return "border-yellow-200 bg-yellow-50 text-yellow-800";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export function AuditReport({ report }: { report: AuditReportData }) {
  const [open, setOpen] = useState<string | null>(report.findings[0]?.title ?? null);

  return (
    <div className="space-y-3">
      <div className={`rounded-lg border px-3 py-2 text-sm ${summaryClass(report.findings)}`}>
        {report.summary}
      </div>

      {report.findings.length === 0 ? (
        <p className="text-sm text-slate-500">No encontré vulnerabilidades reales en este fragmento.</p>
      ) : (
        <div className="space-y-2">
          {report.findings.map((finding, index) => {
            const key = `${finding.title}-${index}`;
            const meta = severityMeta[finding.severity];
            const expanded = open === key || (open === finding.title && index === 0);

            return (
              <article key={key} className={`rounded-lg border bg-white ${meta.border}`}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : key)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                >
                  <span className="min-w-0">
                    <span
                      className={`mr-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{finding.title}</span>
                    {finding.line ? (
                      <span className="ml-2 text-xs text-slate-500">línea {finding.line}</span>
                    ) : null}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expanded ? (
                  <div className="space-y-2 border-t border-slate-100 px-3 py-3 text-sm text-slate-700">
                    <p>{finding.description}</p>
                    <p>
                      <span className="font-semibold text-slate-900">Sugerencia:</span>{" "}
                      {finding.suggestion}
                    </p>
                    <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-100">
                      {finding.fixExample}
                    </pre>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
