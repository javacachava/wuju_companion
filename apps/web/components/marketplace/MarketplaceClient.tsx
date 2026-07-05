"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { useSession } from "@/components/auth/SessionContext";
import {
  ApiError,
  checkoutCart,
  getCatalog,
  type CatalogProduct,
} from "@/lib/marketplace/api";
import { CartCheckoutModal } from "./CartCheckoutModal";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "./CartContext";
import { ProductCard } from "./ProductCard";
import { Toast } from "./Toast";

type LoadState = "loading" | "ready" | "error";

type Filter = "todo" | "character" | "pack" | "part";

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "todo", label: "Todo" },
  { key: "character", label: "Personajes" },
  { key: "pack", label: "Packs" },
  { key: "part", label: "Partes" },
];

export function MarketplaceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSession();
  const cart = useCart();

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [filter, setFilter] = useState<Filter>("todo");
  const [drawerOpen, setDrawerOpen] = useState(searchParams.get("cart") === "open");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getCatalog();
      setProducts(data);
      setLoadState("ready");
    } catch (error) {
      console.error("[marketplace] catálogo falló", error);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, user]);

  useEffect(() => {
    if (searchParams.get("cart") === "open") {
      setDrawerOpen(true);
      router.replace("/marketplace", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const visible = useMemo(
    () => (filter === "todo" ? products : products.filter((p) => p.productType === filter)),
    [products, filter],
  );

  const handleAdd = useCallback(
    (product: CatalogProduct) => {
      cart.add({
        productType: product.productType,
        productId: product.productId,
        name: product.name,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
        avatar: product.avatar,
      });
      setDrawerOpen(true);
    },
    [cart],
  );

  const handleRemove = useCallback(
    (product: CatalogProduct) => cart.remove(product.productType, product.productId),
    [cart],
  );

  const handlePay = useCallback(async () => {
    setProcessing(true);
    setServerError(null);
    try {
      // Latencia simulada del "procesador de pago".
      await new Promise((resolve) => setTimeout(resolve, 900));
      const result = await checkoutCart(
        cart.items.map(({ productType, productId }) => ({ productType, productId })),
      );
      cart.clear();
      setCheckoutOpen(false);
      setDrawerOpen(false);
      showToast(
        result.totalCents > 0
          ? "Compra confirmada. Todo quedó en tu cuenta."
          : "Listo! Todo quedó en tu cuenta.",
      );
      await load();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login?next=/marketplace");
        return;
      }
      setServerError(error instanceof ApiError ? error.message : "No se pudo completar la compra.");
    } finally {
      setProcessing(false);
    }
  }, [cart, load, router, showToast]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/companion"
            className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al compañero
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Carrito ({cart.items.length})
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Marketplace</h1>
          <p className="mt-1 text-sm text-slate-500">
            Personajes, packs de capacidades y partes de wardrobe. La mayoría gratis; los premium
            con pago simulado por ahora.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                filter === key
                  ? "border-blue-300 bg-blue-50 font-medium text-blue-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {loadState === "loading" ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando catálogo...
        </div>
      ) : null}

      {loadState === "error" ? (
        <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
          No se pudo cargar el marketplace. Recargá la página.
        </div>
      ) : null}

      {loadState === "ready" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard
              key={`${product.productType}:${product.productId}`}
              product={product}
              inCart={cart.has(product.productType, product.productId)}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : null}

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCheckout={() => {
          setServerError(null);
          setCheckoutOpen(true);
        }}
      />
      <CartCheckoutModal
        open={checkoutOpen}
        items={cart.items}
        totalCents={cart.totalCents}
        processing={processing}
        serverError={serverError}
        onClose={() => setCheckoutOpen(false)}
        onPay={() => void handlePay()}
      />
      <Toast message={toast} />
    </main>
  );
}
