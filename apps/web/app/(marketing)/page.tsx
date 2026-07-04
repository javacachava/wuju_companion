import Link from "next/link";
import {
  BriefcaseBusiness,
  Check,
  Code2,
  Github,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Megaphone,
  Palette,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const repoUrl = "https://github.com/javacachava/wuju_companion";

const howItWorks = [
  {
    title: "Elegís quién es",
    text: "Mascota, personalidad y voz. El Compañero trabaja al lado tuyo sin perder identidad.",
    Icon: Sparkles,
  },
  {
    title: "Elegís qué sabe",
    text: "El primer pack completo es desarrollo: chat conversacional y Guardián de código.",
    Icon: Layers3,
  },
  {
    title: "Elegís qué puede tocar",
    text: "Los permisos son explícitos, revocables y auditables porque el core es software libre.",
    Icon: LockKeyhole,
  },
];

const comparison = [
  { name: "Cursor", values: [false, false, false, false, false] },
  { name: "ChatGPT", values: [false, true, false, true, false] },
  { name: "Character.ai", values: [true, true, false, false, false] },
  { name: "El Compañero", values: [true, true, true, true, true], highlight: true },
];

const roadmap = [
  { title: "Marketing", text: "Análisis de campañas y copy con contexto.", Icon: Megaphone },
  { title: "Diseño", text: "Crítica visual, variantes y checklist de entrega.", Icon: Palette },
  { title: "Negocios", text: "Síntesis, decisiones y seguimiento operativo.", Icon: BriefcaseBusiness },
  { title: "Estudio", text: "Tutoría guiada y repaso con voz.", Icon: GraduationCap },
];

function MascotPreview() {
  return (
    <div className="pointer-events-none absolute bottom-[-3rem] right-[-1rem] hidden h-[34rem] w-[34rem] opacity-95 md:block lg:right-[4rem]">
      {[
        ["/parts/body.png", "z-10"],
        ["/parts/clothing-hoodie.png", "z-20"],
        ["/parts/hair-corto.png", "z-30"],
        ["/parts/eyes-lentes.png", "z-40"],
        ["/parts/mouth-sonrisa.png", "z-50"],
        ["/parts/accessory-audifonos.png", "z-60"],
      ].map(([src, z]) => (
        // eslint-disable-next-line @next/next/no-img-element -- preview local compuesto desde /public/parts
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-contain ${z}`}
        />
      ))}
    </div>
  );
}

function Mark({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Check className="mx-auto h-4 w-4 text-emerald-600" />
  ) : (
    <X className="mx-auto h-4 w-4 text-slate-300" />
  );
}

export default function LandingPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#F7FAFC]">
        <MascotPreview />
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
              Software libre bajo AGPL-3.0
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-normal text-[#1A365D] md:text-6xl">
              Tu compañero de trabajo. Con la cara y voz que elegís.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Libre y auditable. Elegís quién es. Elegís qué puede hacer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/companion"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Probalo ahora
              </Link>
              <Link
                href={repoUrl}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                <Github className="h-4 w-4" />
                Ver en GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-3 md:py-24">
        {howItWorks.map(({ title, text, Icon }) => (
          <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className="h-6 w-6 text-blue-600" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2 md:py-24">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-red-600" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">Guardián de código</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pegás un fragmento vulnerable y devuelve severidad, línea, explicación y fix
              propuesto. También lo narra con voz.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 font-mono text-xs text-slate-100">
              {`critical · SQL Injection · línea 2\nUsá parámetros preparados u ORM.`}
            </pre>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <Code2 className="h-6 w-6 text-amber-700" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">Guardián de despliegue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Revisión de configuración, secretos y permisos antes de publicar. Este es el
              siguiente paso del pack de desarrollo.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Próximamente
            </span>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900">Cómo se compara</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cursor es velocidad. ChatGPT es respuesta. Character.ai es compañía. El Compañero
            apunta a unir esas tres cosas con código abierto.
          </p>
        </div>
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Producto</th>
                {["Personalidad", "Voz", "Permisos", "Multi-vertical", "Código abierto"].map(
                  (label) => (
                    <th key={label} className="px-4 py-3 text-center font-semibold">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.name} className={row.highlight ? "bg-blue-50" : "bg-white"}>
                  <td className="border-t border-slate-200 px-4 py-3 font-semibold">
                    {row.name}
                  </td>
                  {row.values.map((value, index) => (
                    <td key={index} className="border-t border-slate-200 px-4 py-3">
                      <Mark enabled={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="text-2xl font-bold text-slate-900">Roadmap</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {roadmap.map(({ title, text, Icon }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-4">
                <Icon className="h-5 w-5 text-slate-700" />
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2 md:py-24">
        <article>
          <h2 className="text-2xl font-bold text-slate-900">Open source</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Porque un asistente que ve tus archivos debería ser un asistente que podés leer.
            El core está publicado bajo AGPL-3.0.
          </p>
          <Link
            href={repoUrl}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
          >
            <Github className="h-4 w-4" />
            Repositorio público
          </Link>
        </article>
        <article className="rounded-lg border border-slate-200 bg-[#F7FAFC] p-5">
          <h2 className="text-2xl font-bold text-slate-900">Para empresas</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Agentes empresariales pre-configurados para que cada practicante tenga un senior
            virtual al lado. Setup alto, mantenimiento mensual.
          </p>
          <a
            href="mailto:equipo@companero.dev?subject=El%20Compa%C3%B1ero%20para%20empresas"
            className="mt-5 inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Hablemos
          </a>
        </article>
      </section>

      <footer className="border-t border-slate-200 px-4 py-8 text-sm text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>El Compañero · ElevenLabs · n8n · Codex</p>
          <Link href={repoUrl} className="font-medium text-slate-700">
            GitHub
          </Link>
        </div>
      </footer>
    </main>
  );
}
