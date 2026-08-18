"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ─── Get Featured Products ──────────────────────────────────────────────────
export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { id: true, color: true, size: true, stock: true, imageUrl: true } },
    },
  });
}

// ─── Get Products by Category ───────────────────────────────────────────────
export async function getProductsByCategory(categorySlug: string, limit = 10) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      categories: { some: { category: { slug: categorySlug } } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { id: true, color: true, size: true, stock: true, imageUrl: true } },
    },
  });
}

// ─── Get All Active Categories ──────────────────────────────────────────────
export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
}

// ─── Get Product by Slug ────────────────────────────────────────────────────
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      categories: { include: { category: true } },
    },
  });
}

// ─── Get Shop Products (with filters) ──────────────────────────────────────
export interface ShopFilters {
  query?: string;
  categorySlug?: string;
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price_asc" | "price_desc" | "newest";
  page?: number;
  pageSize?: number;
}

export async function getShopProducts(filters: ShopFilters = {}) {
  const {
    query,
    categorySlug,
    colors,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    pageSize = 24,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query && {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    }),
    ...(categorySlug && {
      categories: { some: { category: { slug: categorySlug } } },
    }),
    ...(colors?.length && {
      variants: { some: { color: { in: colors } } },
    }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          OR: [
            {
              discountedPrice: {
                ...(minPrice !== undefined && { gte: new Prisma.Decimal(minPrice) }),
                ...(maxPrice !== undefined && { lte: new Prisma.Decimal(maxPrice) }),
              },
            },
            {
              discountedPrice: null,
              price: {
                ...(minPrice !== undefined && { gte: new Prisma.Decimal(minPrice) }),
                ...(maxPrice !== undefined && { lte: new Prisma.Decimal(maxPrice) }),
              },
            },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "featured"
      ? { isFeatured: "desc" }
      : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { select: { id: true, color: true, size: true, stock: true, imageUrl: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, pages: Math.ceil(total / pageSize), page };
}

// ─── Get Related Products ───────────────────────────────────────────────────
export async function getRelatedProducts(productId: string, limit = 6) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { categories: true },
  });

  if (!product) return [];

  const categoryIds = product.categories.map((c) => c.categoryId);

  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { id: true, color: true, size: true, stock: true, imageUrl: true } },
    },
  });
}
