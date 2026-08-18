"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState, useEffect } from "react";

interface CategorySliderProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  }[];
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (categories.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-white relative">
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

        {/* Embla Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 pb-4 touch-pan-y">
              {categories.map((cat) => (
                <div key={cat.id} className="flex-[0_0_96px] min-w-0">
                  <Link
                    href={`/category/${cat.slug}`}
                    className="flex flex-col items-center text-center gap-3 group"
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
                        <ImageIcon className="w-8 h-8 text-pink-300" />
                      )}
                    </div>
                    <span className="font-semibold text-gray-800 text-xs group-hover:text-[#E91E8C] transition-colors leading-tight line-clamp-2 w-full">
                      {cat.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons (hidden on touch, visible on desktop hover or explicitly) */}
          <button
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            className={`absolute left-0 top-10 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#E91E8C] transition-all disabled:opacity-0 disabled:pointer-events-none hidden sm:flex z-10`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
            className={`absolute right-0 top-10 translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#E91E8C] transition-all disabled:opacity-0 disabled:pointer-events-none hidden sm:flex z-10`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
