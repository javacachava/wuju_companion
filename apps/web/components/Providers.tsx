"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "@/components/auth/SessionContext";
import { CartProvider } from "@/components/marketplace/CartContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
