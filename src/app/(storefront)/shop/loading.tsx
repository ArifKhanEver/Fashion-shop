/**
 * loading.tsx for the /shop route.
 * Next.js automatically shows this while the page server component is resolving.
 * Uses the ShopSkeleton component for a premium, content-aware loading UI.
 */
import ShopSkeleton from "./ShopSkeleton";

export default function ShopLoading() {
  return <ShopSkeleton />;
}
