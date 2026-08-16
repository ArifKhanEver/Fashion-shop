"use server";

import { prisma } from "@/lib/prisma";

// ─── KPI Summary ──────────────────────────────────────────────────────────────

/**
 * Fetches the four key performance indicators shown on the admin dashboard:
 * - Total Revenue (sum of all non-cancelled orders)
 * - Total Orders (all time)
 * - Pending Orders (awaiting fulfillment)
 * - Low Stock Items (variants with fewer than 10 units remaining)
 *
 * All four queries run in parallel for performance.
 */
export async function getDashboardKPIs() {
  const [totalRevenueResult, totalOrders, pendingOrders, lowStockItems] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.productVariant.count({ where: { stock: { lt: 10 } } }),
    ]);

  return {
    totalRevenue: Number(totalRevenueResult._sum.totalAmount ?? 0),
    totalOrders,
    pendingOrders,
    lowStockProducts: lowStockItems,
  };
}

// ─── Recent Orders ────────────────────────────────────────────────────────────

/**
 * Fetches the most recent orders for the dashboard activity feed.
 * Only selects the fields needed for the order list — avoids over-fetching.
 * @param limit - Number of orders to return (default: 5)
 */
export async function getRecentOrders(limit: number = 5) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      invoiceNumber: true,
      customerName: true,
      customerPhone: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
  });
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────

/**
 * Calculates daily revenue totals for the past N days, used to render the
 * line chart on the admin dashboard.
 *
 * Returns an array like: [{ name: "Mon", total: 4200 }, { name: "Tue", total: 1800 }, ...]
 *
 * @param days - How many past days to include (default: 7)
 */
export async function getRevenueChartData(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const recentOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: "CANCELLED" },
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
  });

  // Initialise a bucket for each of the past N days, starting at 0
  const dailyTotals: Record<string, number> = {};
  for (let daysAgo = days - 1; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Mon"
    dailyTotals[dayLabel] = 0;
  }

  // Accumulate order revenue into the correct day bucket
  for (const order of recentOrders) {
    const dayLabel = order.createdAt.toLocaleDateString("en-US", {
      weekday: "short",
    });
    if (dayLabel in dailyTotals) {
      dailyTotals[dayLabel] += Number(order.totalAmount);
    }
  }

  return Object.entries(dailyTotals).map(([name, total]) => ({ name, total }));
}
