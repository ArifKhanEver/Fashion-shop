"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  User,
  Search,
  Truck,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { name: "CLEARANCE SALE!!!", slug: "clearance-sale" },
  { name: "LUXURY EDIT HEELS", slug: "luxury-edit-heels" },
  { name: "LUXURY BAGS", slug: "luxury-bags" },
  { name: "PARTY CLUTCH", slug: "party-clutch" },
  { name: "FLATS & SANDALS", slug: "flats-sandals" },
  { name: "Z-STYLE HEELS", slug: "z-style-heels" },
];

export default function Header() {
  const { itemCount } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
      }
    },
    [searchQuery, router]
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* ── Top Bar ───────────────────────────────────────── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-[#E91E8C] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight">
                  <span className="text-[#E91E8C]">DEVWONDER</span>
                  <span className="text-gray-900"> FASHION</span>
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-[#E91E8C] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium text-gray-700 hover:text-[#E91E8C] transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-700 hover:text-[#E91E8C] transition-colors"
              >
                About Us
              </Link>
            </nav>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex flex-1 max-w-md items-center"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="search"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Icon Actions */}
            <div className="flex items-center gap-1">
              <Link
                href="/wishlist"
                className="p-2 text-gray-600 hover:text-[#E91E8C] transition-colors rounded-full hover:bg-pink-50"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href="/track-order"
                className="p-2 text-gray-600 hover:text-[#E91E8C] transition-colors rounded-full hover:bg-pink-50 hidden sm:block"
                aria-label="Track Order"
              >
                <Truck className="h-5 w-5" />
              </Link>
              <Link
                href="/cart"
                className="p-2 text-gray-600 hover:text-[#E91E8C] transition-colors rounded-full hover:bg-pink-50 relative"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#E91E8C] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
              <Link
                href="/admin"
                className="p-2 text-gray-600 hover:text-[#E91E8C] transition-colors rounded-full hover:bg-pink-50 hidden sm:block"
                aria-label="Admin"
              >
                <User className="h-5 w-5" />
              </Link>
              {/* Mobile menu toggle */}
              <button
                className="p-2 md:hidden text-gray-600 hover:text-[#E91E8C] cursor-pointer"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Strip ────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2.5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="text-xs font-semibold tracking-wider text-gray-600 hover:text-[#E91E8C] whitespace-nowrap transition-colors uppercase"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b shadow-lg px-4 py-4 flex flex-col gap-3">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="search"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
            />
          </form>
          <nav className="flex flex-col gap-2">
            {["Home", "Shop", "About Us", "Track Order"].map((item) => (
              <Link
                key={item}
                href={
                  item === "Home"
                    ? "/"
                    : item === "Track Order"
                    ? "/track-order"
                    : `/${item.toLowerCase().replace(" ", "-")}`
                }
                className="text-sm font-medium text-gray-700 py-1.5 hover:text-[#E91E8C] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="border-t pt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="text-xs font-semibold bg-gray-50 px-3 py-1 rounded-full text-gray-600 hover:bg-pink-50 hover:text-[#E91E8C] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
