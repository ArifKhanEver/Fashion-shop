import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";

// Force all pages to be dynamically rendered — DB is only available at runtime
export const dynamic = "force-dynamic";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { Toaster } from "@/components/ui/toaster";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { getSetting } from "@/lib/site-settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "DevWonder Fashion — Your Daily Fashion Companion",
    template: "%s | DevWonder Fashion",
  },
  description:
    "Discover premium heels, luxury bags, flats & sandals at DevWonder Fashion. Your daily fashion companion in Bangladesh.",
  keywords: ["heels", "luxury bags", "sandals", "fashion", "Bangladesh", "DevWonder Fashion"],
  openGraph: {
    title: "DevWonder Fashion — Your Daily Fashion Companion",
    description: "Premium fashion accessories delivered across Bangladesh.",
    type: "website",
    locale: "en_BD",
    siteName: "DevWonder Fashion",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevWonder Fashion — Your Daily Fashion Companion",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = await getSetting("ga_measurement_id", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "");
  const pixelId = await getSetting("meta_pixel_id", process.env.NEXT_PUBLIC_META_PIXEL_ID || "");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <CartProvider>
          <AnalyticsProvider gaId={gaId} pixelId={pixelId} />
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
