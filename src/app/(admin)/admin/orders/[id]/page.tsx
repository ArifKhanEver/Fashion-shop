import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Calendar, CheckCircle2, Truck, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { getOrderById, adminUpdateOrderStatus } from "@/actions/order.actions";
import { revalidatePath } from "next/cache";

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // Server Action for updating status
  async function updateStatusAction(formData: FormData) {
    "use server";
    const status = formData.get("status") as any;
    if (status) {
      await adminUpdateOrderStatus(order!.id, status);
      revalidatePath(`/admin/orders/${order!.id}`);
      revalidatePath(`/admin/orders`);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/orders" 
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Order {order.invoiceNumber}
              <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full uppercase tracking-wide">
                {order.status}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Status Update Form */}
        <form action={updateStatusAction} className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Update Status:</span>
          <select 
            name="status"
            defaultValue={order.status}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C] cursor-pointer"
          >
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button type="submit" className="bg-gray-900 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm shadow-sm">
            Save
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* ── Left Column: Items & Summary ── */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#E91E8C]" />
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-5 md:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                    <Image src={item.productImageUrl || "/placeholder-product.jpg"} alt={item.productTitle} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 line-clamp-1">{item.productTitle}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.variantColor || 'Default'} / {item.variantSize || 'Standard'}
                    </p>
                  </div>
                  <div className="text-right sm:text-left flex-1 sm:flex-none flex justify-between sm:block mt-2 sm:mt-0">
                    <p className="text-sm text-gray-500 mb-1">{formatPrice(Number(item.unitPrice))} × {item.quantity}</p>
                    <p className="font-bold text-[#E91E8C]">{formatPrice(Number(item.unitPrice) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 md:p-6 bg-gray-50 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({order.items.length} items)</span>
                <span className="font-medium text-gray-900">{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-medium text-gray-900">{formatPrice(Number(order.deliveryCharge))}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-gray-200 mt-3">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-[#E91E8C]">{formatPrice(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Customer Details ── */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-[#E91E8C]" />
              <h2 className="text-lg font-bold text-gray-900">Customer Info</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`tel:${order.customerPhone}`} className="hover:text-[#E91E8C] transition-colors">
                  {order.customerPhone}
                </a>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${order.customerEmail}`} className="hover:text-[#E91E8C] transition-colors break-all">
                    {order.customerEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E91E8C]" />
              <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.fullAddress}<br />
                {order.district}, {order.division}<br />
                Bangladesh
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#E91E8C]" />
              <h2 className="text-lg font-bold text-gray-900">Payment</h2>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Cash on Delivery
              </p>
              <p className="text-xs text-orange-600 font-medium bg-orange-50 inline-block px-2 py-1 rounded">
                Unpaid
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
