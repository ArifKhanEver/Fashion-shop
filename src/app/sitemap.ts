import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fashion.devwonder.shop";

  // Base routes
  const routes = [
    "",
    "/shop",
    "/cart",
    "/checkout",
    "/track-order",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch from DB
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  // Product routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Category routes
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
