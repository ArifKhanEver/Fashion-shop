import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import AdminRevenueChart from "@/components/admin/AdminRevenueChart";
import { formatPrice } from "@/lib/utils";
import { getDashboardKPIs, getRecentOrders, getRevenueChartData } from "@/actions/admin.dashboard.actions";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminDashboardOverview() {
  const kpisData = await getDashboardKPIs();
  const recentOrders = await getRecentOrders(5);
  const chartData = await getRevenueChartData(7);

  const KPIs = [
    { label: "Total Revenue", value: kpisData.totalRevenue, icon: DollarSign, color: "text-green-600", bg: "bg-green-100", trend: null },
    { label: "Total Orders", value: kpisData.totalOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100", trend: null },
    { label: "Pending Orders", value: kpisData.pendingOrders, icon: Clock, color: "text-orange-500", bg: "bg-orange-100", trend: null },
    { label: "Low Stock Items", value: kpisData.lowStockProducts, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100", trend: kpisData.lowStockProducts > 0 ? `${kpisData.lowStockProducts} items` : null },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <Link 
          href="/admin/orders" 
          className="inline-flex items-center gap-2 bg-[#E91E8C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d8157a] transition-colors"
        >
          View All Orders
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {KPIs.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              {kpi.trend && (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpi.label === "Total Revenue" ? formatPrice(kpi.value) : kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Revenue Chart ── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
            <select className="text-sm border-gray-200 rounded-lg text-gray-600 bg-gray-50 focus:ring-[#E91E8C] focus:border-[#E91E8C]">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <AdminRevenueChart data={chartData} />
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-gray-400 hover:text-[#E91E8C] transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {recentOrders.length === 0 && (
                <li className="p-6 text-center text-gray-500">No recent orders</li>
              )}
              {recentOrders.map(order => (
                <li key={order.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">{order.invoiceNumber}</span>
                    <span className="text-sm font-bold text-[#E91E8C]">{formatPrice(Number(order.totalAmount))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{order.customerName} • {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Link 
              href="/admin/orders" 
              className="block w-full text-center text-sm font-semibold text-[#E91E8C] hover:underline"
            >
              View All Orders
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
