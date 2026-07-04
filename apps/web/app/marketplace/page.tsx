import { Suspense } from "react";
import { MarketplaceClient } from "@/components/marketplace/MarketplaceClient";

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceClient />
    </Suspense>
  );
}
