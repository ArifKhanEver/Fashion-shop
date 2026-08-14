import { prisma } from "./prisma";

export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key }
    });
    return setting?.value ?? defaultValue;
  } catch (error) {
    console.error(`Failed to fetch setting ${key}:`, error);
    return defaultValue;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return settingsMap;
  } catch (error) {
    console.error("Failed to fetch all settings:", error);
    return {};
  }
}
