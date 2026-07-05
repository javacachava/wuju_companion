import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page grid">
      <section className="hero">
        <div className="grid">
          <h1 className="section-title">
            Tu asistente de IA.
            <br />
            Tu companero digital.
          </h1>
          <p className="muted" style={{ fontSize: "1.05rem", maxWidth: 560 }}>
            Wuju Companion te permite guardar personajes completos en tu perfil:
            personalidad, voz, permisos y apariencia, listos para aplicar en segundos.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/workshop">
              Explorar Marketplace
            </Link>
            <Link className="btn btn-outline" href="/customization">
              Abrir Personalizacion
            </Link>
          </div>
        </div>

        <div className="hero-media">
          <div className="hero-avatar">W</div>
        </div>
      </section>
    </main>
  );
}
