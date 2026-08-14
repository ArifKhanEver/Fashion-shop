import { adminGetCategories } from "@/actions/admin.actions";
import AdminProductNewClient from "./AdminProductNewClient";

export default async function AdminProductNewPage() {
  const categories = await adminGetCategories();
  
  return <AdminProductNewClient categories={categories} />;
}
