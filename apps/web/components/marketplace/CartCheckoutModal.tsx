"use client";

import { useMemo, useState } from "react";
import { CreditCard, Loader2, Lock, X } from "lucide-react";
import {
  detectBrand,
  formatCardNumber,
  formatExpiry,
  validateCard,
  type CardErrors,
} from "@/lib/marketplace/card";
import { formatPrice } from "@/lib/marketplace/format";
import type { CartItem } from "./CartContext";

type CartCheckoutModalProps = {
  open: boolean;
  items: CartItem[];
  totalCents: number;
  processing: boolean;
  serverError: string | null;
  onClose: () => void;
  onPay: () => void;
};

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  desconocida: "",
};

export function CartCheckoutModal({
  open,
  items,
  totalCents,
  processing,
  serverError,
  onClose,
  onPay,
}: CartCheckoutModalProps) {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<CardErrors>({});

  const brand = useMemo(() => detectBrand(number.replace(/\D/g, "")), [number]);
  const isFree = totalCents === 0;

  if (!open) return null;

  const handlePay = () => {
    if (!isFree) {
      const found = validateCard({ number, expiry, cvc, name });
      setErrors(found);
      if (Object.keys(found).length > 0) return;
    }
    onPay();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CreditCard className="h-4 w-4" />
            Checkout
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-3">
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li
                key={`${item.productType}:${item.productId}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate text-slate-700">{item.name}</span>
                <span className="ml-2 shrink-0 text-slate-500">
                  {item.priceCents > 0 ? formatPrice(item.priceCents) : "Gratis"}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-semibold text-slate-900">
            <span>Total</span>
            <span>{totalCents > 0 ? formatPrice(totalCents) : "Gratis"}</span>
          </div>
        </div>

        {serverError ? (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {serverError}
          </div>
        ) : null}

        {!isFree ? (
          <div className="flex flex-col gap-3 px-5 py-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Número de tarjeta
              <div className="relative">
                <input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  value={number}
                  onChange={(event) => setNumber(formatCardNumber(event.target.value))}
                  className={`w-full rounded-lg border px-3 py-2 pr-16 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-200 ${
                    errors.number ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {brand !== "desconocida" ? (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                    {BRAND_LABEL[brand]}
                  </span>
                ) : null}
              </div>
              {errors.number ? <span className="text-red-500">{errors.number}</span> : null}
            </label>

            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
                Vencimiento
                <input
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/AA"
                  value={expiry}
                  onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-200 ${
                    errors.expiry ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.expiry ? <span className="text-red-500">{errors.expiry}</span> : null}
              </label>

              <label className="flex w-24 flex-col gap-1 text-xs font-medium text-slate-600">
                CVC
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={cvc}
                  onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-200 ${
                    errors.cvc ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.cvc ? <span className="text-red-500">{errors.cvc}</span> : null}
              </label>
            </div>

            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Nombre en la tarjeta
              <input
                autoComplete="cc-name"
                placeholder="JUAN PEREZ"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.name ? "border-red-300" : "border-slate-200"
                }`}
              />
              {errors.name ? <span className="text-red-500">{errors.name}</span> : null}
            </label>
          </div>
        ) : null}

        <div className="border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={handlePay}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {processing
              ? "Procesando..."
              : isFree
                ? "Confirmar"
                : `Pagar ${formatPrice(totalCents)}`}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Pago simulado. La tarjeta se valida pero no se envía ni se guarda; no se cobra dinero real.
          </p>
        </div>
      </div>
    </div>
  );
}
