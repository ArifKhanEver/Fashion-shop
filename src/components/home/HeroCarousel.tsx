"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    id: 1,
    title: "Your Daily Fashion Companion",
    subtitle: "Style হোক পরিপূর্ণ রঙ ও সৌন্দর্য একসাথে",
    cta: "Shop Now",
    href: "/shop",
    bgColor: "#E91E8C",
    textColor: "white",
    image: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
  },
  {
    id: 2,
    title: "Luxury Edit Heels",
    subtitle: "Elevate your style with our premium heel collection",
    cta: "Explore Heels",
    href: "/category/luxury-edit-heels",
    bgColor: "#1a1a2e",
    textColor: "white",
    image: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
  },
  {
    id: 3,
    title: "Luxury Bags Collection",
    subtitle: "Carry confidence in every step you take",
    cta: "Shop Bags",
    href: "/category/luxury-bags",
    bgColor: "#2d1b69",
    textColor: "white",
    image: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
  },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="relative flex-none w-full min-h-[380px] sm:min-h-[480px] md:min-h-[560px] flex items-center"
              style={{ backgroundColor: slide.bgColor }}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 w-full">
                <div className="max-w-lg">
                  <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 uppercase tracking-wide"
                    style={{ color: slide.textColor }}
                  >
                    {slide.title}
                  </h1>
                  <p className="text-sm sm:text-base mb-8 text-white/80">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 bg-white text-[#E91E8C] font-bold px-7 py-3 rounded-full hover:bg-pink-50 transition-colors shadow-lg text-sm"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>

              {/* Product Image (decorative) */}
              <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden md:flex items-end justify-center opacity-90">
                <div className="relative w-full h-full max-w-sm">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-contain object-bottom drop-shadow-2xl"
                    unoptimized
                    priority={slide.id === 1}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === selectedIndex
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
