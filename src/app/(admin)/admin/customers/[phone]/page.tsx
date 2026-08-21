import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, ShoppingBag, DollarSign } from "lucide-react";
import { getCustomerByPhone } from "@/actions/admin.customer.actions";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone } = await params;
  const decodedPhone = decodeURIComponent(phone);

  const customer = await getCustomerByPhone(decodedPhone);

  if (!customer) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Profile</h1>
          <p className="text-sm text-gray-500">{customer.customerName}</p>
        </div>
      </div>

      {/* Stats + Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avatar card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E8C] to-purple-600 flex items-center justify-center text-white font-black text-2xl">
            {customer.customerName.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-bold text-gray-900">{customer.customerName}</h2>
          {customer.customerEmail && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${customer.customerEmail}`} className="hover:text-[#E91E8C]">
                {customer.customerEmail}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Phone className="w-4 h-4" />
            <a href={`tel:${customer.customerPhone}`} className="hover:text-[#E91E8C]">
              {customer.customerPhone}
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center gap-2">
          <ShoppingBag className="w-8 h-8 text-blue-400" />
          <p className="text-3xl font-black text-gray-900">{customer.totalOrders}</p>
          <p className="text-sm text-gray-500 font-medium">Total Orders</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center gap-2">
          <DollarSign className="w-8 h-8 text-[#E91E8C]" />
          <p className="text-3xl font-black text-[#E91E8C]">{formatPrice(customer.totalSpent)}</p>
          <p className="text-sm text-gray-500 font-medium">Total Spent</p>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Order History</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {customer.orders.map((order) => (
            <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-bold text-gray-900 hover:text-[#E91E8C] transition-colors"
                  >
                    {order.invoiceNumber}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-BD", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#E91E8C]">{formatPrice(order.totalAmount)}</p>
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                      STATUS_COLORS[order.status] ?? "bg-gray-100"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              {/* Items summary */}
              <div className="flex flex-wrap gap-2">
                {order.items.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {item.productTitle} × {item.quantity}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span className="text-xs text-gray-400 px-2 py-1">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Customer view doc
