import { prisma } from "./prisma";

export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Database timeout")), 3000)
    );
    
    const dbPromise = prisma.siteSetting.findUnique({
      where: { key }
    });

    const setting = await Promise.race([dbPromise, timeoutPromise]);
    return setting?.value ?? defaultValue;
  } catch (error) {
    console.error(`Failed to fetch setting ${key}:`, error);
    return defaultValue;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Database timeout")), 3000)
    );
    
    const dbPromise = prisma.siteSetting.findMany();
    const settings = await Promise.race([dbPromise, timeoutPromise]) as any[];
    
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
