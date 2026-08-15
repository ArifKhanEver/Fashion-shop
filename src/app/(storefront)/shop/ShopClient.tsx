"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, SlidersHorizontal, ChevronDown, X, Tag } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

const PRICE_PRESETS = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under Tk 2,000", min: 0, max: 2000 },
  { label: "Tk 2,000 – 4,000", min: 2000, max: 4000 },
  { label: "Tk 4,000 – 6,000", min: 4000, max: 6000 },
  { label: "Above Tk 6,000", min: 6000, max: undefined },
];

interface ShopClientProps {
  products: any[];
  categories: any[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
}

export default function ShopClient({ products, categories, totalProducts, totalPages, currentPage }: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const sort = searchParams.get("sort") || "newest";
  const categorySlug = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;

  // Determine active price preset label for display
  const activePricePreset =
    PRICE_PRESETS.find((p) => p.min === minPrice && p.max === maxPrice) ??
    PRICE_PRESETS[0]!;

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ sort: e.target.value });
  };

  const handleCategoryFilter = (slug: string) => {
    updateParams({ category: slug || undefined });
    setIsMobileFiltersOpen(false);
  };

  const handlePricePreset = (preset: typeof PRICE_PRESETS[0]) => {
    updateParams({
      minPrice: preset.min !== undefined ? String(preset.min) : undefined,
      maxPrice: preset.max !== undefined ? String(preset.max) : undefined,
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/shop");
    setIsMobileFiltersOpen(false);
  };

  const hasActiveFilters = categorySlug || minPrice !== undefined || maxPrice !== undefined;
  const activeCategory = categories.find((c: any) => c.slug === categorySlug);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-[#E91E8C] transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium">Shop All</span>
            {activeCategory && (
              <>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-[#E91E8C] font-semibold">{activeCategory.name}</span>
              </>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col md:flex-row gap-6 md:gap-8">

        {/* ── Mobile Filter Toggle ── */}
        <button
          className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-xl font-semibold shadow-sm text-gray-700 hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors cursor-pointer"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters & Categories
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-[#E91E8C] text-white text-[10px] font-bold flex items-center justify-center">
              {[categorySlug, minPrice !== undefined || maxPrice !== undefined ? "1" : ""].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* ── Left Sidebar Filters ── */}
        <aside className={`${isMobileFiltersOpen ? "block" : "hidden"} md:block w-full md:w-60 shrink-0 space-y-4`}>

          {/* Category Filter */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-xs flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#E91E8C]" /> Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryFilter("")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  !categorySlug
                    ? "bg-pink-50 text-[#E91E8C] font-bold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                All Categories
                <span className="ml-1 text-xs text-gray-400">({totalProducts})</span>
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    categorySlug === cat.slug
                      ? "bg-pink-50 text-[#E91E8C] font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter — Fully Functional */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-xs flex items-center gap-2">
              <span className="text-[#E91E8C]">৳</span> Price Range
            </h3>
            <div className="space-y-1">
              {PRICE_PRESETS.map((preset) => {
                const isActive =
                  preset.min === (minPrice ?? undefined) &&
                  preset.max === (maxPrice ?? undefined);
                return (
                  <button
                    key={preset.label}
                    onClick={() => handlePricePreset(preset)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-pink-50 text-[#E91E8C] font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl">
              <p className="text-xs font-bold text-[#E91E8C] mb-2 uppercase tracking-wide">Active Filters</p>
              <div className="flex flex-wrap gap-2">
                {categorySlug && (
                  <span className="inline-flex items-center gap-1 bg-white text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full border border-pink-200">
                    {activeCategory?.name}
                    <button onClick={() => handleCategoryFilter("")} className="ml-0.5 text-gray-400 hover:text-red-500 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <span className="inline-flex items-center gap-1 bg-white text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full border border-pink-200">
                    {activePricePreset?.label ?? "Custom Range"}
                    <button onClick={() => handlePricePreset(PRICE_PRESETS[0]!)} className="ml-0.5 text-gray-400 hover:text-red-500 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 gap-4">
            <p className="text-sm text-gray-500 font-medium">
              {hasActiveFilters ? (
                <>
                  <span className="text-gray-900 font-bold">{products.length}</span> of{" "}
                  <span className="text-gray-900">{totalProducts}</span> filtered results
                </>
              ) : (
                <>
                  Showing <span className="text-gray-900 font-bold">{products.length}</span> of{" "}
                  <span className="text-gray-900">{totalProducts}</span> products
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 font-medium whitespace-nowrap">Sort by:</label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#E91E8C] focus:border-[#E91E8C] block pl-3 pr-8 py-2 cursor-pointer font-medium"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    title: product.title,
                    slug: product.slug,
                    image: product.images[0]?.url ?? "/placeholder-product.jpg",
                    price: product.discountedPrice ? Number(product.discountedPrice) : Number(product.price),
                    originalPrice: product.discountedPrice ? Number(product.price) : undefined,
                    discountPercent: product.discountedPrice
                      ? Math.round(((Number(product.price) - Number(product.discountedPrice)) / Number(product.price)) * 100)
                      : undefined,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 bg-[#E91E8C] text-white font-bold px-6 py-3 rounded-full hover:bg-[#d8157a] transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors ${
                    currentPage === i + 1
                      ? "bg-[#E91E8C] text-white shadow-sm"
                      : "border hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
