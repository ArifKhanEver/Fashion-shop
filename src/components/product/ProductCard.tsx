"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, X, Check } from "lucide-react";
import Image from "next/image";
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
    variants?: any[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Filter variants with valid details
  const validVariants = product.variants?.filter(v => v.color || v.size) || [];
  const hasVariants = validVariants.length > 0;

  const colors = Array.from(new Set(validVariants.map(v => v.color).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(validVariants.map(v => v.size).filter(Boolean))) as string[];

  // Find the exact variant based on selection
  const selectedVariant = validVariants.find(
    v => (colors.length === 0 || v.color === selectedColor) && 
         (sizes.length === 0 || v.size === selectedSize)
  );

  // Use variant specific image if available
  const displayImage = selectedVariant?.imageUrl || product.image;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    if (hasVariants) {
      setIsModalOpen(true);
      return;
    }

    // Directly add if no variants
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

  const handleModalAdd = () => {
    if (colors.length > 0 && !selectedColor) {
      return toast({ title: "Error", description: "Please select a color.", variant: "destructive" });
    }
    if (sizes.length > 0 && !selectedSize) {
      return toast({ title: "Error", description: "Please select a size.", variant: "destructive" });
    }

    if (selectedVariant && selectedVariant.stock <= 0) {
      return toast({ title: "Out of Stock", description: "This variant is currently out of stock.", variant: "destructive" });
    }

    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: displayImage,
      slug: product.slug,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
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
    
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* ── Image Wrapper ── */}
        <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-white block">
          {/* Discount Badge */}
          {product.discountPercent && (
            <div className="absolute top-3 left-3 z-10 bg-[#FF6B35] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{product.discountPercent}%
            </div>
          )}
          
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Quick Add overlay (Desktop) */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none md:pointer-events-auto">
            <button 
              onClick={handleQuickAdd}
              className="bg-white/95 backdrop-blur text-gray-900 font-semibold px-6 py-2.5 rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#E91E8C] hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              {hasVariants ? "Select Options" : "Quick Add"}
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

      {/* ── Variant Selection Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-900 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-100">
                  <Image src={displayImage} alt={product.title} fill sizes="96px" className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight mb-1">{product.title}</h3>
                  <div className="text-lg font-bold text-[#E91E8C] mb-2">{formatPrice(product.price)}</div>
                  {selectedVariant && (
                    <div className="text-sm font-medium">
                      {selectedVariant.stock > 0 ? (
                        <span className="text-green-600">{selectedVariant.stock} in stock</span>
                      ) : (
                        <span className="text-red-500">Out of stock</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {colors.length > 0 && (
                <div className="mb-5">
                  <span className="block text-sm font-bold text-gray-900 mb-2">Color</span>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                          selectedColor === color 
                            ? 'border-[#E91E8C] bg-pink-50 text-[#E91E8C]' 
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mb-6">
                  <span className="block text-sm font-bold text-gray-900 mb-2">Size</span>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                          selectedSize === size 
                            ? 'border-[#E91E8C] bg-pink-50 text-[#E91E8C]' 
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleModalAdd}
                disabled={Boolean(selectedVariant && selectedVariant.stock <= 0)}
                className="w-full bg-[#E91E8C] text-white font-bold py-4 rounded-xl hover:bg-[#d8157a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
