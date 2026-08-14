"use client";

import { useState, useTransition } from "react";
import { adminUpdateOrderStatus } from "@/actions/order.actions";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ORDER_STATUS_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const STATUS_OPTIONS = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof STATUS_OPTIONS)[number];

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    currentStatus as OrderStatus
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = () => {
    if (selectedStatus === currentStatus) return;

    startTransition(async () => {
      try {
        await adminUpdateOrderStatus(orderId, selectedStatus);
        toast({
          title: "Status Updated ✓",
          description: `Order status changed to ${ORDER_STATUS_LABELS[selectedStatus]}`,
          variant: "success",
        });
        router.refresh();
      } catch {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
      <h2 className="font-bold text-gray-900 mb-5 text-sm">Update Order Status</h2>

      <div className="space-y-2 mb-5">
        {STATUS_OPTIONS.map((status) => {
          const isCurrent = status === currentStatus;
          const isSelected = status === selectedStatus;

          return (
            <label
              key={status}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-[#E91E8C] bg-pink-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={isSelected}
                onChange={() => setSelectedStatus(status)}
                className="sr-only"
              />
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-[#E91E8C]" : "border-gray-300"
                }`}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#E91E8C]" />
                )}
              </span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-[#E91E8C]" : "text-gray-700"
                }`}
              >
                {ORDER_STATUS_LABELS[status] ?? status}
              </span>
              {isCurrent && (
                <span className="ml-auto text-xs text-gray-400">Current</span>
              )}
            </label>
          );
        })}
      </div>

      <Button
        className="w-full"
        onClick={handleUpdate}
        disabled={isPending || selectedStatus === currentStatus}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Updating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Update Status
          </span>
        )}
      </Button>
    </div>
  );
}
