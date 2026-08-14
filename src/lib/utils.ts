import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as BDT currency (e.g., "Tk 1,500")
 */
export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `Tk ${num.toLocaleString("en-BD")}`;
}

/**
 * Calculate discount percentage
 */
export function calcDiscount(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

/**
 * Generate a URL-safe slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a unique invoice number: CDBD-YYYY-XXXXXXXX
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `CDBD-${year}-${random}`;
}

/**
 * Delivery charge calculation based on division
 */
export function calcDeliveryCharge(division: string): number {
  const insideDhaka = ["dhaka"];
  return insideDhaka.includes(division.toLowerCase()) ? 60 : 120;
}

/**
 * Truncate text to a given length
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}
