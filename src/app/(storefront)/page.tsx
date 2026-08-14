import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { getCategories, getFeaturedProducts, getProducts } from "@/actions/storefront.actions";

export const metadata: Metadata = {
  title: "DevWonder Fashion — Your Daily Fashion Companion",
  description:
    "Shop premium heels, luxury bags, flats & sandals. Fast delivery across Bangladesh. Cash on Delivery available.",
};

export default async function HomePage() {
  const [categories, featuredProducts, latestData] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getProducts({ pageSize: 4, sort: "newest" }),
  ]);

  const latestProducts = latestData.products;

  return (
    <>
      {/* ── Hero Banner (Static Placeholder) ── */}
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-pink-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"
          alt="Hero Banner"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-[#E91E8C] font-bold text-sm mb-4 tracking-wide uppercase">
                New Arrival 2026
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                Step Into <span className="text-[#E91E8C]">Elegance</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-md">
                Discover our latest collection of premium heels and luxury bags designed for the modern woman.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#E91E8C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#d8157a] hover:shadow-lg hover:shadow-pink-500/30 transition-all"
              >
                <ShoppingBag className="h-5 w-5" />
                Shop Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Browse our exclusive range of categories tailored for every occasion.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center text-center space-y-3"
              >
                <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border border-pink-100 group-hover:border-[#E91E8C] group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-pink-200 transition-all duration-300">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-pink-300">👠</span>
                  )}
                </div>
                <span className="font-semibold text-gray-800 text-sm group-hover:text-[#E91E8C] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hot Deals (Horizontal Scroll on Mobile) ── */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50 border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#E91E8C] mb-1">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold tracking-wider uppercase text-sm">Featured Selection</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Hot Deals
              </h2>
            </div>
            <Link
              href="/shop?sort=featured"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#E91E8C] hover:text-[#d8157a] hover:underline"
            >
              View all deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={`hot-${product.id}`} 
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
          
          {featuredProducts.length === 0 && (
            <p className="text-center text-gray-500 py-8">No featured products available at the moment.</p>
          )}

          <div className="mt-6 sm:hidden">
             <Link
              href="/shop?sort=featured"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white text-[#E91E8C] border border-pink-200 rounded-xl font-semibold shadow-sm"
            >
              View all deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest Collection ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Latest Arrivals
            </h2>
            <Link
              href="/shop?sort=newest"
              className="text-sm font-semibold text-gray-500 hover:text-[#E91E8C] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {latestProducts.map((product) => (
              <ProductCard 
                key={`latest-${product.id}`} 
                product={{
                  id: product.id,
                  title: product.title,
                  slug: product.slug,
                  image: product.images[0]?.url ?? "/placeholder-product.jpg",
                  price: product.discountedPrice ? Number(product.discountedPrice) : Number(product.price),
                  originalPrice: product.discountedPrice ? Number(product.price) : undefined,
                }} 
              />
            ))}
          </div>
          
          {latestProducts.length === 0 && (
             <p className="text-center text-gray-500 py-8">No products available at the moment.</p>
          )}
        </div>
      </section>

      {/* ── Explore More CTA ── */}
      <section className="py-20 bg-gray-900 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Didn't find what you're looking for?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Explore our complete catalog of hundreds of premium products.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105"
          >
            Explore More Products
          </Link>
        </div>
      </section>
    </>
  );
}
