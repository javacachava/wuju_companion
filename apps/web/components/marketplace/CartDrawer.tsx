"use client";

import Link from "next/link";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { useSession } from "@/components/auth/SessionContext";
import { formatPrice } from "@/lib/marketplace/format";
import { useCart } from "./CartContext";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { items, totalCents, remove } = useCart();
  const { user } = useSession();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrito">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ShoppingCart className="h-4 w-4" />
            Carrito ({items.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar carrito"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500">
              El carrito está vacío. Agregá personajes, packs o partes del catálogo.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={`${item.productType}:${item.productId}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.priceCents > 0 ? formatPrice(item.priceCents) : "Gratis"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.productType, item.productId)}
                    className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Quitar ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Total</span>
            <span className="font-semibold text-slate-900">
              {totalCents > 0 ? formatPrice(totalCents) : "Gratis"}
            </span>
          </div>

          {user ? (
            <button
              type="button"
              onClick={onCheckout}
              disabled={items.length === 0}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {totalCents > 0 ? `Pagar ${formatPrice(totalCents)}` : "Obtener gratis"}
            </button>
          ) : (
            <Link
              href="/login?next=/marketplace"
              className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Ingresá para comprar
            </Link>
          )}
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Pago simulado — no se cobra dinero real todavía.
          </p>
        </div>
      </aside>
    </div>
  );
}
