"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ShoppingBag, Zap, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/CartContext";
import { toast } from "@/hooks/use-toast";
import { formatPrice, calcDiscount } from "@/lib/utils";
import { trackAddToCart } from "@/components/analytics/AnalyticsProvider";
import { useRouter } from "next/navigation";

interface ProductVariant {
  id: string;
  color: string | null;
  size: string | null;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    discountedPrice: number | null;
    isFeatured: boolean;
    images: ProductImage[];
    variants: ProductVariant[];
    categories: { category: { id: string; name: string; slug: string } }[];
  };
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Derive unique colors and sizes
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];

  const currentPrice = product.discountedPrice ?? product.price;
  const discountPct = product.discountedPrice
    ? calcDiscount(product.price, product.discountedPrice)
    : 0;

  // Find the matching variant for selected color + size
  const matchingVariant = product.variants.find(
    (v) =>
      (selectedColor ? v.color === selectedColor : true) &&
      (selectedSize ? v.size === selectedSize : true)
  );

  const isOutOfStock = matchingVariant ? matchingVariant.stock === 0 : false;

  const isSizeOutOfStock = useCallback(
    (size: string) => {
      const variant = product.variants.find(
        (v) => v.size === size && (selectedColor ? v.color === selectedColor : true)
      );
      return variant ? variant.stock === 0 : false;
    },
    [product.variants, selectedColor]
  );

  const handleAddToCart = useCallback(
    (redirectToCheckout = false) => {
      const imageUrl = product.images[0]?.url ?? "";

      addItem({
        productId: product.id,
        variantId: matchingVariant?.id,
        title: product.title,
        slug: product.slug,
        imageUrl,
        price: currentPrice,
        color: selectedColor ?? undefined,
        size: selectedSize ?? undefined,
        quantity,
      });

      trackAddToCart({
        productId: product.id,
        productName: product.title,
        price: currentPrice,
      });

      if (redirectToCheckout) {
        router.push("/checkout");
      } else {
        toast({
          title: "Added to cart! 🛍️",
          description: `${product.title} has been added to your cart.`,
          variant: "success",
        });
      }
    },
    [addItem, product, matchingVariant, selectedColor, selectedSize, quantity, currentPrice, router]
  );

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#E91E8C] flex items-center gap-1">
          <Home className="h-3 w-3" /> Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-[#E91E8C]">Shop</Link>
        {product.categories[0] && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/category/${product.categories[0].category.slug}`}
              className="hover:text-[#E91E8C]"
            >
              {product.categories[0].category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900 font-medium line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ── Image Gallery ── */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            {product.images[selectedImage] && (
              <Image
                src={product.images[selectedImage]!.url}
                alt={product.images[selectedImage]!.altText ?? product.title}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            )}
            {discountPct > 0 && (
              <div className="absolute top-3 left-3">
                <Badge variant="destructive">-{discountPct}%</Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    i === selectedImage
                      ? "border-[#E91E8C]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.title} image ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-2xl font-bold text-[#E91E8C]">
              {formatPrice(currentPrice)}
            </span>
            {product.discountedPrice && product.discountedPrice < product.price && (
              <>
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  -{discountPct}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Color Selector */}
          {colors.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color: <span className="font-normal text-gray-500">{selectedColor ?? "Select"}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                    className={`px-4 py-1.5 rounded-full text-sm border-2 transition-all font-medium ${
                      selectedColor === color
                        ? "border-[#E91E8C] bg-pink-50 text-[#E91E8C]"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Size: <span className="font-normal text-gray-500">{selectedSize ?? "Select"}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const oos = isSizeOutOfStock(size);
                  return (
                    <button
                      key={size}
                      onClick={() => !oos && setSelectedSize(size === selectedSize ? null : size)}
                      disabled={oos}
                      className={`w-11 h-11 rounded-lg text-sm font-semibold border-2 transition-all ${
                        selectedSize === size
                          ? "border-[#E91E8C] bg-pink-50 text-[#E91E8C]"
                          : oos
                          ? "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-700 hover:border-[#E91E8C] hover:text-[#E91E8C] transition-all font-bold"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-700 hover:border-[#E91E8C] hover:text-[#E91E8C] transition-all font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              disabled={isOutOfStock}
              onClick={() => handleAddToCart(false)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              className="flex-1"
              disabled={isOutOfStock}
              onClick={() => handleAddToCart(true)}
            >
              <Zap className="h-4 w-4 mr-2" />
              Buy Now
            </Button>
          </div>

          {isOutOfStock && (
            <p className="text-sm text-red-500 font-medium mb-4">
              ⚠️ This variant is out of stock
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Product Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery note */}
          <div className="mt-5 bg-pink-50 rounded-xl p-3 text-xs text-gray-600">
            🚚 <strong>Free delivery</strong> inside Dhaka (Tk 60) · Outside Dhaka (Tk 120) ·
            Cash on Delivery available
          </div>
        </div>
      </div>
    </>
  );
}
