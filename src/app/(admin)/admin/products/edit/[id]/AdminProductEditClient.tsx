"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, Plus, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { adminUpdateProduct } from "@/actions/admin.product.actions";

type CategoryType = { id: string; name: string };
type ProductType = any; // We can type it properly, but using any for brevity since it comes from Prisma include

interface AdminProductEditClientProps {
  categories: CategoryType[];
  product: ProductType;
}

type VariantState = {
  id: string; // temp id for key
  color: string | null;
  size: string | null;
  stock: number;
  imageUrl: string | null;
  isUploading: boolean;
};

export default function AdminProductEditClient({ categories, product }: AdminProductEditClientProps) {
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Derive initial unique colors and sizes from variants
  const initialColors = Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) as string[];
  const initialSizes = Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))) as string[];
  const initialStock = product.variants[0]?.stock?.toString() || "10";
  const initialCategoryId = product.categories[0]?.categoryId || "";

  // Form State
  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(product.price?.toString() || "");
  const [discountedPrice, setDiscountedPrice] = useState(product.discountedPrice?.toString() || "");
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  
  // Variants
  const [colors, setColors] = useState<string[]>(initialColors);
  const [colorInput, setColorInput] = useState("");
  const [sizes, setSizes] = useState<string[]>(initialSizes);
  const [sizeInput, setSizeInput] = useState("");
  const [stock, setStock] = useState(initialStock);

  const [variants, setVariants] = useState<VariantState[]>(
    product.variants.map((v: any) => ({
      id: v.id,
      color: v.color || null,
      size: v.size || null,
      stock: v.stock || 0,
      imageUrl: v.imageUrl || null,
      isUploading: false
    }))
  );

  // Rebuild variants when colors or sizes change
  useEffect(() => {
    let newVariants: VariantState[] = [];
    const defaultStock = parseInt(stock) || 10;

    if (colors.length === 0 && sizes.length === 0) {
      newVariants.push({ id: 'default', color: null, size: null, stock: defaultStock, imageUrl: null, isUploading: false });
    } else if (colors.length > 0 && sizes.length === 0) {
      colors.forEach(c => newVariants.push({ id: `c-${c}`, color: c, size: null, stock: defaultStock, imageUrl: null, isUploading: false }));
    } else if (colors.length === 0 && sizes.length > 0) {
      sizes.forEach(s => newVariants.push({ id: `s-${s}`, color: null, size: s, stock: defaultStock, imageUrl: null, isUploading: false }));
    } else {
      colors.forEach(c => {
        sizes.forEach(s => {
          newVariants.push({ id: `c-${c}-s-${s}`, color: c, size: s, stock: defaultStock, imageUrl: null, isUploading: false });
        });
      });
    }

    // Preserve existing overrides
    newVariants = newVariants.map(nv => {
      const existing = variants.find(v => v.color === nv.color && v.size === nv.size);
      if (existing) {
        return existing;
      }
      return nv;
    });

    setVariants(newVariants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, sizes]);

  const updateVariantStock = (id: string, newStock: number) => {
    setVariants(variants.map(v => v.id === id ? { ...v, stock: newStock } : v));
  };

  const updateVariantImage = async (id: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      return toast.error(`File is too large (max 5MB)`);
    }
    
    // Set loading
    setVariants(variants.map(v => v.id === id ? { ...v, isUploading: true } : v));
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "devwonder/products/variants");

      const res = await fetch("/api/upload?type=variant", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed`);
      const data = await res.json();
      
      setVariants(variants.map(v => v.id === id ? { ...v, imageUrl: data.url, isUploading: false } : v));
      toast.success("Variant image uploaded");
    } catch (error: any) {
      setVariants(variants.map(v => v.id === id ? { ...v, isUploading: false } : v));
      toast.error(error.message || "Failed to upload image");
    }
  };

  const removeVariantImage = (id: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, imageUrl: null } : v));
  };

  // Images
  const [images, setImages] = useState<{url: string, publicId: string}[]>(
    product.images.map((img: any) => ({ url: img.url, publicId: img.publicId }))
  );

  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput("");
    }
  };

  const addSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "devwonder/products");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
        const data = await res.json();
        newImages.push({ url: data.url, publicId: data.publicId });
      }
      setImages(newImages);
      toast.success("Images uploaded");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const removeImage = (publicId: string) => {
    setImages(images.filter(img => img.publicId !== publicId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !categoryId) {
      return toast.error("Please fill all required fields");
    }
    if (images.length === 0) {
      return toast.error("Please upload at least one main product image");
    }

    setIsSubmitting(true);
    try {
      const cleanVariants = variants.map(({ color, size, stock, imageUrl }) => ({
        color,
        size,
        stock,
        imageUrl
      }));

      await adminUpdateProduct(product.id, {
        title,
        slug: slug || "",
        description,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
        isFeatured: product.isFeatured || false,
        isActive: product.isActive,
        categoryIds: [categoryId],
        images: images.map((img, i) => ({ ...img, sortOrder: i })),
        variants: cleanVariants,
      });

      toast.success("Product updated successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/products" 
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500">Update product details and manage variants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Main Info ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Basic Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Elegant Stiletto Heels" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Slug</label>
                <input 
                  type="text" 
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. elegant-heels-01" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your product..." 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (Tk) *</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 2500" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price (Optional)</label>
                <input 
                  type="number" 
                  value={discountedPrice}
                  onChange={e => setDiscountedPrice(e.target.value)}
                  placeholder="e.g. 1999" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* ── Variants ── */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Variants & Options</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
              <div className="flex gap-3 mb-3">
                <input 
                  type="text" 
                  value={colorInput}
                  onChange={e => setColorInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  placeholder="e.g. Red, Black" 
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                />
                <button type="button" onClick={addColor} className="bg-gray-900 text-white px-6 rounded-xl font-bold hover:bg-gray-800 transition-colors">Add</button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <span key={color} className="flex items-center gap-1.5 bg-pink-50 text-[#E91E8C] px-3 py-1.5 rounded-lg text-sm font-bold border border-pink-100">
                      {color}
                      <button type="button" onClick={() => setColors(colors.filter(c => c !== color))} className="hover:text-red-500"><X className="w-4 h-4" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
              <div className="flex gap-3 mb-3">
                <input 
                  type="text" 
                  value={sizeInput}
                  onChange={e => setSizeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  placeholder="e.g. 36, 37, M, L" 
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none"
                />
                <button type="button" onClick={addSize} className="bg-gray-900 text-white px-6 rounded-xl font-bold hover:bg-gray-800 transition-colors">Add</button>
              </div>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <span key={size} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100">
                      {size}
                      <button type="button" onClick={() => setSizes(sizes.filter(s => s !== size))} className="hover:text-red-500"><X className="w-4 h-4" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-gray-900">Manage Variant Details</label>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                   Default stock: 
                   <input 
                      type="number" 
                      value={stock} 
                      onChange={e => { setStock(e.target.value); variants.forEach(v => updateVariantStock(v.id, parseInt(e.target.value) || 0)); }} 
                      className="w-16 px-2 py-1 border rounded" 
                   />
                </div>
              </div>
              
              <div className="space-y-3">
                {variants.map(variant => (
                  <div key={variant.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1">
                      <span className="font-bold text-gray-900">
                        {variant.color || "Default Color"} {variant.color && variant.size && "—"} {variant.size || "Default Size"}
                      </span>
                    </div>
                    
                    {/* Variant Image */}
                    <div className="flex items-center gap-2">
                      {variant.imageUrl ? (
                        <div className="relative w-10 h-10 rounded border overflow-hidden group">
                           <img src={variant.imageUrl} alt="Variant" className="w-full h-full object-cover" />
                           <button 
                             type="button"
                             onClick={() => removeVariantImage(variant.id)}
                             className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <X className="w-3 h-3" />
                           </button>
                        </div>
                      ) : (
                        <label className="w-10 h-10 rounded border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-400">
                           {variant.isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                           <input 
                             type="file" 
                             accept="image/*" 
                             className="hidden" 
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) updateVariantImage(variant.id, file);
                               e.target.value = '';
                             }}
                           />
                        </label>
                      )}
                    </div>
                    
                    {/* Stock */}
                    <div className="w-24">
                      <input 
                        type="number" 
                        value={variant.stock}
                        onChange={e => updateVariantStock(variant.id, parseInt(e.target.value) || 0)}
                        placeholder="Stock" 
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          
          {/* Organization */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Organization</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select 
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] outline-none bg-white"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Main Images *</h2>
            <label className={`border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-12 h-12 bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center mb-4">
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {isUploading ? "Uploading..." : "Click to upload images"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
              <input 
                type="file" 
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            
            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((img) => (
                  <div key={img.publicId} className="relative aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group">
                    <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(img.publicId)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-[#E91E8C] text-white font-bold py-3.5 rounded-xl hover:bg-[#d8157a] hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>

        </div>

      </div>
    </form>
  );
}
