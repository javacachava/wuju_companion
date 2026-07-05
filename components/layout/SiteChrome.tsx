import Link from "next/link";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-dot">W</span>
            <span>Wuju Companion</span>
          </Link>
          <nav className="nav-links">
            <Link href="/">Inicio</Link>
            <Link href="/workshop">Marketplace</Link>
            <Link href="/customization">Personalización</Link>
            <span>Funcionamiento</span>
          </nav>
          <Link className="btn btn-primary" href="/workshop">
            Comenzar
          </Link>
        </div>
      </header>

      {children}

      <footer className="footer">
        <div className="footer-inner">
          <span>© 2026 Wuju Companion. Todos los derechos reservados.</span>
          <span>Hecho para desarrolladores.</span>
        </div>
      </footer>
    </div>
  );
}
