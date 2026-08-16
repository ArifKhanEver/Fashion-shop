"use server";

import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─── Auth Guard ───────────────────────────────────────────────────────────────

/**
 * Throws an error if the current request is not authenticated as an admin.
 * Call this at the start of any sensitive server action.
 */
async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ─── Category Validation ──────────────────────────────────────────────────────

const CategorySchema = z.object({
  name: z.string().min(1, "Name required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  imageId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

// ─── Category CRUD ────────────────────────────────────────────────────────────

/**
 * Creates a new product category.
 * Auto-generates a URL slug from the name if one is not provided.
 * Revalidates the homepage and admin category list after creation.
 */
export async function adminCreateCategory(
  data: z.infer<typeof CategorySchema>
) {
  await requireAdmin();

  const slug = data.slug?.trim() || slugify(data.name);
  const category = await prisma.category.create({
    data: { ...data, slug },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");

  return { success: true, category };
}

/**
 * Updates an existing category.
 * Re-generates the slug from the new name if no explicit slug is provided.
 */
export async function adminUpdateCategory(
  id: string,
  data: Partial<z.infer<typeof CategorySchema>>
) {
  await requireAdmin();

  const slug =
    data.slug?.trim() || (data.name ? slugify(data.name) : undefined);

  const category = await prisma.category.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}) },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");

  return { success: true, category };
}

/**
 * Permanently deletes a category.
 * If the category had a Cloudinary image, it is also deleted from cloud storage.
 */
export async function adminDeleteCategory(id: string) {
  await requireAdmin();

  const category = await prisma.category.findUnique({ where: { id } });

  // Clean up the category image from Cloudinary if it exists
  if (category?.imageId) {
    await deleteFromCloudinary(category.imageId).catch(() => {
      // Non-fatal: log but continue with DB deletion even if Cloudinary fails
    });
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");

  return { success: true };
}

/**
 * Returns all categories, ordered by sort position.
 * Includes a product count for each category (used in the admin table).
 */
export async function adminGetCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
}
