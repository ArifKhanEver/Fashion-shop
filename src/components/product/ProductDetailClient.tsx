"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Heart, Share2, Minus, Plus, ShoppingCart, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/hooks/use-toast";
import { trackAddToCart } from "@/components/analytics/AnalyticsProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProductDetailClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const validVariants = product.variants?.filter((v: any) => v.color || v.size) || [];
  const colors = Array.from(new Set(validVariants.map((v: any) => v.color).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(validVariants.map((v: any) => v.size).filter(Boolean))) as string[];

  const [activeImage, setActiveImage] = useState(product.images?.[0]?.url || "/placeholder-product.jpg");
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null);
  const [quantity, setQuantity] = useState(1);

  // Find exact variant
  const selectedVariant = validVariants.find(
    (v: any) => (colors.length === 0 || v.color === selectedColor) && 
                (sizes.length === 0 || v.size === selectedSize)
  );

  // Update active image when variant changes
  useEffect(() => {
    if (selectedVariant?.imageUrl) {
      setActiveImage(selectedVariant.imageUrl);
    }
  }, [selectedVariant]);

  const handleAddToCart = () => {
    if (colors.length > 0 && !selectedColor) {
      return toast({ title: "Error", description: "Please select a color.", variant: "destructive" });
    }
    if (sizes.length > 0 && !selectedSize) {
      return toast({ title: "Error", description: "Please select a size.", variant: "destructive" });
    }
    if (selectedVariant && selectedVariant.stock < quantity) {
      return toast({ title: "Insufficient Stock", description: "Not enough stock available for this selection.", variant: "destructive" });
    }

    addItem({
      productId: product.id,
      title: product.title,
      price: product.price, // or discounted price
      quantity,
      imageUrl: activeImage,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      slug: product.slug,
    });

    trackAddToCart({
      productId: product.id,
      productName: product.title,
      price: product.price,
      quantity,
    });

    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.title} has been added to your cart.`,
      duration: 3000,
    });
  };

  const handleBuyNow = () => {
    if (colors.length > 0 && !selectedColor) {
      return toast({ title: "Error", description: "Please select a color.", variant: "destructive" });
    }
    if (sizes.length > 0 && !selectedSize) {
      return toast({ title: "Error", description: "Please select a size.", variant: "destructive" });
    }
    if (selectedVariant && selectedVariant.stock < quantity) {
      return toast({ title: "Insufficient Stock", description: "Not enough stock available for this selection.", variant: "destructive" });
    }

    handleAddToCart();
    router.push("/checkout");
  };

  const effectivePrice = product.discountedPrice || product.price;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap no-scrollbar">
          <Link href="/" className="hover:text-[#E91E8C]">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
          <Link href="/shop" className="hover:text-[#E91E8C]">Shop</Link>
          <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
          <span className="text-gray-900 font-medium truncate">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* ── Left: Image Gallery ── */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                {product.discountPercent && (
                  <div className="absolute top-4 left-4 z-10 bg-[#FF6B35] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                    -{product.discountPercent}%
                  </div>
                )}
                <Image 
                  src={activeImage} 
                  alt={product.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-opacity duration-300"
                />
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {product.images.map((img: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(img.url)}
                      className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === img.url ? "border-[#E91E8C]" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img.url} alt={`Thumbnail ${idx}`} fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Product Info ── */}
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                {product.title}
              </h1>
              <p className="text-sm text-gray-500 mb-6">SKU: {product.id.toUpperCase().slice(0, 8)}-001</p>
              
              {/* Pricing */}
              <div className="flex items-end gap-3 mb-4">
                <span className="text-3xl font-black text-[#E91E8C]">
                  {formatPrice(effectivePrice)}
                </span>
                {product.discountedPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {selectedVariant && (
                <div className="mb-6">
                  {selectedVariant.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-50 text-green-700 text-sm font-bold border border-green-100">
                      {selectedVariant.stock} in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-50 text-red-700 text-sm font-bold border border-red-100">
                      Out of stock
                    </span>
                  )}
                </div>
              )}

              <hr className="border-gray-100 mb-8" />

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Color</span>
                    <span className="text-sm text-gray-500">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all ${
                          selectedColor === color 
                            ? "border-[#E91E8C] bg-pink-50 text-[#E91E8C]" 
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Size</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] px-3 py-2 border rounded-xl text-sm font-medium transition-all ${
                          selectedSize === size 
                            ? "border-[#E91E8C] bg-[#E91E8C] text-white shadow-sm" 
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Quantity */}
                <div className="flex items-center justify-between border border-gray-200 rounded-xl p-1 bg-gray-50 h-14 w-full sm:w-36 shrink-0">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-lg text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                    disabled={Boolean(selectedVariant && selectedVariant.stock <= quantity)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-1 gap-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={Boolean(selectedVariant && selectedVariant.stock <= 0)}
                    className="flex-1 bg-gray-900 text-white font-bold rounded-xl h-14 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={Boolean(selectedVariant && selectedVariant.stock <= 0)}
                    className="flex-1 bg-[#E91E8C] text-white font-bold rounded-xl h-14 flex items-center justify-center hover:bg-[#d8157a] hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-6 mb-8 text-sm font-medium text-gray-600">
                <button className="flex items-center gap-2 hover:text-[#E91E8C] transition-colors">
                  <Heart className="h-5 w-5" /> Add to Wishlist
                </button>
                <button className="flex items-center gap-2 hover:text-[#E91E8C] transition-colors">
                  <Share2 className="h-5 w-5" /> Share
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="text-[#E91E8C]"><ShieldCheck className="h-6 w-6" /></div>
                  <div className="text-xs text-gray-600 font-medium leading-tight">100% Authentic<br/>Guaranteed</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[#E91E8C]"><Truck className="h-6 w-6" /></div>
                  <div className="text-xs text-gray-600 font-medium leading-tight">Cash on Delivery<br/>Available</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[#E91E8C]"><RefreshCcw className="h-6 w-6" /></div>
                  <div className="text-xs text-gray-600 font-medium leading-tight">Easy 3-Day<br/>Returns</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Product Description ── */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Product Description</h2>
          <div className="prose prose-pink max-w-none text-gray-600 leading-relaxed">
            <p>{product.description}</p>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900">You May Also Like</h2>
              <Link href="/shop" className="text-sm font-semibold text-gray-500 hover:text-[#E91E8C] hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(p => {
                const hasDiscount = Boolean(p.discountedPrice);
                const effectivePrice = hasDiscount ? Number(p.discountedPrice) : Number(p.price);
                const originalPrice = hasDiscount ? Number(p.price) : undefined;
                const discountPercent = hasDiscount ? Math.round(((Number(p.price) - effectivePrice) / Number(p.price)) * 100) : undefined;

                return (
                  <ProductCard key={`related-${p.id}`} product={{
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    price: effectivePrice,
                    originalPrice: originalPrice,
                    image: p.images?.[0]?.url || "/placeholder-product.jpg",
                    discountPercent: discountPercent,
                    variants: p.variants
                  }} />
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
