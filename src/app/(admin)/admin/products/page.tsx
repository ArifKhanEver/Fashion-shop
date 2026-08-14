import { adminGetProducts } from "@/actions/admin.product.actions";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const { products } = await adminGetProducts();

  return (
    <AdminProductsClient initialProducts={products} />
  );
}
