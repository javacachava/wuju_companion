"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, LogIn, UserPlus } from "lucide-react";
import { useSession } from "./SessionContext";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const next = searchParams.get("next") ?? "/companion";

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const body =
        mode === "login" ? { email, password } : { email, name, password };
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Algo salió mal. Probá de nuevo.");
        return;
      }

      await refresh();
      router.push(next);
    } catch {
      setError("No se pudo conectar. Revisá tu conexión.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "login"
            ? "Entrá para comprar en el marketplace y guardar tu compañero."
            : "Una cuenta guarda tu compañero, tus compras y tu inventario."}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {mode === "register" ? (
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Nombre
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vos@ejemplo.com"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || !email || !password || (mode === "register" && !name)}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setMode((prev) => (prev === "login" ? "register" : "login"));
            setError(null);
          }}
          className="mt-4 w-full text-center text-sm text-blue-600 transition hover:text-blue-800"
        >
          {mode === "login"
            ? "¿No tenés cuenta? Creá una gratis"
            : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>
      </div>
    </main>
  );
}
