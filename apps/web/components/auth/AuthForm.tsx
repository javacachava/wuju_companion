"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, LogIn, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { useSession } from "./SessionContext";

type Mode = "login" | "register";

const highlights = [
  {
    Icon: Sparkles,
    title: "Elegí quién es",
    text: "Personaje, voz y personalidad. Tu compañero, tu estilo.",
  },
  {
    Icon: ShieldCheck,
    title: "Vos controlás qué puede tocar",
    text: "Permisos claros y auditables. Libre y de código abierto.",
  },
];

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

  const canSubmit = email && password && (mode === "login" || (name && password.length >= 8));

  return (
    <main className="grid h-[calc(100vh-5rem)] w-full overflow-hidden lg:grid-cols-2">
      {/* Panel de marca (solo desktop) */}
      <aside className="relative hidden overflow-hidden bg-[#06162b] lg:flex lg:flex-col lg:justify-between lg:p-8 xl:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
            Wuju Companion
          </p>
          <h2 className="mt-4 max-w-md text-2xl font-bold leading-tight text-white xl:text-3xl">
            Tu asistente de IA, con la cara y voz que vos elegís.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
            Creá tu cuenta para guardar tu compañero, tu inventario y tus compras del marketplace.
          </p>

          <ul className="mt-6 space-y-3">
            {highlights.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 mt-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element -- mock de producto entregado por el equipo */}
          <img
            src="/brand/mock-inicio.png"
            alt="Vista de El Compañero"
            className="h-full w-full object-cover object-top"
          />
        </div>
      </aside>

      {/* Formulario */}
      <section className="flex h-full flex-col justify-center overflow-y-auto bg-white px-5 py-6 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            {mode === "login" ? "Iniciá sesión" : "Creá tu cuenta"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {mode === "login"
              ? "Entrá para seguir con tu compañero."
              : "Gratis. Tu compañero queda guardado en tu cuenta."}
          </p>

          {/* Toggle login / registro */}
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            {(["login", "register"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  setError(null);
                }}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  mode === value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {value === "login" ? "Ingresar" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (canSubmit && !busy) void submit();
            }}
          >
            {mode === "register" ? (
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
                Nombre
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            ) : null}

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vos@ejemplo.com"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              {mode === "register" && password && password.length < 8 ? (
                <span className="text-[11px] font-normal text-amber-600">
                  Necesita al menos 8 caracteres.
                </span>
              ) : null}
            </label>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy || !canSubmit}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#06162b] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2342] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {mode === "login" ? "Entrar" : "Crear cuenta gratis"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === "login" ? "register" : "login"));
                setError(null);
              }}
              className="font-semibold text-blue-600 transition hover:text-blue-800"
            >
              {mode === "login" ? "Creá una gratis" : "Iniciá sesión"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
