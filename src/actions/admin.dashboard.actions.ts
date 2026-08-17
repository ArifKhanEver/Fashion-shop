"use server";

import { prisma } from "@/lib/prisma";

// ─── KPI Summary ──────────────────────────────────────────────────────────────

/**
 * Fetches ALL key performance indicators shown on the admin dashboard.
 * Runs all queries in parallel for maximum performance.
 */
export async function getDashboardKPIs() {
  const [totalRevenueResult, totalOrders, pendingOrders, lowStockItems, activeProducts, allOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.productVariant.count({ where: { stock: { lt: 5 } } }),
      prisma.product.count({ where: { isActive: true } }),
      // Unique customer count — group by phone
      prisma.order.findMany({
        distinct: ["customerPhone"],
        select: { customerPhone: true },
      }),
    ]);

  // Status breakdown for the dashboard donut / stat widget
  const [processingOrders, shippedOrders, deliveredOrders, cancelledOrders] =
    await Promise.all([
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
    ]);

  return {
    totalRevenue: Number(totalRevenueResult._sum.totalAmount ?? 0),
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockProducts: lowStockItems,
    activeProducts,
    totalCustomers: allOrders.length,
  };
}

// ─── Recent Orders ────────────────────────────────────────────────────────────

/**
 * Fetches the most recent orders for the dashboard activity feed.
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
 * Calculates daily revenue totals for the past N days.
 * Supports 7, 14, and 30 day ranges.
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

  // Bucket per day
  const dailyTotals: Record<string, number> = {};
  for (let daysAgo = days - 1; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    // For longer ranges, use "MMM D" format; for 7 days use weekday
    const label =
      days <= 7
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyTotals[label] = 0;
  }

  for (const order of recentOrders) {
    const label =
      days <= 7
        ? order.createdAt.toLocaleDateString("en-US", { weekday: "short" })
        : order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (label in dailyTotals) {
      dailyTotals[label] = (dailyTotals[label] ?? 0) + Number(order.totalAmount ?? 0);
    }
  }

  return Object.entries(dailyTotals).map(([name, total]) => ({ name, total }));
}

// ─── Top Products ─────────────────────────────────────────────────────────────

/**
 * Returns the top N products by number of times they appear in order items.
 * Used in the dashboard top-products widget.
 */
export async function getTopProducts(limit: number = 5) {
  const result = await prisma.orderItem.groupBy({
    by: ["productId", "productTitle"],
    _count: { productId: true },
    _sum: { quantity: true },
    orderBy: { _count: { productId: "desc" } },
    take: limit,
  });

  return result.map((r) => ({
    productId: r.productId,
    productTitle: r.productTitle,
    orderCount: r._count.productId,
    unitsSold: r._sum.quantity ?? 0,
  }));
}

// ─── Order Status Counts ──────────────────────────────────────────────────────

/**
 * Returns order counts for each status value. Used for the tab badges
 * in the orders table.
 */
export async function getOrderStatusCounts() {
  const result = await prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const counts: Record<string, number> = {
    ALL: 0,
    PENDING: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  let total = 0;
  for (const row of result) {
    counts[row.status] = row._count.status;
    total += row._count.status;
  }
  counts["ALL"] = total;

  return counts;
}

// ─── Products with Stock ──────────────────────────────────────────────────────

/**
 * Returns all products with their total stock across all variants.
 * Used in the admin products table for the inventory column.
 */
export async function getAdminProductsWithStock(page = 1, pageSize = 20) {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: { select: { id: true, color: true, size: true, stock: true } },
        categories: { include: { category: { select: { name: true } } } },
      },
    }),
    prisma.product.count(),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
      isLowStock: p.variants.some((v) => v.stock < 5),
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentPage: page,
  };
}
