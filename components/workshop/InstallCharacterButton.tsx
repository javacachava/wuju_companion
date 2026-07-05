"use client";

import { useState } from "react";

type Props = {
  characterId: string;
  version: string;
  installed?: boolean;
};

export function InstallCharacterButton({ characterId, version, installed }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function onInstall() {
    setLoading(true);
    setStatus("idle");
    try {
      const response = await fetch("/api/workshop/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user"
        },
        body: JSON.stringify({ characterId, version })
      });
      if (!response.ok) throw new Error("save failed");
      setStatus("ok");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  if (installed || status === "ok") {
    return <button className="btn btn-outline">Guardado en perfil</button>;
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <button className="btn btn-primary" onClick={onInstall} disabled={loading}>
        {loading ? "Guardando..." : "Guardar en perfil"}
      </button>
      {status === "error" ? (
        <small className="muted">No se pudo guardar en perfil, intenta de nuevo.</small>
      ) : null}
    </div>
  );
}
