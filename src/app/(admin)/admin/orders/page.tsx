import { adminGetOrders } from "@/actions/order.actions";
import { getOrderStatusCounts } from "@/actions/admin.dashboard.actions";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : undefined;

  const [{ orders, total, pages }, statusCounts] = await Promise.all([
    adminGetOrders(status, page, 20),
    getOrderStatusCounts(),
  ]);

  return (
    <AdminOrdersClient
      orders={orders}
      total={total}
      totalPages={pages}
      currentPage={page}
      statusCounts={statusCounts}
    />
  );
}
