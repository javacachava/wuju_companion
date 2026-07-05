import Link from "next/link";
import {
  Bot,
  Cpu,
  Github,
  Globe2,
  Heart,
  Instagram,
  Mail,
  MessageCircle,
  PanelsTopLeft,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const providers = [
  { name: "OpenAI", Icon: Bot, className: "text-slate-950" },
  { name: "Claude", Icon: Sparkles, className: "text-slate-950" },
  { name: "Gemini", Icon: Sparkles, className: "text-blue-600" },
  { name: "Local AI", Icon: Cpu, className: "text-slate-950" },
];

const footerColumns = [
  {
    title: "Producto",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Creadores", href: "/#creadores" },
      { label: "Funcionamiento", href: "/#funcionamiento" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Documentación", href: "/#documentacion" },
      { label: "Guías", href: "/#guias" },
      { label: "Preguntas frecuentes", href: "/#preguntas" },
      { label: "Blog", href: "/#blog" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "/#nosotros" },
      { label: "Contacto", href: "mailto:equipo@companero.dev" },
      { label: "Términos de servicio", href: "/#terminos" },
      { label: "Política de privacidad", href: "/#privacidad" },
    ],
  },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/javacachava/wuju_companion", Icon: Github },
  { label: "Comunidad", href: "/#comunidad", Icon: MessageCircle },
  { label: "Discord", href: "/#discord", Icon: Bot },
  { label: "Instagram", href: "/#instagram", Icon: Instagram },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-white text-[#07172d]">
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58vw] lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element -- asset entregado para el hero principal */}
          <img
            src="/brand/hero-inicio.png"
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/45 to-white/0" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-white/0" />
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[92rem] items-center px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-normal text-[#07172d] sm:text-5xl lg:text-[4.45rem]">
              Tu asistente de IA.
              <br />
              Tu compañero digital.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Wuju Companion da vida a la IA en tu escritorio. Un compañero
              adorable que entiende tus proyectos, te ayuda a programar y crece
              contigo.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/companion"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-[#06162b] px-7 text-base font-semibold text-white shadow-sm transition hover:bg-[#0b2342]"
              >
                <PanelsTopLeft className="h-5 w-5" />
                Descargar para Windows
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-7 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <ShoppingBag className="h-5 w-5" />
                Explorar Marketplace
              </Link>
            </div>

            <div
              id="funcionamiento"
              className="mt-14 flex flex-wrap items-center gap-x-7 gap-y-4 text-sm font-semibold text-slate-950 sm:text-base"
            >
              <span className="font-medium text-slate-900">Funciona con:</span>
              {providers.map(({ name, Icon, className }) => (
                <span key={name} className={`inline-flex items-center gap-2 ${className}`}>
                  <Icon className="h-5 w-5" />
                  {name}
                </span>
              ))}
            </div>

            <div className="relative mt-10 aspect-[1517/1037] overflow-hidden lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- asset entregado para el hero principal */}
              <img
                src="/brand/hero-inicio.png"
                alt="Wuju Companion en un escritorio de trabajo"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <footer id="creadores" className="border-t border-slate-200 bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-[92rem]">
          <div className="grid gap-10 lg:grid-cols-[1.55fr_0.7fr_0.7fr_0.7fr_1.7fr]">
            <div>
              <Link href="/" className="inline-flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- logo provisto por el equipo */}
                <img
                  src="/brand/logo-wuju.png"
                  alt="Wuju Companion"
                  className="h-16 w-auto object-contain"
                />
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-6 text-slate-600">
                Wuju Companion transforma la IA en un compañero de escritorio
                que te entiende, te ayuda y crece contigo. Hecho para
                desarrolladores, por desarrolladores.
              </p>
              <div className="mt-5 flex gap-3">
                {socialLinks.map(({ label, href, Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#07172d] text-white transition hover:bg-[#15345f]"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            {footerColumns.map((column) => (
              <nav key={column.title}>
                <h2 className="text-sm font-bold text-slate-950">{column.title}</h2>
                <div className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-sm text-slate-600 transition hover:text-slate-950"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800">
                  <Mail className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-950">Mantente al día</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Suscríbete a nuestro boletín para recibir novedades y
                    actualizaciones.
                  </p>
                </div>
              </div>
              <form className="mt-6 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="newsletter-email">
                  Tu correo electrónico
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="min-h-12 min-w-0 flex-1 rounded-md border border-slate-200 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  className="min-h-12 rounded-md bg-[#06162b] px-5 text-sm font-semibold text-white transition hover:bg-[#0b2342]"
                >
                  Suscribirse
                </button>
              </form>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>© 2025 Wuju Companion. Todos los derechos reservados.</p>
            <div className="flex flex-wrap items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <Globe2 className="h-4 w-4" />
                Español
              </span>
              <span className="hidden h-5 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-1">
                Hecho con <Heart className="h-4 w-4 fill-red-500 text-red-500" /> para
                desarrolladores
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
