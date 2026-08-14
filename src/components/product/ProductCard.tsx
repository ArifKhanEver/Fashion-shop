"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/hooks/use-toast";
import { trackAddToCart } from "@/components/analytics/AnalyticsProvider";

export interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    discountPercent?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.image,
      slug: product.slug,
    });
    
    trackAddToCart({
      productId: product.id,
      productName: product.title,
      price: product.price,
      quantity: 1,
    });

    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`,
      duration: 3000,
    });
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* ── Image Wrapper ── */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-white block">
        {/* Discount Badge */}
        {product.discountPercent && (
          <div className="absolute top-3 left-3 z-10 bg-[#FF6B35] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            -{product.discountPercent}%
          </div>
        )}
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick Add overlay (Desktop) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none md:pointer-events-auto">
          <button 
            onClick={handleQuickAdd}
            className="bg-white/95 backdrop-blur text-gray-900 font-semibold px-6 py-2.5 rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#E91E8C] hover:text-white flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Quick Add
          </button>
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`} className="mb-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#E91E8C] transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-center gap-2">
          <span className="text-base font-bold text-[#E91E8C]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
