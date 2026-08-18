import { Suspense } from "react";
import AdminProductsClient from "./AdminProductsClient";
import { getAdminProductsWithStock } from "@/actions/admin.dashboard.actions";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const page = typeof resolved.page === "string" ? parseInt(resolved.page) : 1;

  const { products, total, totalPages, currentPage } = await getAdminProductsWithStock(page, 20);

  return (
    <Suspense fallback={<div className="space-y-6"><AdminTableSkeleton rows={8} /></div>}>
      <AdminProductsClient
        initialProducts={products as any}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </Suspense>
  );
}
