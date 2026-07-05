const faqs = [
  {
    q: "¿Es gratis?",
    a: "Sí. El Compañero es software libre (AGPL-3.0) y el pack de desarrollo completo es gratis. En el marketplace la mayoría del catálogo también es gratis; los personajes y packs premium son la forma de sostener el proyecto.",
  },
  {
    q: "¿En qué plataformas funciona?",
    a: "Hoy en cualquier navegador moderno (Chrome, Edge, Firefox, Safari) y como app instalable (PWA) en Windows, Linux, macOS y Android. Los instaladores nativos de escritorio están en desarrollo.",
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Tu personaje, inventario e historial viven en tu cuenta. El código es abierto: podés auditar exactamente qué se guarda y qué no. No vendemos datos ni entrenamos modelos con tus conversaciones.",
  },
  {
    q: "¿Cómo funcionan los pagos del marketplace?",
    a: "Por ahora el pago es simulado: podés probar todo el flujo de compra sin gastar dinero real. Los pagos reales (con comisión para creadores externos) llegan con la integración de Stripe.",
  },
  {
    q: "¿Puedo crear y vender mis propios personajes?",
    a: "Ese es el plan: un marketplace curado donde creadores externos publican personajes y packs, y se llevan la mayor parte de cada venta. El portal de creadores está en el roadmap.",
  },
  {
    q: "¿Por qué AGPL y no una licencia cerrada?",
    a: "Porque un asistente que ve tus archivos debería ser un asistente que podés leer. La AGPL garantiza que cualquier mejora, incluso ofrecida como servicio, vuelva a la comunidad.",
  },
  {
    q: "¿Qué necesito para correrlo yo mismo?",
    a: "Node.js 20+, PostgreSQL y API keys de OpenAI y ElevenLabs. Cloná el repo de GitHub y seguí el README: en 10 minutos lo tenés corriendo en tu propia máquina o servidor.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h2 className="text-2xl font-bold text-slate-900">Preguntas frecuentes</h2>
        <div className="mt-6 flex flex-col gap-3">
          {faqs.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-lg border border-slate-200 bg-white px-5 py-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">
                <span className="flex items-center justify-between">
                  {q}
                  <span className="ml-4 text-slate-400 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
