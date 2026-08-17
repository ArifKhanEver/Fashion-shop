import { Suspense } from "react";
import AdminProductsClient from "./AdminProductsClient";
import { getAdminProductsWithStock } from "@/actions/admin.dashboard.actions";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const page = typeof resolved.page === "string" ? parseInt(resolved.page) : 1;

  const { products, total, totalPages, currentPage } = await getAdminProductsWithStock(page, 20);

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading products...</div>}>
      <AdminProductsClient
        initialProducts={products as any}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </Suspense>
  );
}
