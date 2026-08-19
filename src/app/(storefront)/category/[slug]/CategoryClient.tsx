"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, ChevronDown, Gem } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Image from "next/image";

interface CategoryClientProps {
  category: any;
  products: any[];
}

export default function CategoryClient({ category, products }: CategoryClientProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(5000);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-[#E91E8C]">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/shop" className="hover:text-[#E91E8C]">Categories</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </div>
      </div>

      {/* ── Category Banner ── */}
      <div className="bg-gradient-to-r from-pink-100 to-rose-50 py-12 border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {category.image ? (
            <Image src={category.image} alt={category.name} width={80} height={80} className="rounded-full object-cover mb-4 border border-pink-200 shadow-sm" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 border border-pink-200 shadow-sm">
              <Gem className="w-10 h-10 text-pink-300" />
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-600 max-w-xl">
            {category.description || `Explore our exclusive collection of ${category.name}. Handpicked for style and comfort.`}
          </p>
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
          {/* Price Filter */}
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
              Showing <span className="text-gray-900">{products.length}</span> products
            </p>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 font-medium">Sort by:</label>
              <div className="relative">
                <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#E91E8C] focus:border-[#E91E8C] block pl-3 pr-8 py-2 cursor-pointer font-medium">
                  <option>Newest Arrivals</option>
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
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
                  image: product.images?.[0]?.url ?? "/placeholder-product.jpg",
                  price: product.discountedPrice ? Number(product.discountedPrice) : Number(product.price),
                  originalPrice: product.discountedPrice ? Number(product.price) : undefined,
                  discountPercent: product.discountedPrice ? Math.round(((Number(product.price) - Number(product.discountedPrice)) / Number(product.price)) * 100) : undefined,
                  variants: product.variants,
                }} 
              />
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">No products found in this category.</p>
              <Link href="/shop" className="text-[#E91E8C] font-semibold hover:underline">Continue Shopping</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
