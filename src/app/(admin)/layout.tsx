import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import AdminHeader from "@/components/admin/AdminHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard — DevWonder Fashion",
    template: "%s | Admin — DevWonder Fashion",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await auth();
  // if (!session) redirect("/admin/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <AdminBreadcrumbs />
          {children}
        </div>
      </main>
      </div>
    </div>
  );
}
