import Link from "next/link";
import { AppWindow, Globe, MonitorDown, Terminal } from "lucide-react";

const targets = [
  {
    title: "Web",
    text: "Usalo ahora mismo desde cualquier navegador moderno. Sin instalar nada.",
    Icon: Globe,
    cta: { label: "Abrir El Compañero", href: "/companion" },
    status: "disponible" as const,
  },
  {
    title: "App instalable (PWA)",
    text: "Instalalo desde el navegador: ícono propio y ventana dedicada en Windows, Linux, macOS y Android.",
    Icon: AppWindow,
    cta: { label: "Instalar desde el menú del navegador", href: "/companion" },
    status: "disponible" as const,
  },
  {
    title: "Windows",
    text: "Instalador nativo .exe con integración de sistema. En desarrollo con Tauri.",
    Icon: MonitorDown,
    cta: null,
    status: "pronto" as const,
  },
  {
    title: "Linux",
    text: "Paquetes .deb y AppImage. En desarrollo con Tauri.",
    Icon: Terminal,
    cta: null,
    status: "pronto" as const,
  },
];

export function DownloadsSection() {
  return (
    <section id="descargas" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-slate-900">Dónde usarlo</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Hoy corre en el navegador y como app instalable. Los instaladores nativos de escritorio
          están en el roadmap y van a salir del mismo código abierto.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {targets.map(({ title, text, Icon, cta, status }) => (
          <article
            key={title}
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Icon className="h-6 w-6 text-blue-600" />
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  status === "disponible"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {status === "disponible" ? "Disponible" : "Próximamente"}
              </span>
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            {cta ? (
              <Link
                href={cta.href}
                className="mt-auto pt-4 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
              >
                {cta.label} →
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
