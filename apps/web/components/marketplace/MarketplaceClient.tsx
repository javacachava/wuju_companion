/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  Flame,
  Github,
  Globe2,
  Grid2X2,
  Heart,
  Instagram,
  Mail,
  MessageCircle,
  PackagePlus,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Trophy,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { Toast } from "./Toast";

type FilterId =
  | "all"
  | "new"
  | "popular"
  | "basic"
  | "tech"
  | "fantasy"
  | "profession"
  | "sports"
  | "special";

type SortOption = "recent" | "name" | "category";
type TagTone = "blue" | "slate" | "cyan" | "gold" | "rose" | "green" | "violet";

type SidebarFilter = {
  id: FilterId;
  label: string;
  Icon: LucideIcon;
};

type CharacterCard = {
  id: string;
  name: string;
  category: string;
  categoryId: Exclude<FilterId, "all" | "new" | "popular">;
  image: string;
  tag: string;
  tagTone: TagTone;
  background: string;
  isNew?: boolean;
  isPopular?: boolean;
};

const sidebarFilters: SidebarFilter[] = [
  { id: "all", label: "Todos los personajes", Icon: Grid2X2 },
  { id: "new", label: "Nuevos", Icon: Sparkles },
  { id: "popular", label: "Populares", Icon: Flame },
  { id: "basic", label: "Básicos", Icon: Shirt },
  { id: "tech", label: "Tecnológicos", Icon: Cpu },
  { id: "profession", label: "Profesiones", Icon: Briefcase },
  { id: "fantasy", label: "Fantásticos", Icon: Wand2 },
  { id: "sports", label: "Deportes", Icon: Trophy },
  { id: "special", label: "Edición especial", Icon: PackagePlus },
];

const sortLabels: Record<SortOption, string> = {
  recent: "Más recientes",
  name: "Nombre",
  category: "Categoría",
};

const tagToneClass: Record<TagTone, string> = {
  blue: "bg-blue-50 text-blue-700",
  slate: "bg-slate-100 text-slate-700",
  cyan: "bg-cyan-50 text-cyan-700",
  gold: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  green: "bg-emerald-50 text-emerald-700",
  violet: "bg-violet-50 text-violet-700",
};

const marketplaceCharacters: CharacterCard[] = [
  {
    id: "policia",
    name: "Policía",
    category: "Profesiones",
    categoryId: "profession",
    image: "/marketplace/characters/policia.png",
    tag: "Nuevo",
    tagTone: "blue",
    background: "bg-gradient-to-br from-slate-50 to-blue-50",
    isNew: true,
    isPopular: true,
  },
  {
    id: "brujo",
    name: "Brujo",
    category: "Fantásticos",
    categoryId: "fantasy",
    image: "/marketplace/characters/brujo.png",
    tag: "Mágico",
    tagTone: "violet",
    background: "bg-gradient-to-br from-violet-50 to-amber-50",
    isNew: true,
    isPopular: true,
  },
  {
    id: "angel",
    name: "Ángel",
    category: "Fantásticos",
    categoryId: "fantasy",
    image: "/marketplace/characters/angel.png",
    tag: "Luminoso",
    tagTone: "gold",
    background: "bg-gradient-to-br from-white to-amber-50",
    isNew: true,
  },
  {
    id: "robot",
    name: "Robot",
    category: "Tecnológicos",
    categoryId: "tech",
    image: "/marketplace/characters/robot.png",
    tag: "Tech",
    tagTone: "cyan",
    background: "bg-gradient-to-br from-slate-50 to-cyan-50",
    isPopular: true,
  },
  {
    id: "payaso",
    name: "Payaso",
    category: "Edición especial",
    categoryId: "special",
    image: "/marketplace/characters/payaso.png",
    tag: "Especial",
    tagTone: "rose",
    background: "bg-gradient-to-br from-rose-50 to-slate-50",
    isNew: true,
  },
  {
    id: "marinero",
    name: "Marinero",
    category: "Profesiones",
    categoryId: "profession",
    image: "/marketplace/characters/marinero.png",
    tag: "Clásico",
    tagTone: "blue",
    background: "bg-gradient-to-br from-white to-sky-50",
    isPopular: true,
  },
  {
    id: "traje",
    name: "Traje",
    category: "Básicos",
    categoryId: "basic",
    image: "/marketplace/characters/traje.png",
    tag: "Formal",
    tagTone: "slate",
    background: "bg-gradient-to-br from-slate-50 to-zinc-100",
  },
  {
    id: "mochila-dev",
    name: "Mochila Dev",
    category: "Tecnológicos",
    categoryId: "tech",
    image: "/marketplace/characters/mochila.png",
    tag: "Dev",
    tagTone: "slate",
    background: "bg-gradient-to-br from-slate-50 to-stone-100",
    isPopular: true,
  },
  {
    id: "pc",
    name: "PC",
    category: "Tecnológicos",
    categoryId: "tech",
    image: "/marketplace/characters/pc.png",
    tag: "Retro",
    tagTone: "cyan",
    background: "bg-gradient-to-br from-white to-slate-100",
  },
  {
    id: "cabo-verde",
    name: "Cabo Verde",
    category: "Deportes",
    categoryId: "sports",
    image: "/marketplace/characters/cabo-verde.png",
    tag: "Deporte",
    tagTone: "blue",
    background: "bg-gradient-to-br from-blue-50 to-emerald-50",
    isNew: true,
  },
  {
    id: "camisa",
    name: "Camisa Boxful",
    category: "Edición especial",
    categoryId: "special",
    image: "/marketplace/characters/camisa.png",
    tag: "Partner",
    tagTone: "rose",
    background: "bg-gradient-to-br from-white to-red-50",
  },
  {
    id: "sueter",
    name: "Suéter azul",
    category: "Básicos",
    categoryId: "basic",
    image: "/marketplace/characters/sueter.png",
    tag: "Básico",
    tagTone: "blue",
    background: "bg-gradient-to-br from-slate-50 to-blue-50",
    isPopular: true,
  },
  {
    id: "base",
    name: "Base",
    category: "Básicos",
    categoryId: "basic",
    image: "/marketplace/characters/base.png",
    tag: "Base",
    tagTone: "slate",
    background: "bg-gradient-to-br from-white to-slate-50",
  },
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

export function MarketplaceClient() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [installedIds, setInstalledIds] = useState<ReadonlySet<string>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const installCharacter = useCallback(
    (character: CharacterCard) => {
      setInstalledIds((previous) => {
        if (previous.has(character.id)) return previous;
        const next = new Set(previous);
        next.add(character.id);
        return next;
      });
      showToast(`${character.name} instalado en tu colección.`);
    },
    [showToast],
  );

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    const matchesFilter = (character: CharacterCard) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "new") return Boolean(character.isNew);
      if (activeFilter === "popular") return Boolean(character.isPopular);
      return character.categoryId === activeFilter;
    };

    const result = marketplaceCharacters.filter((character) => {
      const searchable = `${character.name} ${character.category} ${character.tag}`.toLocaleLowerCase(
        "es",
      );
      return matchesFilter(character) && searchable.includes(normalizedQuery);
    });

    return [...result].sort((first, second) => {
      if (sortBy === "name") return first.name.localeCompare(second.name, "es");
      if (sortBy === "category") return first.category.localeCompare(second.category, "es");
      return marketplaceCharacters.indexOf(first) - marketplaceCharacters.indexOf(second);
    });
  }, [activeFilter, query, sortBy]);

  return (
    <main className="border-t border-slate-200 bg-white text-[#07172d]">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[92rem] lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-200 px-7 py-10 lg:block">
          <div className="sticky top-28">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-slate-50 text-[#07172d]">
                <ShoppingBag className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Marketplace</h2>
                <p className="mt-2 text-sm text-slate-600">Elige tu compañero ideal</p>
              </div>
            </div>

            <nav className="mt-9 space-y-2" aria-label="Filtros del marketplace">
              {sidebarFilters.map(({ id, label, Icon }) => {
                const active = activeFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveFilter(id)}
                    className={`flex h-12 w-full items-center gap-4 rounded-lg px-4 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-10 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Download className="h-8 w-8 text-[#07172d]" />
              <h3 className="mt-4 text-base font-bold text-slate-950">Instala más personajes</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explora nuevos estilos y agrega compañeros a tu escritorio.
              </p>
              <button
                type="button"
                onClick={() => showToast("Colección lista para explorar.")}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#06162b] px-4 text-sm font-semibold text-white transition hover:bg-[#0b2342]"
              >
                Explorar más
              </button>
            </div>

            <button
              type="button"
              onClick={() => showToast("Guía rápida: elige un personaje y presiona Instalar.")}
              className="mt-5 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300"
            >
              <span>
                <span className="block text-sm font-bold text-slate-950">¿Cómo instalar?</span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">
                  Descubre cómo usar tus compañeros.
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
            </button>
          </div>
        </aside>

        <div className="px-5 py-8 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Tienda de personajes
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Explora y elige el compañero que te acompañará en tu día a día.
              </p>
            </div>

            <label className="relative block w-full lg:w-72">
              <span className="sr-only">Ordenar personajes</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <option key={option} value={option}>
                    {sortLabels[option]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </label>
          </header>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,26rem)_auto] lg:items-center">
            <label className="relative block">
              <span className="sr-only">Buscar personajes</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Buscar personajes..."
                className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {sidebarFilters.map(({ id, label }) => {
                const active = activeFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveFilter(id)}
                    className={`h-10 shrink-0 rounded-md px-3 text-sm font-semibold transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredCharacters.length > 0 ? (
            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              {filteredCharacters.map((character) => {
                const installed = installedIds.has(character.id);
                return (
                  <article
                    key={character.id}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                  >
                    <div className={`relative aspect-[1.18] ${character.background}`}>
                      <img
                        src={character.image}
                        alt={`Personaje ${character.name}`}
                        className="absolute inset-0 h-full w-full object-contain p-3"
                      />
                    </div>

                    <div className="px-3 pb-3 pt-2.5">
                      <div className="flex min-h-7 items-center justify-between gap-2">
                        <h2 className="truncate text-sm font-bold text-slate-950">
                          {character.name}
                        </h2>
                        <span
                          className={`shrink-0 rounded-md px-2 py-1 text-[0.68rem] font-semibold leading-none ${tagToneClass[character.tagTone]}`}
                        >
                          {character.tag}
                        </span>
                      </div>

                      <p className="sr-only">{character.category}</p>

                      <button
                        type="button"
                        onClick={() => installCharacter(character)}
                        disabled={installed}
                        className={`mt-2.5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${
                          installed
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-950 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <Download className="h-4 w-4" />
                        {installed ? "Instalado" : "Instalar"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <h2 className="text-lg font-bold text-slate-950">No encontramos personajes</h2>
              <p className="mt-2 text-sm text-slate-600">
                Prueba con otro nombre o cambia el filtro seleccionado.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {["1", "2", "3", "4", "...", "8"].map((page) => (
              <button
                key={page}
                type="button"
                className={`h-10 min-w-10 rounded-md px-3 text-sm font-semibold ${
                  page === "1"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 transition hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <MarketplaceFooter />
      <Toast message={toast} />
    </main>
  );
}

function MarketplaceFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-[92rem]">
        <div className="grid gap-10 lg:grid-cols-[1.55fr_0.7fr_0.7fr_0.7fr_1.7fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <img
                src="/brand/logo-wuju.png"
                alt="Wuju Companion"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-600">
              Wuju Companion transforma la IA en un compañero de escritorio que te
              entiende, te ayuda y crece contigo.
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
                  Suscríbete a nuestro boletín para recibir novedades y actualizaciones.
                </p>
              </div>
            </div>
            <form className="mt-6 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="marketplace-newsletter-email">
                Tu correo electrónico
              </label>
              <input
                id="marketplace-newsletter-email"
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
  );
}
