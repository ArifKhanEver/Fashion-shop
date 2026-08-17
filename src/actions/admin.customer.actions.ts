"use server";

import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerSummary {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
}

export interface CustomerDetail {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalOrders: number;
  totalSpent: number;
  orders: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
    items: { productTitle: string; quantity: number; unitPrice: number }[];
  }[];
}

// ─── Get All Customers ────────────────────────────────────────────────────────

/**
 * Aggregates unique customers from the orders table, since we don't have
 * a separate User/Customer model — customers are identified by phone number.
 *
 * Groups orders by phone number and returns customer-level metrics.
 */
export async function getCustomers(
  page = 1,
  pageSize = 20,
  search = ""
): Promise<{ customers: CustomerSummary[]; total: number; totalPages: number }> {
  // Fetch all orders, group by phone in JS (TiDB doesn't always support groupBy raw)
  const orders = await prisma.order.findMany({
    where: search
      ? {
          OR: [
            { customerPhone: { contains: search } },
            { customerName: { contains: search } },
            { customerEmail: { contains: search } },
          ],
        }
      : undefined,
    select: {
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      totalAmount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by phone number
  const phoneMap = new Map<string, CustomerSummary>();
  for (const order of orders) {
    const key = order.customerPhone;
    const existing = phoneMap.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += Number(order.totalAmount);
      if (order.createdAt > existing.lastOrderDate) {
        existing.lastOrderDate = order.createdAt;
      }
    } else {
      phoneMap.set(key, {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        totalOrders: 1,
        totalSpent: Number(order.totalAmount),
        lastOrderDate: order.createdAt,
      });
    }
  }

  const allCustomers = Array.from(phoneMap.values()).sort(
    (a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime()
  );

  const total = allCustomers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const customers = allCustomers.slice(start, start + pageSize);

  return { customers, total, totalPages };
}

// ─── Get Customer Detail ──────────────────────────────────────────────────────

/**
 * Returns detailed information about a single customer identified by phone,
 * including their full order history.
 */
export async function getCustomerByPhone(
  phone: string
): Promise<CustomerDetail | null> {
  const orders = await prisma.order.findMany({
    where: { customerPhone: phone },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          productTitle: true,
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });

  if (orders.length === 0) return null;

  const firstOrder = orders[0]!;

  return {
    customerName: firstOrder.customerName,
    customerPhone: firstOrder.customerPhone,
    customerEmail: firstOrder.customerEmail,
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    orders: orders.map((o) => ({
      id: o.id,
      invoiceNumber: o.invoiceNumber,
      totalAmount: Number(o.totalAmount),
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map((item) => ({
        productTitle: item.productTitle,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    })),
  };
}
