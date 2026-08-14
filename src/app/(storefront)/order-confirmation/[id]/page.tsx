import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, Package, Home, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getOrderById } from "@/actions/order.actions";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* ── Success Header ── */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-200">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Order Confirmed!</h1>
          <p className="text-gray-500 text-lg">Thank you for your purchase. We have received your order.</p>
        </div>

        {/* ── Order Details Cards ── */}
        <div className="space-y-6">
          
          {/* Order Info Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-wrap justify-between items-center gap-4 shadow-sm">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Invoice Number</p>
              <p className="font-bold text-gray-900">{order.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Date</p>
              <p className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Payment Method</p>
              <p className="font-bold text-gray-900">Cash on Delivery</p>
            </div>
            <div>
              <Link 
                href="/track-order" 
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E91E8C] bg-pink-50 px-4 py-2 rounded-lg hover:bg-pink-100 transition-colors"
              >
                Track Order <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Home className="h-5 w-5 text-[#E91E8C]" /> Delivery Details
              </h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                  <p className="flex items-center gap-2 text-sm mt-1"><Phone className="w-3.5 h-3.5" /> {order.customerPhone}</p>
                </div>
                <div className="text-sm pt-2 border-t border-gray-100">
                  <p>{order.fullAddress}</p>
                  <p>{order.district}</p>
                  <p>{order.division}, Bangladesh</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#E91E8C]" /> Order Items
              </h2>
              
              <div className="flex flex-col gap-4 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.productImageUrl || "/placeholder-product.jpg"} alt={item.productTitle} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.productTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variantColor || 'Default'}, {item.variantSize || 'Standard'} × <span className="font-bold text-gray-700">{item.quantity}</span>
                      </p>
                      <p className="text-sm font-bold text-[#E91E8C] mt-1">{formatPrice(Number(item.unitPrice) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-gray-900">{formatPrice(Number(order.deliveryCharge))}</span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-base">Total Amount</span>
                  <span className="text-xl font-black text-[#E91E8C]">{formatPrice(Number(order.totalAmount))}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center bg-[#E91E8C] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#d8157a] hover:shadow-lg transition-all"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
