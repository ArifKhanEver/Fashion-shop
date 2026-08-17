"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CouponData {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderAmount?: number | null;
  usageLimit?: number | null;
  isActive?: boolean;
  expiresAt?: string | null; // ISO date string
}

// ─── List Coupons ─────────────────────────────────────────────────────────────

export async function getCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// ─── Create Coupon ────────────────────────────────────────────────────────────

export async function createCoupon(
  data: CouponData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Normalise the code to uppercase
    const code = data.code.trim().toUpperCase();

    await prisma.coupon.create({
      data: {
        code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount ?? null,
        usageLimit: data.usageLimit ?? null,
        isActive: data.isActive ?? true,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "A coupon with this code already exists." };
    }
    return { success: false, error: error.message ?? "Failed to create coupon." };
  }
}

// ─── Toggle Active State ──────────────────────────────────────────────────────

export async function toggleCouponActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean }> {
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
  return { success: true };
}

// ─── Delete Coupon ────────────────────────────────────────────────────────────

export async function deleteCoupon(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message ?? "Failed to delete coupon." };
  }
}

// ─── Validate Coupon (Storefront) ─────────────────────────────────────────────

/**
 * Validates a coupon code at checkout. Checks:
 * - Code exists and is active
 * - Not expired
 * - Usage limit not exceeded
 * - Cart total meets minimum order amount
 *
 * Returns the discount amount (not the percent) so the frontend just subtracts it.
 */
export async function validateCoupon(
  code: string,
  cartTotal: number
): Promise<{ valid: boolean; discount: number; message?: string }> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return { valid: false, discount: 0, message: "Invalid or inactive coupon code." };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, discount: 0, message: "This coupon has expired." };
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: "This coupon has reached its usage limit." };
  }

  const min = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
  if (cartTotal < min) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order of ৳${min} required for this coupon.`,
    };
  }

  const discountValue = Number(coupon.discountValue);
  const discount =
    coupon.discountType === "PERCENT"
      ? Math.round((cartTotal * discountValue) / 100)
      : Math.min(discountValue, cartTotal);

  return { valid: true, discount };
}
