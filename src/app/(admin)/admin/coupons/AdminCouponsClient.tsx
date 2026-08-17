"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight, Copy } from "lucide-react";
import { createCoupon, deleteCoupon, toggleCouponActive } from "@/actions/admin.coupon.actions";
import { toast } from "react-hot-toast";

type CouponRow = {
  id: string;
  code: string;
  discountType: string;
  discountValue: any;
  minOrderAmount: any;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
};

interface AdminCouponsClientProps {
  coupons: CouponRow[];
}

const EMPTY_FORM = {
  code: "",
  discountType: "PERCENT" as "PERCENT" | "FIXED",
  discountValue: "",
  minOrderAmount: "",
  usageLimit: "",
  expiresAt: "",
};

export default function AdminCouponsClient({ coupons: initialCoupons }: AdminCouponsClientProps) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isCreating, startCreate] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      toast.error("Code and discount value are required.");
      return;
    }
    startCreate(async () => {
      const result = await createCoupon({
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
        isActive: true,
      });
      if (result.success) {
        toast.success("Coupon created!");
        setForm(EMPTY_FORM);
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create coupon.");
      }
    });
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setDeletingId(id);
    const result = await deleteCoupon(id);
    if (result.success) {
      setCoupons((c) => c.filter((coupon) => coupon.id !== id));
      toast.success("Coupon deleted.");
    } else {
      toast.error(result.error ?? "Failed to delete coupon.");
    }
    setDeletingId(null);
  }

  async function handleToggle(id: string, current: boolean) {
    const result = await toggleCouponActive(id, !current);
    if (result.success) {
      setCoupons((cs) =>
        cs.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
      );
      toast.success(!current ? "Coupon activated." : "Coupon deactivated.");
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => toast.success(`Copied "${code}"`));
  }

  const isExpired = (coupon: CouponRow) =>
    coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#E91E8C]" /> Coupons
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {coupons.length} coupon code{coupons.length !== 1 ? "s" : ""} configured.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-[#E91E8C] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#d8157a] transition-colors"
        >
          <Plus className="w-5 h-5" /> New Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#E91E8C]/20 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Create New Coupon</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleFormChange}
                placeholder="e.g. WELCOME15"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Discount Type</label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (৳)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                name="discountValue"
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={handleFormChange}
                placeholder={form.discountType === "PERCENT" ? "e.g. 15 (for 15%)" : "e.g. 150 (for ৳150)"}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Min Order Amount (৳)</label>
              <input
                name="minOrderAmount"
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={handleFormChange}
                placeholder="Leave blank for no minimum"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Usage Limit</label>
              <input
                name="usageLimit"
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={handleFormChange}
                placeholder="Leave blank for unlimited"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                name="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2.5 bg-[#E91E8C] text-white rounded-lg text-sm font-bold hover:bg-[#d8157a] disabled:opacity-60 transition-colors"
              >
                {isCreating ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No coupons yet. Create one above!
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const expired = isExpired(coupon);
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-[#E91E8C]">
                        {coupon.discountType === "PERCENT"
                          ? `${Number(coupon.discountValue)}% off`
                          : `৳${Number(coupon.discountValue)} off`}
                      </td>
                      <td className="p-4 text-gray-500">
                        {coupon.minOrderAmount
                          ? `৳${Number(coupon.minOrderAmount)}`
                          : "—"}
                      </td>
                      <td className="p-4">
                        <span className="text-gray-700 font-semibold">
                          {coupon.usageCount}
                        </span>
                        <span className="text-gray-400">
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " / ∞"}
                        </span>
                      </td>
                      <td className="p-4 text-xs">
                        {coupon.expiresAt ? (
                          <span className={expired ? "text-red-600 font-semibold" : "text-gray-500"}>
                            {expired ? "EXPIRED · " : ""}
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            !coupon.isActive || expired
                              ? "bg-gray-100 text-gray-500"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {!coupon.isActive ? "Inactive" : expired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(coupon.id, coupon.isActive)}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            disabled={deletingId === coupon.id}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Delete coupon"
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
