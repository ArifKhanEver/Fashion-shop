"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, SlidersHorizontal, ChevronDown, X, Tag, Search } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

// ─── Price Preset Options ─────────────────────────────────────────────────────

/**
 * Predefined price range buckets shown in the sidebar filter.
 * The first entry ("All Prices") has no min/max, which clears the price filter.
 */
const PRICE_PRESETS = [
  { label: "All Prices",       min: undefined, max: undefined },
  { label: "Under Tk 2,000",   min: 0,         max: 2000      },
  { label: "Tk 2,000 – 4,000", min: 2000,      max: 4000      },
  { label: "Tk 4,000 – 6,000", min: 4000,      max: 6000      },
  { label: "Above Tk 6,000",   min: 6000,      max: undefined },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopClientProps {
  products: any[];
  categories: any[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  initialSearchQuery?: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Calculates the discount percentage to display on a product card.
 * Returns undefined if the product has no discounted price.
 */
function getDiscountPercent(price: number, discountedPrice?: number): number | undefined {
  if (!discountedPrice) return undefined;
  return Math.round(((price - discountedPrice) / price) * 100);
}

/**
 * Converts a raw product from the DB into the shape expected by <ProductCard>.
 * Extracts the first image, resolves the effective price, and computes the
 * discount percentage so the card doesn't need to do any math.
 */
function toProductCardProps(product: any) {
  const hasDiscount = Boolean(product.discountedPrice);
  const effectivePrice = hasDiscount
    ? Number(product.discountedPrice)
    : Number(product.price);

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    image: product.images[0]?.url ?? "/placeholder-product.jpg",
    price: effectivePrice,
    originalPrice: hasDiscount ? Number(product.price) : undefined,
    discountPercent: getDiscountPercent(Number(product.price), product.discountedPrice),
  };
}

/**
 * Returns the CSS classes for a sidebar filter button,
 * switching between "active" (pink) and "inactive" (gray) styles.
 */
function getFilterButtonClass(isActive: boolean): string {
  const base = "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer";
  if (isActive) {
    return `${base} bg-pink-50 text-[#E91E8C] font-bold`;
  }
  return `${base} text-gray-600 hover:bg-gray-50 hover:text-gray-900`;
}

/**
 * Returns the CSS classes for a pagination page button,
 * switching between the current-page (pink, filled) and inactive styles.
 */
function getPageButtonClass(isCurrentPage: boolean): string {
  const base = "px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors";
  if (isCurrentPage) {
    return `${base} bg-[#E91E8C] text-white shadow-sm`;
  }
  return `${base} border hover:bg-gray-50 text-gray-700`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopClient({
  products,
  categories,
  totalProducts,
  totalPages,
  currentPage,
  initialSearchQuery = "",
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  // Local search input state — only committed to URL on form submit
  const [searchInput, setSearchInput] = useState(initialSearchQuery);

  // Read the active filter state from the URL so that filter state is
  // bookmark-able and shareable (e.g., /shop?category=luxury-bags&minPrice=2000)
  const sort = searchParams.get("sort") || "newest";
  const categorySlug = searchParams.get("category") || "";
  const searchQuery = searchParams.get("q") || "";
  const minPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice")!)
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice")!)
    : undefined;

  // Find which price preset label matches the current URL params for display
  const activePricePreset =
    PRICE_PRESETS.find((preset) => preset.min === minPrice && preset.max === maxPrice) ??
    PRICE_PRESETS[0]!;

  const hasActiveFilters =
    Boolean(categorySlug) || minPrice !== undefined || maxPrice !== undefined || Boolean(searchQuery);

  const activeCategory = categories.find((cat: any) => cat.slug === categorySlug);

  // ─── URL Update Helper ───────────────────────────────────────────────────
  // All filter changes go through this function so the URL is always the
  // single source of truth for filter state. The page is reset to 1
  // whenever any filter changes to avoid showing an empty results page.
  function updateFilterParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    router.push(`/shop?${params.toString()}`);
  }

  // ─── Event Handlers ──────────────────────────────────────────────────────

  function handleSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    updateFilterParams({ sort: event.target.value });
  }

  function handleCategoryFilter(slug: string) {
    updateFilterParams({ category: slug || undefined });
    setIsMobileFiltersOpen(false);
  }

  function handlePricePreset(preset: (typeof PRICE_PRESETS)[0]) {
    updateFilterParams({
      minPrice: preset.min !== undefined ? String(preset.min) : undefined,
      maxPrice: preset.max !== undefined ? String(preset.max) : undefined,
    });
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/shop?${params.toString()}`);
  }

  function clearAllFilters() {
    setSearchInput("");
    router.push("/shop");
    setIsMobileFiltersOpen(false);
  }

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      updateFilterParams({ q: searchInput.trim() || undefined });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchInput, searchParams]
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-50 min-h-screen pb-24">

      {/* ── Breadcrumb & Clear Filters Bar ── */}
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

        {/* ── Mobile Filter Toggle Button (hidden on md+) ── */}
        <button
          className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-xl font-semibold shadow-sm text-gray-700 hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors cursor-pointer"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters &amp; Categories
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-[#E91E8C] text-white text-[10px] font-bold flex items-center justify-center">
              {[categorySlug, minPrice !== undefined || maxPrice !== undefined ? "1" : ""].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* ── Left Sidebar (hidden on mobile unless toggled) ── */}
        <aside className={`${isMobileFiltersOpen ? "block" : "hidden"} md:block w-full md:w-60 shrink-0 space-y-4`}>

          {/* Category Filter */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-xs flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#E91E8C]" /> Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryFilter("")}
                className={getFilterButtonClass(!categorySlug)}
              >
                All Categories
                <span className="ml-1 text-xs text-gray-400">({totalProducts})</span>
              </button>

              {categories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={getFilterButtonClass(categorySlug === category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
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
                    className={getFilterButtonClass(isActive)}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filter Chips — shows what is currently applied */}
          {hasActiveFilters && (
            <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl">
              <p className="text-xs font-bold text-[#E91E8C] mb-2 uppercase tracking-wide">
                Active Filters
              </p>
              <div className="flex flex-wrap gap-2">
                {categorySlug && (
                  <span className="inline-flex items-center gap-1 bg-white text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full border border-pink-200">
                    {activeCategory?.name}
                    <button
                      onClick={() => handleCategoryFilter("")}
                      className="ml-0.5 text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <span className="inline-flex items-center gap-1 bg-white text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full border border-pink-200">
                    {activePricePreset?.label ?? "Custom Range"}
                    <button
                      onClick={() => handlePricePreset(PRICE_PRESETS[0]!)}
                      className="ml-0.5 text-gray-400 hover:text-red-500 cursor-pointer"
                    >
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

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products by name..."
                className="w-full pl-11 pr-24 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] text-sm shadow-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E91E8C] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#d8157a] transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Sort & Results Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 gap-4">
            <p className="text-sm text-gray-500 font-medium">
              {hasActiveFilters || searchQuery ? (
                <>
                  <span className="text-gray-900 font-bold">{products.length}</span>
                  {" "}of{" "}
                  <span className="text-gray-900">{totalProducts}</span>
                  {searchQuery ? (
                    <> results for <span className="text-[#E91E8C] font-bold">&ldquo;{searchQuery}&rdquo;</span></>
                  ) : " filtered results"}
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="text-gray-900 font-bold">{products.length}</span>
                  {" "}of{" "}
                  <span className="text-gray-900">{totalProducts}</span> products
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 font-medium whitespace-nowrap">
                Sort by:
              </label>
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

          {/* Product Grid or Empty State */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={toProductCardProps(product)}
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

              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={getPageButtonClass(currentPage === index + 1)}
                >
                  {index + 1}
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
