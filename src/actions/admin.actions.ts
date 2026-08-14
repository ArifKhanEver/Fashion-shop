"use server";

import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─── Auth Guard ─────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ─── Category CRUD ──────────────────────────────────────────────────────────
const CategorySchema = z.object({
  name: z.string().min(1, "Name required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  imageId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

export async function adminCreateCategory(data: z.infer<typeof CategorySchema>) {
  await requireAdmin();
  const slug = data.slug?.trim() || slugify(data.name);
  const category = await prisma.category.create({
    data: { ...data, slug },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true, category };
}

export async function adminUpdateCategory(
  id: string,
  data: Partial<z.infer<typeof CategorySchema>>
) {
  await requireAdmin();
  const slug = data.slug?.trim() || (data.name ? slugify(data.name) : undefined);
  const category = await prisma.category.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}) },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true, category };
}

export async function adminDeleteCategory(id: string) {
  await requireAdmin();
  // Delete image from Cloudinary if exists
  const cat = await prisma.category.findUnique({ where: { id } });
  if (cat?.imageId) await deleteFromCloudinary(cat.imageId).catch(() => {});
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function adminGetCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}


