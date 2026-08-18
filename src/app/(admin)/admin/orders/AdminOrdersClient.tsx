"use client";

import { useState, useTransition, Suspense } from "react";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Eye, ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { adminUpdateOrderStatus } from "@/actions/order.actions";
import { toast } from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_SELECT_COLORS: Record<string, string> = {
  PENDING: "text-orange-700",
  PROCESSING: "text-blue-700",
  SHIPPED: "text-purple-700",
  DELIVERED: "text-green-700",
  CANCELLED: "text-red-700",
};

const TABS = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

interface AdminOrdersClientProps {
  orders: any[];
  total: number;
  totalPages: number;
  currentPage: number;
  statusCounts: Record<string, number>;
}

function OrdersContent({
  orders,
  total,
  totalPages,
  currentPage,
  statusCounts,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeTab = searchParams.get("status") ?? "ALL";

  function handleTabChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "ALL") {
      params.delete("status");
    } else {
      params.set("status", tab);
    }
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  }

  const filteredOrders = orders.filter(
    (o) =>
      o.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone?.includes(searchQuery)
  );

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrderStatus(orderId, newStatus as any);
      toast.success("Status updated successfully");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">
            {total.toLocaleString()} total orders · Page {currentPage} of {totalPages}
          </p>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
        <div className="flex overflow-x-auto no-scrollbar gap-1">
          {TABS.map((tab) => {
            const count = statusCounts[tab] ?? 0;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
                <span
                  className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    isActive ? "bg-white/20" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Invoice, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4">Invoice & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{order.invoiceNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-BD", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="p-4 font-medium text-gray-600">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="p-4 font-bold text-[#E91E8C]">
                      {formatPrice(Number(order.totalAmount))}
                    </td>
                    <td className="p-4">
                      {/* Inline status quick-updater */}
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`appearance-none text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer pr-6 focus:outline-none focus:ring-2 focus:ring-[#E91E8C] disabled:opacity-60 ${
                            STATUS_COLORS[order.status] ?? "bg-gray-100"
                          }`}
                        >
                          {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            )
                          )}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/admin/orders"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersClient(props: AdminOrdersClientProps) {
  return (
    <Suspense fallback={<div className="space-y-6"><AdminTableSkeleton rows={8} /></div>}>
      <OrdersContent {...props} />
    </Suspense>
  );
}
