// Typed analytics event helpers for GA4 and Meta Pixel

// ─── GA4 ─────────────────────────────────────────────────────
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function gtagEvent(
  action: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  }
}

export const GA = {
  viewItem: (productId: string, productName: string, price: number) =>
    gtagEvent("view_item", {
      item_id: productId,
      item_name: productName,
      value: price,
      currency: "BDT",
    }),

  addToCart: (productId: string, productName: string, price: number, quantity: number) =>
    gtagEvent("add_to_cart", {
      item_id: productId,
      item_name: productName,
      value: price * quantity,
      currency: "BDT",
      quantity,
    }),

  beginCheckout: (value: number) =>
    gtagEvent("begin_checkout", { value, currency: "BDT" }),

  purchase: (orderId: string, value: number) =>
    gtagEvent("purchase", { transaction_id: orderId, value, currency: "BDT" }),

  search: (searchTerm: string) =>
    gtagEvent("search", { search_term: searchTerm }),
};

// ─── Meta Pixel ──────────────────────────────────────────────
export function pixelEvent(
  event: string,
  params?: Record<string, string | number>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}

export const Pixel = {
  viewContent: (productId: string, productName: string, price: number) =>
    pixelEvent("ViewContent", {
      content_ids: productId,
      content_name: productName,
      value: price,
      currency: "BDT",
    }),

  addToCart: (productId: string, productName: string, price: number) =>
    pixelEvent("AddToCart", {
      content_ids: productId,
      content_name: productName,
      value: price,
      currency: "BDT",
    }),

  initiateCheckout: (value: number) =>
    pixelEvent("InitiateCheckout", { value, currency: "BDT" }),

  purchase: (orderId: string, value: number) =>
    pixelEvent("Purchase", { value, currency: "BDT" }),

  search: (searchTerm: string) =>
    pixelEvent("Search", { search_string: searchTerm }),
};
