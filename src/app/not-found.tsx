import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Search, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | DevWonder Fashion",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E91E8C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-rose-200/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Giant 404 with gradient */}
        <div className="mb-4 select-none">
          <span
            className="text-[180px] sm:text-[220px] font-black leading-none"
            style={{
              background: "linear-gradient(135deg, #E91E8C 0%, #ff6b9d 50%, #E91E8C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: 0.15,
            }}
          >
            404
          </span>
        </div>

        {/* Content overlaid on number */}
        <div className="-mt-20 sm:-mt-28 relative z-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-pink-100 border border-pink-100 mb-6">
            <ShoppingBag className="w-10 h-10 text-[#E91E8C]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-500 text-base sm:text-lg mb-10 max-w-sm mx-auto">
            Looks like this page wandered off! The item you&apos;re looking for may have been moved, or simply doesn&apos;t exist.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#E91E8C] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[#d8157a] hover:shadow-xl hover:shadow-pink-300/40 transition-all hover:scale-105"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-2 bg-white text-gray-700 font-bold px-7 py-3.5 rounded-full border border-gray-200 hover:border-[#E91E8C] hover:text-[#E91E8C] hover:shadow-md transition-all"
            >
              <Search className="w-4 h-4" />
              Explore Shop
            </Link>
          </div>

          {/* Popular Links */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Popular Pages
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { label: "Luxury Heels", href: "/category/luxury-heels" },
                { label: "Designer Bags", href: "/category/designer-bags" },
                { label: "New Arrivals", href: "/shop?sort=newest" },
                { label: "Hot Deals", href: "/shop?sort=featured" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#E91E8C] hover:underline font-medium bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100 hover:bg-pink-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
