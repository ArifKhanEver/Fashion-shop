import { adminGetCategories } from "@/actions/admin.actions";
import { adminGetProductById } from "@/actions/admin.product.actions";
import { notFound } from "next/navigation";
import AdminProductEditClient from "./AdminProductEditClient";

export default async function AdminProductEditPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    adminGetProductById(params.id),
    adminGetCategories()
  ]);

  if (!product) {
    notFound();
  }
  
  return <AdminProductEditClient product={product} categories={categories} />;
}
