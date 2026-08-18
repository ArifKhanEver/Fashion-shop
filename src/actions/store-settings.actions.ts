"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { revalidatePath } from "next/cache";

// Use React cache to deeply memoize this function within a single render pass
export const getGlobalStoreSettings = cache(async () => {
  try {
    const controller = new AbortController();
    
    // Fallback settings
    const defaultSettings = {
      id: "singleton",
      storeName: "DevWonder Fashion",
      headerLogoUrl: null,
      phoneNumber: null,
      whatsappNumber: null,
      deliveryChargeInside: 80,
      deliveryChargeOutside: 120,
      gaMeasurementId: null,
      metaPixelId: null,
      sliderImages: null,
      updatedAt: new Date(),
    };

    if (!prisma.storeSettings) {
      console.warn("Prisma Client out of sync or old cache. Returning defaults.");
      return defaultSettings;
    }

    const dbPromise = prisma.storeSettings.findUnique({
      where: { id: "singleton" },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      const id = setTimeout(() => reject(new Error("Database timeout")), 10000);
      controller.signal.addEventListener("abort", () => clearTimeout(id));
    });

    try {
      const settings = await Promise.race([dbPromise, timeoutPromise]);
      controller.abort(); // Clear timeout
      return settings ?? defaultSettings;
    } catch (e) {
      controller.abort(); // Clear timeout
      throw e;
    }
  } catch (error) {
    console.error("Failed to fetch global store settings:", error);
    return {
      id: "singleton",
      storeName: "DevWonder Fashion",
      headerLogoUrl: null,
      phoneNumber: null,
      whatsappNumber: null,
      deliveryChargeInside: 80,
      deliveryChargeOutside: 120,
      gaMeasurementId: null,
      metaPixelId: null,
      sliderImages: null,
      updatedAt: new Date(),
    };
  }
});

export async function updateGlobalStoreSettings(data: {
  storeName?: string;
  headerLogoUrl?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  deliveryChargeInside?: number;
  deliveryChargeOutside?: number;
  gaMeasurementId?: string | null;
  metaPixelId?: string | null;
  sliderImages?: string[];
}) {
  try {
    await prisma.storeSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: {
        id: "singleton",
        ...data,
      },
    });
    
    // Revalidate paths so the new settings appear globally immediately
    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update store settings:", error);
    return { success: false, error: error.message };
  }
}
