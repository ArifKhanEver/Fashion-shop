"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { adminDeleteProduct } from "@/actions/admin.product.actions";
import { toast } from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { Suspense } from "react";

type VariantType = {
  id: string;
  color: string | null;
  size: string | null;
  stock: number;
};

type ProductType = {
  id: string;
  title: string;
  slug: string;
  price: any;
  discountedPrice: any;
  isFeatured: boolean;
  isActive: boolean;
  images: { url: string }[];
  variants: VariantType[];
  totalStock: number;
  isLowStock: boolean;
  categories: { category: { name: string } }[];
};

interface AdminProductsClientProps {
  initialProducts: ProductType[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function AdminProductsClient({
  initialProducts,
  total,
  totalPages,
  currentPage,
}: AdminProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredProducts = initialProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      setIsDeleting(id);
      try {
        await adminDeleteProduct(id);
        toast.success("Product deleted successfully");
      } catch (error: any) {
        toast.error(
          error.message ||
            "Failed to delete product. It might be referenced in existing orders."
        );
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">
            {total} products ·{" "}
            {initialProducts.filter((p) => p.isLowStock).length > 0 && (
              <span className="text-red-600 font-semibold">
                ⚠ {initialProducts.filter((p) => p.isLowStock).length} low stock
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-[#E91E8C] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#d8157a] hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-medium">
            <AlertTriangle className="w-4 h-4" />
            Red = Low Stock (&lt;5 units)
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4 w-16">Image</th>
                <th className="p-4">Product Details</th>
                <th className="p-4">Price</th>
                <th className="p-4">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" /> Stock
                  </span>
                </th>
                <th className="p-4">Categories</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockClass =
                    product.totalStock === 0
                      ? "bg-red-50 text-red-700 border-red-200"
                      : product.isLowStock
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-green-50 text-green-700 border-green-200";

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        product.isLowStock ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              product.images[0]?.url || "/placeholder-product.jpg"
                            }
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900 line-clamp-1">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-xs text-gray-400 font-mono">
                            {product.id.slice(0, 8).toUpperCase()}
                          </p>
                          {product.isFeatured && (
                            <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded font-semibold">
                              Featured
                            </span>
                          )}
                          {!product.isActive && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#E91E8C]">
                          {formatPrice(Number(product.price))}
                        </p>
                        {product.discountedPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(Number(product.discountedPrice))}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border w-fit ${stockClass}`}
                          >
                            {product.isLowStock && product.totalStock > 0 && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {product.totalStock === 0
                              ? "Out of Stock"
                              : `${product.totalStock} units`}
                          </span>
                          <span className="text-xs text-gray-400">
                            {product.variants.length} variant
                            {product.variants.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {product.categories.slice(0, 2).map((pc) => (
                            <span
                              key={pc.category.name}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                            >
                              {pc.category.name}
                            </span>
                          ))}
                          {product.categories.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{product.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                            disabled={isDeleting === product.id}
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4">
            <Suspense>
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/admin/products"
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
