"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

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
  const [priceRange, setPriceRange] = useState(5000); // Placeholder, actual filter would need backend support for price range

  const sort = searchParams.get("sort") || "newest";
  const categorySlug = searchParams.get("category") || "";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-[#E91E8C]">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">Shop All</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* ── Mobile Filter Toggle ── */}
        <button
          className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border rounded-xl font-medium shadow-sm"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        {/* ── Left Sidebar Filters ── */}
        <aside className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 space-y-8`}>
          {/* Category Filter */}
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-sm">Categories</h3>
            <div className="space-y-3 flex flex-col items-start">
               <Link
                  href="/shop"
                  className={`text-sm ${!categorySlug ? 'text-[#E91E8C] font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Categories
                </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`text-sm ${categorySlug === cat.slug ? 'text-[#E91E8C] font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Price Filter (UI only for now) */}
          <div className="bg-white p-5 rounded-xl border shadow-sm opacity-50">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-sm">Price Range (Coming Soon)</h3>
            <div className="space-y-4">
              <input 
                type="range" 
                min="0" 
                max="10000" 
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#E91E8C]" 
                disabled
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tk 0</span>
                <span className="font-medium text-[#E91E8C]">Up to Tk {priceRange}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border shadow-sm mb-6 gap-4">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900">{products.length}</span> of {totalProducts} products
            </p>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 font-medium">Sort by:</label>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  discountPercent: product.discountedPrice ? Math.round(((Number(product.price) - Number(product.discountedPrice)) / Number(product.price)) * 100) : undefined,
                }} 
              />
            ))}
          </div>
          
          {products.length === 0 && (
             <div className="text-center py-24 text-gray-500">
               No products found.
             </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50" 
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === i + 1 ? 'bg-[#E91E8C] text-white shadow-sm font-bold' : 'border hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
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
