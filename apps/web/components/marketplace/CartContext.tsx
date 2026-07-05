"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productType: "part" | "character" | "pack";
  productId: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  avatar: string | null;
};

type CartContextValue = {
  items: CartItem[];
  totalCents: number;
  add: (item: CartItem) => void;
  remove: (productType: string, productId: string) => void;
  clear: () => void;
  has: (productType: string, productId: string) => boolean;
};

const CART_STORAGE_KEY = "companion-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // carrito corrupto: se descarta
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) =>
      prev.some((i) => i.productType === item.productType && i.productId === item.productId)
        ? prev
        : [...prev, item],
    );
  }, []);

  const remove = useCallback((productType: string, productId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productType === productType && i.productId === productId)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback(
    (productType: string, productId: string) =>
      items.some((i) => i.productType === productType && i.productId === productId),
    [items],
  );

  const totalCents = useMemo(() => items.reduce((sum, i) => sum + i.priceCents, 0), [items]);

  return (
    <CartContext.Provider value={{ items, totalCents, add, remove, clear, has }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return context;
}
