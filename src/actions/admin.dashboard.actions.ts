"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardKPIs() {
  const [totalRevenueResult, totalOrders, pendingOrders, lowStockProducts] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true }
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.productVariant.count({ where: { stock: { lt: 10 } } })
  ]);

  return {
    totalRevenue: Number(totalRevenueResult._sum.totalAmount || 0),
    totalOrders,
    pendingOrders,
    lowStockProducts
  };
}

export async function getRecentOrders(limit: number = 5) {
  return await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      invoiceNumber: true,
      customerName: true,
      customerPhone: true,
      totalAmount: true,
      status: true,
      createdAt: true
    }
  });
}

export async function getRevenueChartData(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: "CANCELLED" }
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  });

  const chartData: Record<string, number> = {};
  
  // Initialize last X days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString("en-US", { weekday: 'short' }); // e.g. "Mon"
    chartData[dayStr] = 0;
  }

  // Aggregate
  for (const order of orders) {
    const dayStr = order.createdAt.toLocaleDateString("en-US", { weekday: 'short' });
    if (chartData[dayStr] !== undefined) {
      chartData[dayStr] += Number(order.totalAmount);
    }
  }

  return Object.entries(chartData).map(([name, total]) => ({ name, total }));
}
