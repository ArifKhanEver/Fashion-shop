// Shared TypeScript types for the entire application

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  imageUrl: string;
  price: number;
  color?: string;
  size?: string;
  quantity: number;
}

export interface ProductWithDetails {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  images: {
    id: string;
    url: string;
    publicId: string;
    altText: string | null;
    sortOrder: number;
  }[];
  variants: {
    id: string;
    color: string | null;
    size: string | null;
    stock: number;
  }[];
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

export interface OrderWithItems {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  division: string;
  district: string;
  fullAddress: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  notes: string | null;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    productTitle: string;
    variantColor: string | null;
    variantSize: string | null;
    productImageUrl: string | null;
    product: {
      id: string;
      title: string;
      slug: string;
    };
  }[];
}

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  division: string;
  district: string;
  fullAddress: string;
}

// Bangladesh Divisions for dropdown
export const BD_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
] as const;

export type BDDivision = (typeof BD_DIVISIONS)[number];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
