"use client";

import { Download, LogOut, MonitorDown } from "lucide-react";

type InstallationWindowProps = {
  userEmail: string | null;
  onLogout: () => Promise<void>;
};

export function InstallationWindow({ userEmail, onLogout }: InstallationWindowProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center p-6">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
              Descarga del software
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Instalación de Wuju Companion
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Esta ventana contiene únicamente la pestaña de instalación. Descarga el
              instalador y sigue el asistente en tu equipo.
            </p>
            {userEmail ? (
              <p className="mt-2 text-xs text-slate-500">Sesión activa: {userEmail}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
              <MonitorDown className="h-4 w-4" />
              Instalación
            </span>
          </div>
          <div className="space-y-4 p-5">
            <p className="text-sm text-slate-700">
              1) Descarga el instalador oficial para Windows.
              <br />
              2) Ejecuta el archivo `.exe` y sigue los pasos.
              <br />
              3) Inicia sesión en la app para sincronizar tu perfil.
            </p>
            <a
              href="https://github.com/javacachava/wuju_companion/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#06162b] px-5 text-sm font-semibold text-white transition hover:bg-[#0b2342]"
            >
              <Download className="h-4 w-4" />
              Descargar software
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
