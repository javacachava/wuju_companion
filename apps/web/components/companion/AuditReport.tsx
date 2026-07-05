"use client";

import { ChevronDown, GraduationCap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { lessonFor } from "@/lib/companion/vuln-knowledge";

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

const SEVERITY_WEIGHT: Record<AuditFinding["severity"], number> = {
  critical: 30,
  high: 18,
  medium: 8,
  low: 3,
};

// Score de seguridad 0-100 (100 = limpio). Penaliza por severidad.
function securityScore(findings: AuditFinding[]) {
  const penalty = findings.reduce((total, f) => total + SEVERITY_WEIGHT[f.severity], 0);
  return Math.max(0, 100 - penalty);
}

function scoreTone(score: number) {
  if (score >= 80) return { ring: "text-emerald-600", label: "Sólido" };
  if (score >= 50) return { ring: "text-amber-600", label: "Mejorable" };
  return { ring: "text-red-600", label: "En riesgo" };
}

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

export function AuditReport({ report }: { report: AuditReportData }) {
  const [open, setOpen] = useState<string | null>(report.findings[0]?.title ?? null);

  const score = securityScore(report.findings);
  const tone = scoreTone(score);
  const counts = report.findings.reduce(
    (acc, f) => {
      acc[f.severity] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );

  return (
    <div className="space-y-3">
      {/* Header pro: score + distribución */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className={tone.ring}
              stroke="currentColor"
              strokeDasharray={`${(score / 100) * 97.4} 97.4`}
            />
          </svg>
          <span className="absolute text-sm font-bold text-slate-800">{score}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            Seguridad: {tone.label}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{report.summary}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(["critical", "high", "medium", "low"] as const).map((sev) =>
              counts[sev] > 0 ? (
                <span
                  key={sev}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${severityMeta[sev].badge}`}
                >
                  {counts[sev]} {severityMeta[sev].label.toLowerCase()}
                </span>
              ) : null,
            )}
          </div>
        </div>
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
                  <div className="space-y-3 border-t border-slate-100 px-3 py-3 text-sm text-slate-700">
                    <p>{finding.description}</p>
                    <p>
                      <span className="font-semibold text-slate-900">Cómo lo arreglás:</span>{" "}
                      {finding.suggestion}
                    </p>
                    <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-100">
                      {finding.fixExample}
                    </pre>

                    {/* Capa de aprendizaje */}
                    {(() => {
                      const lesson = lessonFor(finding.title);
                      return (
                        <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                            <GraduationCap className="h-4 w-4" />
                            Aprendé: {lesson.topic}
                          </p>
                          <p className="mt-1.5 text-sm text-slate-700">
                            <span className="font-semibold text-slate-900">Por qué importa:</span>{" "}
                            {lesson.why}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            <span className="font-semibold text-slate-900">Cómo prevenirlo:</span>{" "}
                            {lesson.prevent}
                          </p>
                          {lesson.learnMore ? (
                            <p className="mt-1.5 text-xs font-medium text-blue-600">
                              Referencia: {lesson.learnMore}
                            </p>
                          ) : null}
                        </div>
                      );
                    })()}
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
