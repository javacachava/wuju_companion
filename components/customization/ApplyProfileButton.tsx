"use client";

import { useState } from "react";

type Props = {
  characterId: string;
  mindId: string;
  skinId: string;
};

export function ApplyProfileButton({ characterId, mindId, skinId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onApply() {
    setStatus("loading");
    try {
      const response = await fetch("/api/customization/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user"
        },
        body: JSON.stringify({ characterId, mindId, skinId })
      });
      if (!response.ok) throw new Error("failed");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <button className="btn btn-primary" onClick={onApply} disabled={status === "loading"}>
        {status === "loading" ? "Aplicando..." : "Aplicar"}
      </button>
      {status === "ok" ? (
        <small className="muted">Perfil aplicado correctamente.</small>
      ) : null}
      {status === "error" ? (
        <small className="muted">No fue posible aplicar el perfil.</small>
      ) : null}
    </div>
  );
}
