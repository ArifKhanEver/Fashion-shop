"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const settings = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }
  return settingsMap;
}

export async function updateSetting(key: string, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  
  // Revalidate everything as settings like Analytics or UI can affect any page
  revalidatePath("/", "layout");
}

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

  // Revalidate global layout to reflect updated script tags or store names
  revalidatePath("/", "layout");
}
