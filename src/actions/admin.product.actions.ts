"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Validation Schemas ───────────────────────────────────────────────────────
// These schemas enforce the shape of data coming from the admin forms.

const ProductImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
});

const ProductVariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  stock: z.number().int().min(0).default(0),
});

const ProductInputSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "Price must be positive"),
  discountedPrice: z.number().min(0).optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryIds: z.array(z.string()),
  images: z.array(ProductImageSchema).min(1, "At least one image is required"),
  variants: z.array(ProductVariantSchema).default([]),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns a paginated list of all products (including inactive) for the admin panel.
 * Supports an optional full-text search across title and slug fields.
 */
export async function adminGetProducts(
  searchQuery: string = "",
  page: number = 1,
  pageSize: number = 20
) {
  const skip = (page - 1) * pageSize;

  const where = searchQuery
    ? {
        OR: [
          { title: { contains: searchQuery } },
          { slug: { contains: searchQuery } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        categories: { include: { category: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    pages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}

/**
 * Fetches a single product by ID for the admin edit form.
 * Includes all related images, variants, and category associations.
 */
export async function adminGetProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      categories: true,
    },
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a new product with its images, variants, and category associations.
 * Validates input with Zod before writing to the database.
 * Revalidates the shop and homepage caches after creation.
 */
export async function adminCreateProduct(data: ProductInput) {
  const parsed = ProductInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const { categoryIds, images, variants, ...coreProductData } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...coreProductData,
      categories: {
        create: categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
      images: {
        create: images.map((image) => ({
          url: image.url,
          publicId: image.publicId,
          altText: image.altText,
          sortOrder: image.sortOrder,
        })),
      },
      variants: {
        create: variants.map((variant) => ({
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  return product;
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Updates an existing product inside a database transaction.
 *
 * The update strategy per relation:
 * - Categories: delete all existing associations, then recreate them.
 * - Images:     delete all existing images, then recreate them.
 * - Variants:   upsert — update existing ones by ID, create new ones,
 *               and delete variants that were removed. (We avoid deleting
 *               variants referenced by past orders, but attempt it if needed.)
 */
export async function adminUpdateProduct(id: string, data: ProductInput) {
  const parsed = ProductInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Validation error");
  }

  const { categoryIds, images, variants, ...coreProductData } = parsed.data;

  await prisma.$transaction(async (transaction) => {
    // Step 1: Update the core product fields (title, price, etc.)
    await transaction.product.update({
      where: { id },
      data: coreProductData,
    });

    // Step 2: Re-sync category associations (full replace)
    await transaction.productCategory.deleteMany({ where: { productId: id } });
    if (categoryIds.length > 0) {
      await transaction.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({ productId: id, categoryId })),
      });
    }

    // Step 3: Re-sync images (full replace is safe since images have no external references)
    await transaction.productImage.deleteMany({ where: { productId: id } });
    if (images.length > 0) {
      await transaction.productImage.createMany({
        data: images.map((image) => ({
          productId: id,
          url: image.url,
          publicId: image.publicId,
          altText: image.altText,
          sortOrder: image.sortOrder,
        })),
      });
    }

    // Step 4: Smart-sync variants (upsert to preserve order history)
    const existingVariants = await transaction.productVariant.findMany({
      where: { productId: id },
    });

    const existingVariantIds = new Set(existingVariants.map((v) => v.id));
    const incomingVariantIds = new Set(
      variants.filter((v) => v.id).map((v) => v.id as string)
    );

    // Remove variants that the admin deleted from the form
    const variantIdsToDelete = [...existingVariantIds].filter(
      (existingId) => !incomingVariantIds.has(existingId)
    );
    if (variantIdsToDelete.length > 0) {
      await transaction.productVariant.deleteMany({
        where: { id: { in: variantIdsToDelete } },
      });
    }

    // Update existing variants or create new ones
    for (const variant of variants) {
      const isExistingVariant = variant.id && existingVariantIds.has(variant.id);

      if (isExistingVariant) {
        await transaction.productVariant.update({
          where: { id: variant.id },
          data: { color: variant.color, size: variant.size, stock: variant.stock },
        });
      } else {
        await transaction.productVariant.create({
          data: {
            productId: id,
            color: variant.color,
            size: variant.size,
            stock: variant.stock,
          },
        });
      }
    }
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${parsed.data.slug}`);
  revalidatePath("/");

  return { success: true };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Permanently deletes a product by ID.
 * Cascading deletes in the schema will handle images and category associations.
 * NOTE: This will fail if any existing order references this product. Consider
 * using a soft-delete (isActive: false) if orders must be preserved.
 */
export async function adminDeleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  return { success: true };
}
