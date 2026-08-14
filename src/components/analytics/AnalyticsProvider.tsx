"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// ─── Route-change tracker (client-side SPA navigation) ─────────────────────
function RouteChangeTracker({ gaId, pixelId }: { gaId?: string; pixelId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    // GA4 page_view on SPA navigation
    if (gaId && window.gtag) {
      window.gtag("config", gaId, { page_path: pathname });
    }
    // Meta Pixel PageView on SPA navigation
    if (pixelId && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, gaId, pixelId]);

  return null;
}

// ─── Main Analytics Provider ────────────────────────────────────────────────
export default function AnalyticsProvider({ gaId, pixelId }: { gaId?: string; pixelId?: string }) {
  const hasGA = Boolean(gaId);
  const hasPixel = Boolean(pixelId);

  // Always render in production; skip scripts in dev if IDs are missing
  return (
    <>
      {/* ── Google Analytics 4 ── */}
      {hasGA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                send_page_view: true
              });
            `}
          </Script>
        </>
      )}

      {/* ── Meta (Facebook) Pixel ── */}
      {hasPixel && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* ── SPA Route Change Tracker ── */}
      {(hasGA || hasPixel) && <RouteChangeTracker gaId={gaId} pixelId={pixelId} />}
    </>
  );
}

// ─── Global type augmentation ────────────────────────────────────────────────
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    _fbq?: unknown;
  }
}

// ─── Tracking Event Helpers ──────────────────────────────────────────────────

export function trackViewProduct(params: {
  productId: string;
  productName: string;
  price: number;
}) {
  window.gtag?.("event", "view_item", {
    currency: "BDT",
    value: params.price,
    items: [{ item_id: params.productId, item_name: params.productName, price: params.price }],
  });
  window.fbq?.("track", "ViewContent", {
    content_ids: [params.productId],
    content_name: params.productName,
    value: params.price,
    currency: "BDT",
  });
}

export function trackAddToCart(params: {
  productId: string;
  productName: string;
  price: number;
  quantity?: number;
}) {
  const qty = params.quantity ?? 1;
  window.gtag?.("event", "add_to_cart", {
    currency: "BDT",
    value: params.price * qty,
    items: [{ item_id: params.productId, item_name: params.productName, price: params.price, quantity: qty }],
  });
  window.fbq?.("track", "AddToCart", {
    content_ids: [params.productId],
    content_name: params.productName,
    value: params.price,
    currency: "BDT",
  });
}

export function trackInitiateCheckout(params: { value: number; numItems: number }) {
  window.gtag?.("event", "begin_checkout", { value: params.value, currency: "BDT" });
  window.fbq?.("track", "InitiateCheckout", {
    value: params.value,
    currency: "BDT",
    num_items: params.numItems,
  });
}

export function trackPurchase(params: {
  orderId: string;
  value: number;
  numItems: number;
}) {
  window.gtag?.("event", "purchase", {
    transaction_id: params.orderId,
    value: params.value,
    currency: "BDT",
  });
  window.fbq?.("track", "Purchase", {
    value: params.value,
    currency: "BDT",
    num_items: params.numItems,
  });
}

export function trackSearch(searchTerm: string) {
  window.gtag?.("event", "search", { search_term: searchTerm });
  window.fbq?.("track", "Search", { search_string: searchTerm });
}
