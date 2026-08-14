"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
// We'll use dummy data for visual review, but wire it up with the real context later, 
// or just mock the context data for the UI review.
import { useState } from "react";

const DUMMY_CART_ITEMS = [
  {
    id: "cart-item-1",
    productId: "p1",
    title: "Elegant Stiletto Heels - Premium Collection",
    price: 2500,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    color: "Black",
    size: "38",
    quantity: 1,
  },
  {
    id: "cart-item-2",
    productId: "p2",
    title: "Classic Leather Tote Bag with Gold Hardware",
    price: 4200,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    color: "Brown",
    size: "Standard",
    quantity: 2,
  },
];

export default function CartPage() {
  const [items, setItems] = useState(DUMMY_CART_ITEMS);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = 60; // Assuming inside Dhaka for mock
  const total = subtotal + deliveryCharge;

  const updateQuantity = (id: string, delta: number) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id === id) {
          const newQ = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQ };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center mb-6 shadow-sm border border-pink-100">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 max-w-md mb-8">
          Looks like you haven't added anything to your cart yet. Browse our top categories to find something you'll love!
        </p>
        <Link 
          href="/shop" 
          className="bg-[#E91E8C] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#d8157a] hover:shadow-lg transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ── Line Items ── */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-b border-gray-100 pb-6 md:pb-8 last:border-0 last:pb-0">
                    {/* Item Image */}
                    <div className="w-24 h-32 sm:w-32 sm:h-40 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between gap-4">
                        <div>
                          <Link href={`/product/${item.productId}`} className="font-bold text-gray-900 hover:text-[#E91E8C] transition-colors line-clamp-2 leading-snug text-lg mb-2">
                            {item.title}
                          </Link>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Color: <span className="font-medium text-gray-900">{item.color}</span></p>
                            <p>Size: <span className="font-medium text-gray-900">{item.size}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-lg text-[#E91E8C]">{formatPrice(item.price)}</p>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery (Inside Dhaka)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(deliveryCharge)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-900 text-base">Grand Total</span>
                  <span className="text-2xl font-black text-[#E91E8C]">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">Taxes included</p>
              </div>

              <Link 
                href="/checkout" 
                className="w-full flex items-center justify-center gap-2 bg-[#E91E8C] text-white font-bold py-4 rounded-xl hover:bg-[#d8157a] hover:shadow-lg hover:shadow-pink-500/30 transition-all"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
