"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";
import { CartItem } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Orders at or above this amount qualify for the reduced delivery rate. */
const FREE_DELIVERY_THRESHOLD = 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Counts the total number of individual units across all cart line items. */
function countTotalUnits(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

/** Displayed when the cart is empty — encourages the user to browse the shop. */
function EmptyCartState() {
  return (
    <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col items-center text-center">
      <div className="w-24 h-24 bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center mb-6 shadow-sm border border-pink-100">
        <ShoppingBag className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Looks like you haven&apos;t added anything to your cart yet. Browse our top
        categories to find something you&apos;ll love!
      </p>
      <Link
        href="/shop"
        className="bg-[#E91E8C] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#d8157a] hover:shadow-lg transition-all cursor-pointer"
      >
        Start Shopping
      </Link>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [baseDeliveryCharge, setBaseDeliveryCharge] = useState(80);

  useEffect(() => {
    // Fetch global dynamic delivery charge from DB
    import("@/actions/store-settings.actions").then((module) => {
      module.getGlobalStoreSettings().then((settings) => setBaseDeliveryCharge(Number(settings.deliveryChargeInside) || 80));
    });
  }, []);

  const qualifiesForReducedDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  
  // Calculate final delivery charge (reduced if threshold met, otherwise base)
  const deliveryCharge = qualifiesForReducedDelivery
    ? Math.max(0, baseDeliveryCharge - 20) // Give a 20 Tk discount on delivery
    : baseDeliveryCharge;

  const grandTotal = subtotal + deliveryCharge;
  const totalUnits = countTotalUnits(items);

  if (items.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">
          Shopping Cart
          <span className="ml-3 text-base font-medium text-gray-400">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── Cart Line Items ── */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8">
                {items.map((item) => (
                  <CartLineItem
                    key={`${item.productId}-${item.variantId ?? "default"}`}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#E91E8C] transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({totalUnits} items)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-gray-900">{formatPrice(deliveryCharge)}</span>
                </div>

                {qualifiesForReducedDelivery && (
                  <p className="text-xs text-green-600 font-medium bg-green-50 rounded-lg px-3 py-2">
                    🎉 You qualify for reduced delivery (Tk 60)!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-900 text-base">Grand Total</span>
                  <span className="text-2xl font-black text-[#E91E8C]">{formatPrice(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  Taxes included • Cash on Delivery
                </p>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-[#E91E8C] text-white font-bold py-4 rounded-xl hover:bg-[#d8157a] hover:shadow-lg hover:shadow-pink-500/30 transition-all cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Secure Checkout · Cash on Delivery
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── CartLineItem ─────────────────────────────────────────────────────────────

/** Props for a single line item row in the cart */
interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  onRemove: (productId: string, variantId?: string) => void;
}

/**
 * Renders a single product row in the cart, with its image, title,
 * variant details, quantity controls, and remove button.
 * Extracted as a separate component to keep CartPage clean and readable.
 */
function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-b border-gray-100 pb-6 md:pb-8 last:border-0 last:pb-0">

      {/* Product Image */}
      <div className="relative w-24 h-32 sm:w-32 sm:h-40 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 96px, 128px"
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between gap-4">

          {/* Title & Variant Info */}
          <div>
            <Link
              href={`/product/${item.slug}`}
              className="font-bold text-gray-900 hover:text-[#E91E8C] transition-colors line-clamp-2 leading-snug text-lg mb-2 block"
            >
              {item.title}
            </Link>
            <div className="text-sm text-gray-500 space-y-1">
              {item.color && (
                <p>Color: <span className="font-medium text-gray-900">{item.color}</span></p>
              )}
              {item.size && (
                <p>Size: <span className="font-medium text-gray-900">{item.size}</span></p>
              )}
            </div>
          </div>

          {/* Unit Price */}
          <div className="text-right shrink-0">
            <p className="font-extrabold text-lg text-[#E91E8C]">
              {formatPrice(item.price)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.price)} each</p>
            )}
          </div>
        </div>

        {/* Quantity Controls & Remove Button */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.variantId)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-10 text-center font-bold text-sm text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.variantId)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.productId, item.variantId)}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
