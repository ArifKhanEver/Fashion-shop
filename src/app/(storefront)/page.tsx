import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, ShoppingBag, Zap, Star } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import HeroCarousel from "@/components/home/HeroCarousel";
import { getCategories, getFeaturedProducts, getProducts } from "@/actions/storefront.actions";
import { getGlobalStoreSettings } from "@/actions/store-settings.actions";

export const metadata: Metadata = {
  title: "DevWonder Fashion — Your Daily Fashion Companion",
  description:
    "Shop premium heels, luxury bags, flats & sandals. Fast delivery across Bangladesh. Cash on Delivery available.",
};

export default async function HomePage() {
  const [categories, featuredProducts, latestData, settings] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getProducts({ pageSize: 4, sort: "newest" }),
    getGlobalStoreSettings(),
  ]);

  const latestProducts = latestData.products;

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
              <ShoppingBag className="h-4 w-4" /> Delivery Across Bangladesh
            </span>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-pink-50 text-[#E91E8C] font-bold text-xs tracking-widest uppercase mb-3">
              Collections
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
              Browse our exclusive range of categories tailored for every occasion.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center text-center space-y-3 cursor-pointer"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border-2 border-pink-100 group-hover:border-[#E91E8C] group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-pink-200/60 transition-all duration-300">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👠</span>
                  )}
                </div>
                <span className="font-semibold text-gray-800 text-xs sm:text-sm group-hover:text-[#E91E8C] transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
            {categories.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-8">No categories found.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Hot Deals ── */}
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

      {/* ── Latest Collection ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <span className="inline-block text-[#E91E8C] text-xs font-bold tracking-widest uppercase mb-2">Just In</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
                Latest Arrivals
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
