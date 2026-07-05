"use client";

import { useState } from "react";

type OnboardingProps = {
  onContinue: (userName: string) => Promise<void>;
};

export function Onboarding({ onContinue }: OnboardingProps) {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    const value = userName.trim();
    if (!value || loading) return;

    setLoading(true);
    setError(null);

    try {
      await onContinue(value);
    } catch {
      setError("No pudimos crear tu personaje. Probá otra vez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-600">Bienvenido a El Compañero</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Elegí un nombre para empezar
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Crearemos tu personaje base y después podrás elegir el asistente del día.
        </p>

        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          placeholder="Ej: juan"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading || !userName.trim()}
          className="mt-5 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Creando personaje..." : "Continuar"}
        </button>
      </section>
    </main>
  );
}
