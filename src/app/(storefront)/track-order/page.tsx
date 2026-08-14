"use client";

import { useState } from "react";
import { Search, Package, Clock, Truck, CheckCircle2, ChevronRight, XCircle } from "lucide-react";
import Link from "next/link";
import { trackOrder } from "@/actions/order.actions";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false);
    setError("");
    
    try {
      const result = await trackOrder(query.trim());
      if (result) {
        setOrder(result);
      } else {
        setOrder(null);
        setError("No order found matching that ID or Phone number.");
      }
    } catch (err) {
      setError("Failed to track order. Please try again.");
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const getSteps = (status: string, createdAt: Date) => {
    const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    
    if (status === "CANCELLED") {
      return [
        { label: "Cancelled", description: "Order was cancelled", icon: XCircle, completed: true, date: new Date(createdAt).toLocaleString() }
      ];
    }

    const currentIndex = statuses.indexOf(status);
    
    return [
      { label: "Pending", description: "Order received", icon: Clock, completed: currentIndex >= 0, date: currentIndex >= 0 ? new Date(createdAt).toLocaleString() : "" },
      { label: "Processing", description: "Getting your items ready", icon: Package, completed: currentIndex >= 1, date: currentIndex >= 1 ? "In Progress" : "" },
      { label: "Shipped", description: "Handed over to courier", icon: Truck, completed: currentIndex >= 2, date: currentIndex >= 2 ? "Shipped" : "" },
      { label: "Delivered", description: "Package arrived", icon: CheckCircle2, completed: currentIndex >= 3, date: currentIndex >= 3 ? "Delivered" : "" },
    ];
  };

  const getProgressHeight = (status: string) => {
    switch (status) {
      case "PENDING": return "0%";
      case "PROCESSING": return "33%";
      case "SHIPPED": return "66%";
      case "DELIVERED": return "100%";
      default: return "0%"; // CANCELLED
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-4 mb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-[#E91E8C]">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">Track Order</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-pink-100">
            <Search className="w-7 h-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">Track Your Order</h1>
          <p className="text-gray-500">Enter your Invoice Number, Order ID or Phone Number to check the delivery status.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="e.g. INV-123456 or 017XXXXXXX" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none" 
            />
            <button 
              type="submit" 
              disabled={isSearching || !query.trim()}
              className="bg-[#E91E8C] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#d8157a] transition-all disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
            >
              {isSearching ? "Searching..." : "Track Now"}
            </button>
          </form>
        </div>

        {hasSearched && error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100 animate-in fade-in slide-in-from-bottom-4">
            {error}
          </div>
        )}

        {hasSearched && order && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Invoice Number</p>
                <p className="font-bold text-gray-900 text-lg">{order.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">Status</p>
                <p className={`font-bold text-lg ${order.status === 'CANCELLED' ? 'text-red-500' : 'text-[#E91E8C]'}`}>
                  {order.status}
                </p>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-8">Delivery Status</h3>

            {/* ── Timeline ── */}
            <div className="relative border-l-2 border-gray-100 ml-4 md:ml-6 space-y-10">
              {getSteps(order.status, order.createdAt).map((step, index) => (
                <div key={index} className="relative pl-8 md:pl-12 z-10 bg-white">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[17px] md:-left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                    step.completed ? (order.status === "CANCELLED" ? "bg-red-500 text-white" : "bg-[#E91E8C] text-white") : "bg-gray-100 text-gray-400"
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                    <div>
                      <h4 className={`font-bold text-lg mb-1 ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                        {step.label}
                      </h4>
                      <p className={`text-sm ${step.completed ? "text-gray-600" : "text-gray-400"}`}>
                        {step.description}
                      </p>
                    </div>
                    {step.date && (
                      <div className="text-sm font-medium text-gray-500 whitespace-nowrap mt-1 sm:mt-0">
                        {step.date}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Active Line Overlap */}
              {order.status !== "CANCELLED" && (
                <div 
                  className="absolute top-0 left-[-2px] w-0.5 bg-[#E91E8C] transition-all duration-1000" 
                  style={{ height: getProgressHeight(order.status) }} 
                />
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
