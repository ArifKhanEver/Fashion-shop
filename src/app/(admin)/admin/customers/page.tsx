import { getCustomers } from "@/actions/admin.customer.actions";
import AdminCustomersClient from "./AdminCustomersClient";
import { Suspense } from "react";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const page = typeof resolved.page === "string" ? parseInt(resolved.page) : 1;
  const search = typeof resolved.search === "string" ? resolved.search : "";

  const { customers, total, totalPages } = await getCustomers(page, 20, search);

  return (
    <Suspense fallback={<div className="space-y-6"><AdminTableSkeleton rows={8} /></div>}>
      <AdminCustomersClient
        customers={customers}
        total={total}
        totalPages={totalPages}
        currentPage={page}
        initialSearch={search}
      />
    </Suspense>
  );
}
