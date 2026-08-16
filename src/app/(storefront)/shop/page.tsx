import { Metadata } from "next";
import { getProducts, getCategories } from "@/actions/storefront.actions";
import ShopClient from "./ShopClient";
import { Suspense } from "react";
import ShopSkeleton from "./ShopSkeleton";

export const metadata: Metadata = {
  title: "Shop All | DevWonder Fashion",
  description: "Browse our complete collection of premium heels, flats, and luxury bags.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const allowedSorts = ["featured", "price_asc", "price_desc", "newest"] as const;
  type SortType = (typeof allowedSorts)[number];
  const sortParam = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest";
  const sort: SortType = allowedSorts.includes(sortParam as SortType) ? (sortParam as SortType) : "newest";
  const categorySlug = typeof resolvedParams.category === "string" ? resolvedParams.category : "";
  const minPrice = typeof resolvedParams.minPrice === "string" ? parseInt(resolvedParams.minPrice) : undefined;
  const maxPrice = typeof resolvedParams.maxPrice === "string" ? parseInt(resolvedParams.maxPrice) : undefined;
  const searchQuery = typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";

  const [productsData, categories] = await Promise.all([
    getProducts({ page, pageSize: 12, sort, categorySlug, minPrice, maxPrice, searchQuery }),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopClient
        products={productsData.products}
        categories={categories}
        totalProducts={productsData.total}
        totalPages={productsData.totalPages}
        currentPage={productsData.currentPage}
        initialSearchQuery={searchQuery}
      />
    </Suspense>
  );
}
