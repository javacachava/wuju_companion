"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  getPermissions,
  setPermission,
  PERMISSION_LABELS,
  type PermissionKey,
  type PermissionState,
} from "@/lib/permissions";

type PermissionsPanelProps = {
  open: boolean;
  onClose: () => void;
};

const PERMISSION_ORDER: PermissionKey[] = ["mic", "clipboard", "screen"];

export function PermissionsPanel({ open, onClose }: PermissionsPanelProps) {
  const [permissions, setPermissions] = useState<PermissionState | null>(null);

  useEffect(() => {
    if (open) {
      setPermissions(getPermissions());
    }
  }, [open]);

  if (!open || !permissions) {
    return null;
  }

  const handleToggle = (key: PermissionKey) => {
    const next = setPermission(key, !permissions[key]);
    setPermissions(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Permisos del compañero"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Permisos</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Qué puede tocar el compañero. Revocable en cualquier momento — se aplica antes de
          cada uso, no solo al abrir la app.
        </p>

        <ul className="mt-4 space-y-3">
          {PERMISSION_ORDER.map((key) => {
            const meta = PERMISSION_LABELS[key];
            const enabled = permissions[key];

            return (
              <li
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{meta.label}</p>
                  <p className="text-xs text-slate-500">{meta.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${enabled ? "Desactivar" : "Activar"} ${meta.label}`}
                  onClick={() => handleToggle(key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      enabled ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
