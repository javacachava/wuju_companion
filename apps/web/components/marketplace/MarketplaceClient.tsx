"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Coins, Loader2 } from "lucide-react";
import {
  acquirePart,
  getMarketplaceParts,
  getWallet,
  InsufficientFundsError,
  type MarketplacePart,
} from "@/lib/marketplace/api";
import { FILTERS, isMarketplaceFilter, type MarketplaceFilter } from "./partMeta";
import { PartCard } from "./PartCard";
import { PartDetailModal } from "./PartDetailModal";
import { CheckoutModal } from "./CheckoutModal";
import { Toast } from "./Toast";

const CHARACTER_ID_KEY = "characterId";

type LoadState = "loading" | "ready" | "error";

export function MarketplaceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [characterId, setCharacterId] = useState<string | null>(null);
  const [parts, setParts] = useState<MarketplacePart[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [coins, setCoins] = useState<number>(0);
  const [selected, setSelected] = useState<MarketplacePart | null>(null);
  const [checkoutPart, setCheckoutPart] = useState<MarketplacePart | null>(null);
  const [acquiring, setAcquiring] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filter: MarketplaceFilter = isMarketplaceFilter(searchParams.get("category"))
    ? (searchParams.get("category") as MarketplaceFilter)
    : "todo";

  useEffect(() => {
    setCharacterId(localStorage.getItem(CHARACTER_ID_KEY));
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoadState("loading");
      try {
        const [data, wallet] = await Promise.all([
          getMarketplaceParts(characterId ?? undefined),
          characterId ? getWallet(characterId) : Promise.resolve(0),
        ]);
        if (!active) return;
        setParts(data);
        setCoins(wallet);
        setLoadState("ready");
      } catch (error) {
        console.error("[marketplace] no se pudo cargar el catálogo", error);
        if (!active) return;
        setLoadState("error");
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [characterId]);

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

  const setFilter = useCallback(
    (next: MarketplaceFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "todo") {
        params.delete("category");
      } else {
        params.set("category", next);
      }
      const query = params.toString();
      router.replace(query ? `/marketplace?${query}` : "/marketplace", { scroll: false });
    },
    [router, searchParams],
  );

  const visibleParts = useMemo(
    () => (filter === "todo" ? parts : parts.filter((part) => part.category === filter)),
    [parts, filter],
  );

  const finishAcquisition = useCallback(
    (part: MarketplacePart, nextCoins: number) => {
      setCoins(nextCoins);
      setParts((prev) => prev.filter((item) => item.id !== part.id));
      showToast("Agregado! Ya está en tu wardrobe.");
    },
    [showToast],
  );

  // Parte gratis: sin checkout, se agrega directo.
  const handleAcquireFree = useCallback(
    async (part: MarketplacePart) => {
      if (!characterId) return;
      setAcquiring(true);
      try {
        const { coins: nextCoins } = await acquirePart(characterId, part.id);
        setSelected(null);
        finishAcquisition(part, nextCoins);
      } catch (error) {
        console.error("[marketplace] no se pudo agregar la parte gratis", error);
        showToast("No se pudo agregar. Probá de nuevo.");
      } finally {
        setAcquiring(false);
      }
    },
    [characterId, finishAcquisition, showToast],
  );

  const openCheckout = useCallback((part: MarketplacePart) => {
    setSelected(null);
    setServerError(null);
    setCheckoutPart(part);
  }, []);

  // Parte de pago: se dispara desde el checkout tras validar la tarjeta.
  const handlePay = useCallback(
    async (part: MarketplacePart) => {
      if (!characterId) return;
      setProcessing(true);
      setServerError(null);
      try {
        // Latencia simulada de "procesar el pago".
        await new Promise((resolve) => setTimeout(resolve, 900));
        const { coins: nextCoins } = await acquirePart(characterId, part.id);
        setCheckoutPart(null);
        finishAcquisition(part, nextCoins);
      } catch (error) {
        if (error instanceof InsufficientFundsError) {
          setCoins(error.coins);
          setServerError(
            `Saldo insuficiente: tenés ${error.coins} y la parte cuesta ${error.price} monedas.`,
          );
        } else {
          console.error("[marketplace] el pago falló", error);
          setServerError("No se pudo procesar el pago. Probá de nuevo.");
        }
      } finally {
        setProcessing(false);
      }
    },
    [characterId, finishAcquisition],
  );

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
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700"
            title="Monedas de demo — moneda in-app, no dinero real"
          >
            <Coins className="h-4 w-4" />
            {coins}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Marketplace del Compañero
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sumá partes a tu wardrobe. El saldo se valida de verdad; el cobro es de demo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? "border-blue-300 bg-blue-50 font-medium text-blue-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            );
          })}
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
        visibleParts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleParts.map((part) => (
              <PartCard key={part.id} part={part} onSelect={setSelected} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
            Ya tenés todo lo de esta categoría. Probá otro filtro.
          </div>
        )
      ) : null}

      <PartDetailModal
        part={selected}
        acquiring={acquiring}
        canAcquire={Boolean(characterId)}
        onClose={() => setSelected(null)}
        onAcquireFree={handleAcquireFree}
        onCheckout={openCheckout}
      />
      <CheckoutModal
        part={checkoutPart}
        coins={coins}
        processing={processing}
        serverError={serverError}
        onClose={() => setCheckoutPart(null)}
        onPay={handlePay}
      />
      <Toast message={toast} />
    </main>
  );
}
