"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetches all site settings as a flat key/value map.
 * Example result: { "store_name": "DevWonder Fashion", "ga_id": "G-XXXXX" }
 */
export async function getSettings(): Promise<Record<string, string>> {
  const allSettings = await prisma.siteSetting.findMany();

  const settingsMap: Record<string, string> = {};
  for (const setting of allSettings) {
    settingsMap[setting.key] = setting.value;
  }

  return settingsMap;
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Creates or updates a single site setting by key.
 * Revalidates the entire app layout because settings can affect any page
 * (e.g., analytics IDs, store branding).
 */
export async function updateSetting(key: string, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  revalidatePath("/", "layout");
}

/**
 * Batch-updates multiple site settings from a FormData object (e.g., a settings form).
 * Each FormData entry key becomes the setting key, and its string value is saved.
 * Revalidates the entire app layout after saving.
 */
export async function updateMultipleSettings(formData: FormData) {
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  revalidatePath("/", "layout");
}
