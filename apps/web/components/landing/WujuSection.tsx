const products = [
  { name: "Wuju Companion", detail: "Asistente libre con cara y voz — este producto" },
  { name: "Flowcore", detail: "Automatización de flujos de trabajo" },
  { name: "Mimalla", detail: "Herramientas para comercios" },
  { name: "Pizza Brava POS", detail: "Punto de venta para gastronomía" },
];

export function WujuSection() {
  return (
    <section className="border-y border-slate-200 bg-[#0F172A] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
            Quiénes somos
          </p>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">Hecho por Wuju</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Wuju es un estudio de software que construye productos reales para gente real. El
            Compañero es nuestra apuesta más grande: un asistente de IA que no es una caja negra,
            sino software libre que podés leer, modificar y auditar. Creemos que la capa entre una
            persona y su computadora no puede ser propiedad de nadie.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Productos de Wuju
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            {products.map((product) => (
              <li
                key={product.name}
                className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3"
              >
                <span className="font-semibold text-white">{product.name}</span>
                <span className="ml-2 text-sm text-slate-400">{product.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
