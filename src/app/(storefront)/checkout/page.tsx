"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { MapPin, User, ShieldCheck, CreditCard } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { placeOrder } from "@/actions/order.actions";
import { toast } from "react-hot-toast";
import { BD_DIVISIONS } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [division, setDivision] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<"inside" | "outside">("inside");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deliveryCharges, setDeliveryCharges] = useState({ inside: 80, outside: 120 });
  
  useEffect(() => {
    import("@/actions/store-settings.actions").then((module) => {
      module.getGlobalStoreSettings().then((settings) => {
        setDeliveryCharges({
          inside: Number(settings.deliveryChargeInside) || 80,
          outside: Number(settings.deliveryChargeOutside) || 120,
        });
      });
    });
  }, []);

  // Delivery Fee Logic
  const deliveryCharge = deliveryArea === "inside" ? deliveryCharges.inside : deliveryCharges.outside;
  
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      customerEmail: formData.get("customerEmail") as string,
      division: division,
      district: formData.get("district") as string,
      fullAddress: formData.get("fullAddress") as string,
      deliveryArea,
    };

    setIsSubmitting(true);
    try {
      const result = await placeOrder(data, items);
      
      if (result.success && result.orderId) {
        clearCart();
        toast.success("Order placed successfully!");
        router.push(`/order-confirmation/${result.orderId}`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Your Cart is Empty</h1>
        <Link href="/shop" className="bg-[#E91E8C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#d8157a] transition-all">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Please fill in your details to complete the order.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* ── Left: Checkout Form ── */}
          <div className="flex-1 space-y-8">
            
            {/* Contact Information */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-[#E91E8C]" /> Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input name="customerName" required type="text" placeholder="e.g. John Doe" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input name="customerPhone" required type="tel" placeholder="e.g. 017XXXXXXXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Optional)</label>
                  <input name="customerEmail" type="email" placeholder="e.g. john@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none" />
                </div>
              </div>
            </section>

            {/* Delivery Details */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#E91E8C]" /> Delivery Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Division *</label>
                  <select 
                    required 
                    value={division} 
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none appearance-none"
                  >
                    <option value="" disabled>Select Division</option>
                    {BD_DIVISIONS.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District / City *</label>
                  <input name="district" required type="text" placeholder="e.g. Gulshan, Dhaka" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none" />
                </div>
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Area *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`border-2 rounded-xl p-4 flex flex-col cursor-pointer transition-all ${deliveryArea === "inside" ? "border-[#E91E8C] bg-pink-50" : "border-gray-200 hover:border-pink-200"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">Inside Dhaka</span>
                        <input 
                          type="radio" 
                          name="deliveryArea" 
                          value="inside" 
                          checked={deliveryArea === "inside"} 
                          onChange={() => setDeliveryArea("inside")}
                          className="w-4 h-4 text-[#E91E8C] focus:ring-[#E91E8C]" 
                        />
                      </div>
                      <span className="text-sm text-gray-500">Delivery in 1-2 days</span>
                      <span className="text-[#E91E8C] font-bold mt-2">Tk {deliveryCharges.inside}</span>
                    </label>
                    <label className={`border-2 rounded-xl p-4 flex flex-col cursor-pointer transition-all ${deliveryArea === "outside" ? "border-[#E91E8C] bg-pink-50" : "border-gray-200 hover:border-pink-200"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">Outside Dhaka</span>
                        <input 
                          type="radio" 
                          name="deliveryArea" 
                          value="outside" 
                          checked={deliveryArea === "outside"} 
                          onChange={() => setDeliveryArea("outside")}
                          className="w-4 h-4 text-[#E91E8C] focus:ring-[#E91E8C]" 
                        />
                      </div>
                      <span className="text-sm text-gray-500">Delivery in 3-5 days</span>
                      <span className="text-[#E91E8C] font-bold mt-2">Tk {deliveryCharges.outside}</span>
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                  <textarea name="fullAddress" required rows={3} placeholder="House number, Street name, Apartment/Suite" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none resize-none" />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#E91E8C]" /> Payment Method
              </h2>
              
              <div className="border-2 border-[#E91E8C] bg-pink-50 rounded-xl p-4 flex items-center gap-4 cursor-pointer">
                <input type="radio" checked readOnly className="w-5 h-5 text-[#E91E8C] focus:ring-[#E91E8C]" />
                <div>
                  <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-600">Pay with cash when your order is delivered.</p>
                </div>
              </div>
            </section>

          </div>

          {/* ── Right: Order Summary Sidebar ── */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6">
                {items.map((item, idx) => (
                  <div key={`${item.productId}-${item.variantId}-${idx}`} className="flex gap-4">
                    <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.color || 'Default'}, {item.size || 'Standard'} × <span className="font-bold text-gray-700">{item.quantity}</span>
                      </p>
                      <p className="text-sm font-bold text-[#E91E8C] mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryCharge > 0 ? formatPrice(deliveryCharge) : <span className="text-gray-400">Calculated at next step</span>}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-900 text-base">Grand Total</span>
                  <span className="text-2xl font-black text-[#E91E8C]">{formatPrice(total)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E91E8C] text-white font-bold py-4 rounded-xl hover:bg-[#d8157a] hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Processing..." : "Confirm Order"}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 py-3 rounded-lg border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Your personal data is secure
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
