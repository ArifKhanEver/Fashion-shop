import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  MoreHorizontal,
  Users,
  Package,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";
import Link from "next/link";
import AdminRevenueChart from "@/components/admin/AdminRevenueChart";
import { formatPrice } from "@/lib/utils";
import {
  getDashboardKPIs,
  getRecentOrders,
  getRevenueChartData,
  getTopProducts,
} from "@/actions/admin.dashboard.actions";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminDashboardOverview() {
  const [kpis, recentOrders, chartData, topProducts] = await Promise.all([
    getDashboardKPIs(),
    getRecentOrders(6),
    getRevenueChartData(7),
    getTopProducts(5),
  ]);

  const KPI_CARDS = [
    {
      label: "Total Revenue",
      value: formatPrice(kpis.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: "All-time non-cancelled",
      href: "/admin/orders",
    },
    {
      label: "Total Orders",
      value: kpis.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: `${kpis.pendingOrders} pending`,
      href: "/admin/orders",
    },
    {
      label: "Active Products",
      value: kpis.activeProducts.toLocaleString(),
      icon: Package,
      color: "text-violet-600",
      bg: "bg-violet-50",
      sub: kpis.lowStockProducts > 0 ? `⚠ ${kpis.lowStockProducts} low stock` : "All stocked",
      href: "/admin/products",
    },
    {
      label: "Total Customers",
      value: kpis.totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-pink-600",
      bg: "bg-pink-50",
      sub: "Unique by phone",
      href: "/admin/customers",
    },
  ];

  // Order status breakdown stats
  const STATUS_STATS = [
    { label: "Pending",    count: kpis.pendingOrders,    color: "bg-orange-400", textColor: "text-orange-700" },
    { label: "Processing", count: kpis.processingOrders, color: "bg-blue-400",   textColor: "text-blue-700" },
    { label: "Shipped",    count: kpis.shippedOrders,    color: "bg-purple-400", textColor: "text-purple-700" },
    { label: "Delivered",  count: kpis.deliveredOrders,  color: "bg-green-400",  textColor: "text-green-700" },
    { label: "Cancelled",  count: kpis.cancelledOrders,  color: "bg-red-400",    textColor: "text-red-700" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 bg-[#E91E8C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d8157a] transition-colors"
        >
          <ShoppingBag className="w-4 h-4" /> View All Orders
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {KPI_CARDS.map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className="block group">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#E91E8C]/20 group-hover:-translate-y-0.5">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#E91E8C] transition-colors" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Revenue Chart + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#E91E8C]" /> Revenue Overview
            </h2>
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              Last 7 Days
            </span>
          </div>
          <div className="h-[260px] w-full">
            <AdminRevenueChart data={chartData} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-gray-400 hover:text-[#E91E8C] transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {recentOrders.length === 0 && (
                <li className="p-6 text-center text-gray-500 text-sm">No recent orders</li>
              )}
              {recentOrders.map((order: any) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center px-5 py-3.5 hover:bg-gray-50 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{order.invoiceNumber}</p>
                      <p className="text-xs text-gray-500 truncate">{order.customerName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#E91E8C] text-sm">{formatPrice(Number(order.totalAmount))}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100"}`}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Link href="/admin/orders" className="block w-full text-center text-sm font-semibold text-[#E91E8C] hover:underline">
              View All Orders →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Top Products + Status Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" /> Top Selling Products
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={product.productId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.productTitle}</p>
                    <p className="text-xs text-gray-500">{product.unitsSold} units sold</p>
                  </div>
                  <span className="text-xs font-bold text-[#E91E8C] bg-pink-50 px-2 py-1 rounded-full shrink-0">
                    {product.orderCount} orders
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-500" /> Order Status Breakdown
          </h2>
          <div className="space-y-3">
            {STATUS_STATS.map((stat) => {
              const pct = kpis.totalOrders > 0 ? Math.round((stat.count / kpis.totalOrders) * 100) : 0;
              return (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${stat.textColor}`}>{stat.label}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {stat.count.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${stat.color} h-2 rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
