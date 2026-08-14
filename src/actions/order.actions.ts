"use server";

import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber, calcDeliveryCharge } from "@/lib/utils";
import { z } from "zod";
import { CartItem } from "@/types";

// ─── Checkout Schema ────────────────────────────────────────────────────────
const CheckoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  fullAddress: z.string().min(5, "Full address is required"),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

// ─── Place Order ────────────────────────────────────────────────────────────
export async function placeOrder(
  formData: CheckoutInput,
  cartItems: CartItem[]
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  // Validate
  const parsed = CheckoutSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  if (cartItems.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  try {
    const deliveryCharge = calcDeliveryCharge(formData.division);
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalAmount = subtotal + deliveryCharge;
    const invoiceNumber = generateInvoiceNumber();

    const order = await prisma.order.create({
      data: {
        invoiceNumber,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail ?? null,
        division: formData.division,
        district: formData.district,
        fullAddress: formData.fullAddress,
        subtotal,
        deliveryCharge,
        totalAmount,
        status: "PENDING",
        items: {
          create: cartItems.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.price,
            productTitle: item.title,
            variantColor: item.color ?? null,
            variantSize: item.size ?? null,
            productImageUrl: item.imageUrl,
            product: { connect: { id: item.productId } },
            ...(item.variantId
              ? { variant: { connect: { id: item.variantId } } }
              : {}),
          })),
        },
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Order placement failed:", error);
    return { success: false, error: "Failed to place order. Please try again." };
  }
}

// ─── Get Order by ID ────────────────────────────────────────────────────────
export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true, variant: true } } },
  });
}

// ─── Track Order ────────────────────────────────────────────────────────────
export async function trackOrder(query: string) {
  // Search by invoice number or phone number
  return prisma.order.findFirst({
    where: {
      OR: [
        { invoiceNumber: { contains: query } },
        { customerPhone: query },
        { id: query },
      ],
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Admin: Get All Orders ──────────────────────────────────────────────────
export async function adminGetOrders(
  status?: string,
  page = 1,
  pageSize = 20
) {
  const where =
    status && status !== "ALL" ? { status: status as never } : undefined;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, pages: Math.ceil(total / pageSize), page };
}

// ─── Admin: Update Order Status ─────────────────────────────────────────────
export async function adminUpdateOrderStatus(
  orderId: string,
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}
