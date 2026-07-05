import Link from "next/link";
import { ArrowRight, Boxes, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/marketplace/format";

export async function MarketplacePreview() {
  const [templates, packs] = await Promise.all([
    db.characterTemplate.findMany({ orderBy: { priceCents: "asc" }, take: 3 }),
    db.pack.findMany({ orderBy: { priceCents: "asc" }, take: 1 }),
  ]);

  const featured = [
    ...templates.map((t) => ({
      key: `character-${t.key}`,
      name: t.name,
      description: t.role,
      badge: t.avatar,
      priceCents: t.priceCents,
      isPremium: t.isPremium,
    })),
    ...packs.map((p) => ({
      key: `pack-${p.key}`,
      name: p.name,
      description: "Pack de capacidades",
      badge: null,
      priceCents: p.priceCents,
      isPremium: p.isPremium,
    })),
  ];

  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Marketplace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Personajes con voz, packs de capacidades y partes de wardrobe. La mayoría es gratis;
              lo premium sostiene el proyecto con comisión para creadores.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Ver todo el catálogo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <article
              key={item.key}
              className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 text-lg font-black text-blue-700">
                {item.badge ?? <Boxes className="h-6 w-6 text-emerald-700" />}
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{item.name}</h3>
              <p className="text-sm text-slate-500">{item.description}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span
                  className={`text-sm font-medium ${item.priceCents > 0 ? "text-slate-700" : "text-emerald-600"}`}
                >
                  {formatPrice(item.priceCents)}
                </span>
                {item.isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                    <Sparkles className="h-3 w-3" />
                    Premium
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
