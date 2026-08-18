import { adminGetCategories } from "@/actions/admin.actions";
import { adminGetProductById } from "@/actions/admin.product.actions";
import { notFound } from "next/navigation";
import AdminProductEditClient from "./AdminProductEditClient";

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    adminGetProductById(id),
    adminGetCategories()
  ]);

  if (!product) {
    notFound();
  }
  
  return <AdminProductEditClient product={product} categories={categories} />;
}
