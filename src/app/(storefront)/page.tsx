import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, ShoppingBag, Zap, Star, TrendingUp, Gift, Clock } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import HeroCarousel from "@/components/home/HeroCarousel";
import CategorySlider from "@/components/home/CategorySlider";
import { getCategories, getFeaturedProducts, getProducts } from "@/actions/storefront.actions";
import { getGlobalStoreSettings } from "@/actions/store-settings.actions";

export const metadata: Metadata = {
  title: "DevWonder Fashion — Your Daily Fashion Companion",
  description:
    "Shop premium heels, luxury bags, flats & sandals. Fast delivery across Bangladesh. Cash on Delivery available.",
};

export default async function HomePage() {
  const [categories, featuredProducts, latestData, trendingData, settings] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProducts({ pageSize: 4, sort: "newest" }),
    getProducts({ pageSize: 4, sort: "price_desc" }),
    getGlobalStoreSettings(),
  ]);

  const latestProducts = latestData.products;
  const trendingProducts = trendingData.products;

  return (
    <>
      {/* ── Hero Carousel ── */}
      <section className="w-full">
        <HeroCarousel sliderImages={settings.sliderImages as string[] | undefined} />
      </section>

      {/* ── Trust Bar ── */}
      <section className="bg-[#E91E8C] text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold tracking-wide">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Cash on Delivery Available
            </span>
            <span className="hidden sm:block text-pink-200">|</span>
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4" /> Premium Quality Guaranteed
            </span>
            <span className="hidden sm:block text-pink-200">|</span>
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Fast Delivery Across Bangladesh
            </span>
            <span className="hidden sm:block text-pink-200">|</span>
            <span className="flex items-center gap-2">
              <Gift className="h-4 w-4" /> Free Gift Wrapping on Orders ৳3,000+
            </span>
          </div>
        </div>
      </section>

      {/* ── Category Horizontal Slider ── */}
      <CategorySlider categories={categories} />

      {/* ── Special Offer Banner ── */}
      <section className="mx-4 sm:mx-6 lg:mx-auto lg:max-w-7xl my-2 rounded-3xl overflow-hidden">
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-[#E91E8C] text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full border-4 border-white" />
            <div className="absolute -right-20 top-20 w-48 h-48 rounded-full border-4 border-white" />
          </div>

          <div className="relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4">
              <Gift className="h-3.5 w-3.5" /> Limited Time Offer
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Get 15% OFF Your First Order!</h2>
            <p className="text-white/80 text-base md:text-lg max-w-lg">
              Use code <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold tracking-wider">WELCOME15</span> at checkout. Valid on orders above ৳2,000.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-[#E91E8C] font-extrabold px-8 py-4 rounded-full hover:bg-pink-50 transition-all hover:scale-105 shadow-lg text-sm"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Hot Deals (Featured) ── */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-pink-50 to-rose-50 border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 text-[#E91E8C] mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold tracking-wider uppercase text-xs sm:text-sm">Featured Selection</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
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
            {featuredProducts.slice(0, 4).map((product) => (
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

          <div className="mt-8 sm:hidden">
            <Link
              href="/shop?sort=featured"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-[#E91E8C] border-2 border-pink-200 rounded-2xl font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              View all deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trending Now ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-bold tracking-wider uppercase text-xs sm:text-sm">Premium Picks</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
                Trending Now
              </h2>
            </div>
            <Link
              href="/shop?sort=price_desc"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#E91E8C] hover:underline"
            >
              Explore all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard
                key={`trending-${product.id}`}
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
          {trendingProducts.length === 0 && (
            <p className="text-center text-gray-500 py-8">No trending products at the moment.</p>
          )}
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-bold tracking-wider uppercase text-xs sm:text-sm">Just In</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop?sort=newest"
              className="text-sm font-semibold text-gray-500 hover:text-[#E91E8C] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
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

      {/* ── USP Feature Grid ── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: "🚚", title: "Fast Delivery", desc: "Dhaka: 1-2 days | Outside: 3-5 days" },
              { emoji: "💳", title: "Cash on Delivery", desc: "Pay when you receive your order" },
              { emoji: "🔄", title: "Easy Returns", desc: "3-day hassle-free return policy" },
              { emoji: "🏆", title: "Premium Quality", desc: "Every item is quality-checked" },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-pink-50 hover:shadow-md transition-all group">
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#E91E8C] transition-colors">{feature.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore More CTA ── */}
      <section className="py-20 sm:py-28 bg-gray-900 text-center px-4 relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#E91E8C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/70 font-bold text-xs tracking-widest uppercase mb-6">
            Explore More
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5">
            Didn&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Explore our complete catalog of hundreds of premium products.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#E91E8C] text-white px-10 py-4 rounded-full font-bold hover:bg-[#d8157a] hover:shadow-2xl hover:shadow-pink-500/40 transition-all hover:scale-105 text-base"
          >
            <ShoppingBag className="h-5 w-5" />
            Explore All Products
          </Link>
        </div>
      </section>
    </>
  );
}
