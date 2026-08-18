"use client";

import { useState, useTransition } from "react";
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  image: string | null;
  imageId: string | null;
  createdAt: Date;
  _count: { products: number };
}

interface AdminCategoriesClientProps {
  categories: Category[];
}

interface ModalState {
  open: boolean;
  mode: "create" | "edit";
  category?: Category;
}

export default function AdminCategoriesClient({
  categories,
}: AdminCategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<ModalState>({ open: false, mode: "create" });
  const [form, setForm] = useState({ name: "", slug: "", isActive: true, image: "", imageId: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setForm({ name: "", slug: "", isActive: true, image: "", imageId: "" });
    setModal({ open: true, mode: "create" });
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, isActive: cat.isActive, image: cat.image || "", imageId: cat.imageId || "" });
    setModal({ open: true, mode: "edit", category: cat });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (modal.mode === "create") {
          await adminCreateCategory({
            name: form.name,
            slug: form.slug || slugify(form.name),
            image: form.image || undefined,
            imageId: form.imageId || undefined,
            isActive: form.isActive,
            sortOrder: 0,
          });
          toast({ title: "Category created ✓", variant: "success" });
        } else if (modal.category) {
          await adminUpdateCategory(modal.category.id, {
            name: form.name,
            slug: form.slug || slugify(form.name),
            image: form.image || undefined,
            imageId: form.imageId || undefined,
            isActive: form.isActive,
            sortOrder: modal.category.sortOrder ?? 0,
          });
          toast({ title: "Category updated ✓", variant: "success" });
        }
        setModal({ open: false, mode: "create" });
        router.refresh();
      } catch {
        toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await adminDeleteCategory(id);
        toast({ title: "Category deleted", variant: "success" });
        setDeleteId(null);
        router.refresh();
      } catch {
        toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large (max 5MB)", variant: "destructive" });
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "devwonder_fashion/categories");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      setForm(p => ({ ...p, image: data.url, imageId: data.publicId }));
      toast({ title: "Image uploaded successfully", variant: "success" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">All Categories</h2>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Category
          </Button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Icon", "Name", "Slug", "Products", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50">
                <td className="py-3.5 px-4">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 font-medium text-gray-900">{cat.name}</td>
                <td className="py-3.5 px-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                <td className="py-3.5 px-4 text-gray-600">{cat._count.products}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cat.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {deleteId === cat.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title={cat._count.products > 0 ? `${cat._count.products} products exist` : "Delete"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                  No categories yet. Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {modal.mode === "create" ? "Create Category" : "Edit Category"}
              </h2>
              <button
                onClick={() => setModal({ open: false, mode: "create" })}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((p) => ({
                      ...p,
                      name,
                      slug: slugify(name),
                    }));
                  }}
                  placeholder="e.g. Luxury Heels"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="auto-generated from name"
                />
                  <p className="text-xs text-gray-400 mt-1">
                  Used in URL: /category/{form.slug || "..."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category Icon/Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {form.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.image} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 border-dashed text-gray-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="categoryImageUpload"
                    />
                    <label
                      htmlFor="categoryImageUpload"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 h-9 px-4 py-2 cursor-pointer w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                        </>
                      ) : (
                        form.image ? "Change Image" : "Upload Image"
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#E91E8C]"
                />
                <span className="text-sm font-medium text-gray-700">Active (visible on storefront)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setModal({ open: false, mode: "create" })}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending
                    ? "Saving..."
                    : modal.mode === "create"
                    ? "Create"
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
