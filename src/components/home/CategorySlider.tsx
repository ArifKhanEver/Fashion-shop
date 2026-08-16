"use client";

import Link from "next/link";

interface CategorySliderProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  }[];
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-pink-50 text-[#E91E8C] font-bold text-xs tracking-widest uppercase mb-2">
              Collections
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Shop by Category</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#E91E8C] hover:underline"
          >
            All Categories →
          </Link>
        </div>

        {/* Horizontal Scroll Container — hidden scrollbar but draggable */}
        <div className="flex gap-5 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex-none snap-start flex flex-col items-center text-center gap-3 group"
              style={{ width: "96px" }}
            >
              <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border-2 border-pink-100 group-hover:border-[#E91E8C] group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-pink-200/60 transition-all duration-300 shrink-0">
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-3xl">👠</span>
                )}
              </div>
              <span className="font-semibold text-gray-800 text-xs group-hover:text-[#E91E8C] transition-colors leading-tight line-clamp-2 w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
