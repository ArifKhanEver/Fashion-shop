"use server";

import { prisma } from "@/lib/prisma";

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * Fetches all active product categories, ordered by their sort position.
 * Used in the storefront navigation, shop sidebar, and homepage category grid.
 */
export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

/** Filter options accepted by getProducts */
interface GetProductsFilters {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  colors?: string[];
  sort?: "newest" | "featured" | "price_asc" | "price_desc";
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Fetches a paginated list of active products with optional filters.
 * Supports search, category, price range, and sort order.
 * Returns products alongside pagination metadata.
 */
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

  // Build the WHERE clause incrementally so each condition is easy to follow
  const where: Record<string, unknown> = {
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
      some: { color: { in: colors } },
    };
  }

  if (categorySlug) {
    where.categories = {
      some: {
        category: { slug: categorySlug },
      },
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    where.price = priceFilter;
  }

  // Map sort option to a Prisma orderBy object
  const sortOptions: Record<string, Record<string, string>> = {
    newest: { createdAt: "desc" },
    featured: { isFeatured: "desc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
  };
  const orderBy = sortOptions[sort] ?? sortOptions.newest;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: true,
        categories: {
          include: {
            category: { select: { name: true, slug: true } },
          },
        },
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

/**
 * Fetches a single active product by its URL slug.
 * Includes all images, variants, and category data for the product detail page.
 */
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

/**
 * Fetches featured products for the homepage hero section.
 * @param limit - Maximum number of products to return (default: 10)
 */
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

/**
 * Fetches a category and its products by category slug.
 * Used on the /category/[slug] storefront page.
 * Returns null if the category does not exist.
 */
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
