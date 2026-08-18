"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    id: 1,
    title: "Your Daily Fashion Companion",
    subtitle: "Style হোক পরিপূর্ণ রঙ ও সৌন্দর্য একসাথে",
    cta: "Shop Collection",
    href: "/shop",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    overlayMode: "dark",
  },
  {
    id: 2,
    title: "Luxury Edit Heels",
    subtitle: "Elevate your style with our premium heel collection",
    cta: "Explore Heels",
    href: "/category/luxury-edit-heels",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&q=80",
    overlayMode: "dark",
  },
  {
    id: 3,
    title: "Luxury Bags Collection",
    subtitle: "Carry confidence in every step you take",
    cta: "Shop Bags",
    href: "/category/luxury-bags",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=1600&q=80",
    overlayMode: "dark",
  },
];

export default function HeroCarousel({ sliderImages }: { sliderImages?: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
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

  // Merge static slide content with dynamic images
  const dynamicSlides = SLIDES.map((slide, i) => ({
    ...slide,
    image: sliderImages && sliderImages[i] ? sliderImages[i] : slide.image,
  }));

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] min-h-[500px] overflow-hidden group">
      <div ref={emblaRef} className="h-full w-full">
        <div className="flex h-full">
          {dynamicSlides.map((slide, index) => (
            <div key={slide.id} className="relative flex-[0_0_100%] h-full">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />
              
              {/* Gradient Overlay for Text Readability */}
              <div 
                className={`absolute inset-0 ${
                  slide.overlayMode === "dark" 
                    ? "bg-gradient-to-r from-black/80 via-black/50 to-transparent" 
                    : "bg-gradient-to-r from-white/90 via-white/60 to-transparent"
                }`}
              />

              {/* Text Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                  <div className={`max-w-xl sm:max-w-2xl transform transition-all duration-700 delay-100 ${
                      selectedIndex === index ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                    }`}
                  >
                    <span className={`inline-block px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase mb-6 ${
                      slide.overlayMode === "dark" ? "bg-white/10 text-white" : "bg-black/10 text-black"
                    }`}>
                      New Arrival
                    </span>
                    <h1 className={`text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight ${
                      slide.overlayMode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {slide.title}
                    </h1>
                    <p className={`text-base sm:text-lg md:text-xl mb-10 font-medium ${
                      slide.overlayMode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.href}
                      className="inline-flex items-center gap-3 bg-[#E91E8C] text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-[#E91E8C] transition-all duration-300 shadow-xl shadow-pink-500/20 text-sm md:text-base group/btn"
                    >
                      {slide.cta}
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white backdrop-blur-md text-white hover:text-black rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white backdrop-blur-md text-white hover:text-black rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {dynamicSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`rounded-full transition-all duration-500 cursor-pointer ${
              i === selectedIndex
                ? "w-8 h-2.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
