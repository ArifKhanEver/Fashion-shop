"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { adminDeleteProduct } from "@/actions/admin.product.actions";
import { toast } from "react-hot-toast";

type ProductType = {
  id: string;
  title: string;
  slug: string;
  price: any;
  discountedPrice: any;
  images: { url: string }[];
  variants: { color: string | null; size: string | null }[];
};

interface AdminProductsClientProps {
  initialProducts: ProductType[];
}

export default function AdminProductsClient({ initialProducts }: AdminProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredProducts = initialProducts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      setIsDeleting(id);
      try {
        await adminDeleteProduct(id);
        toast.success("Product deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product. It might be referenced in existing orders.");
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
          <p className="text-sm text-gray-500">Manage your store's inventory and product details.</p>
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
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
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
                <th className="p-4">Variants (Color/Size)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const colors = Array.from(new Set(product.variants.map(v => v.color).filter(Boolean)));
                  const sizes = Array.from(new Set(product.variants.map(v => v.size).filter(Boolean)));
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={product.images[0]?.url || "/placeholder-product.jpg"} 
                            alt={product.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">ID: {product.id.slice(0, 8).toUpperCase()}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#E91E8C]">{formatPrice(Number(product.price))}</p>
                        {product.discountedPrice && (
                          <p className="text-xs text-gray-400 line-through mt-0.5">{formatPrice(Number(product.discountedPrice))}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          {colors.length > 0 && <p><span className="font-semibold text-gray-700">Colors:</span> {colors.join(", ")}</p>}
                          {sizes.length > 0 && <p><span className="font-semibold text-gray-700">Sizes:</span> {sizes.join(", ")}</p>}
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
      </div>
    </div>
  );
}
