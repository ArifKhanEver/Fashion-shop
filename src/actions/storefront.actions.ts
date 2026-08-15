"use server";

import { prisma } from "@/lib/prisma";

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Products ───────────────────────────────────────────────────────────────

interface GetProductsFilters {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  colors?: string[];
  sort?: string; // "newest" | "featured" | "price_asc" | "price_desc"
  categorySlug?: string; // filter by category slug
  minPrice?: number; // minimum price filter
  maxPrice?: number; // maximum price filter
}

export async function getProducts(filters: GetProductsFilters = {}) {
  const {
    page = 1,
    pageSize = 12,
    searchQuery = "",
    colors = [],
    sort = "newest",
    categorySlug = "",
    minPrice,
    maxPrice,
  } = filters;
  const skip = (page - 1) * pageSize;

  const where: any = {
    isActive: true,
  };

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
    ];
  }

  if (colors.length > 0) {
    where.variants = {
      some: {
        color: { in: colors },
      },
    };
  }

  // ── Category filter ──────────────────────────────────────────────────────
  if (categorySlug) {
    where.categories = {
      some: {
        category: { slug: categorySlug },
      },
    };
  }

  // ── Price range filter ───────────────────────────────────────────────────
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "featured") orderBy = { isFeatured: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: true,
        categories: { include: { category: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}

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

export async function getFeaturedProducts(limit = 10) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
  });
}

export async function getProductsByCategory(categorySlug: string, limit = 12) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) return null;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categories: { some: { categoryId: category.id } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
  });

  return { category, products };
}
