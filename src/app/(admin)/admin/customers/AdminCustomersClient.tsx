"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Users, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AdminPagination from "@/components/admin/AdminPagination";
import { Suspense } from "react";
import type { CustomerSummary } from "@/actions/admin.customer.actions";

interface AdminCustomersClientProps {
  customers: CustomerSummary[];
  total: number;
  totalPages: number;
  currentPage: number;
  initialSearch: string;
}

function CustomersContent({
  customers,
  total,
  totalPages,
  currentPage,
  initialSearch,
}: AdminCustomersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/admin/customers?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#E91E8C]" /> Customers
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {total.toLocaleString()} unique customers identified by phone number.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-[#E91E8C] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#d8157a] transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Last Order</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.customerPhone} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E91E8C] to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {customer.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.customerName}</p>
                          {customer.customerEmail && (
                            <p className="text-xs text-gray-500">{customer.customerEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600">{customer.customerPhone}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                        {customer.totalOrders}
                        <span className="text-xs font-normal text-gray-400">orders</span>
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#E91E8C]">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(customer.lastOrderDate).toLocaleDateString("en-BD", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <Link
                          href={`/admin/customers/${encodeURIComponent(customer.customerPhone)}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Customer"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/admin/customers"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCustomersClient(props: AdminCustomersClientProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CustomersContent {...props} />
    </Suspense>
  );
}
