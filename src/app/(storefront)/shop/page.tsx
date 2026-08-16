import { Metadata } from "next";
import { getProducts, getCategories } from "@/actions/storefront.actions";
import ShopClient from "./ShopClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shop All | DevWonder Fashion",
  description: "Browse our complete collection of premium heels, flats, and luxury bags.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const allowedSorts = ["featured", "price_asc", "price_desc", "newest"] as const;
  type SortType = typeof allowedSorts[number];
  const sortParam = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const sort: SortType = allowedSorts.includes(sortParam as SortType) ? (sortParam as SortType) : "newest";
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : "";
  const minPrice = typeof searchParams.minPrice === "string" ? parseInt(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === "string" ? parseInt(searchParams.maxPrice) : undefined;

  const [productsData, categories] = await Promise.all([
    getProducts({ page, pageSize: 12, sort, categorySlug, minPrice, maxPrice }),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ShopClient
        products={productsData.products}
        categories={categories}
        totalProducts={productsData.total}
        totalPages={productsData.totalPages}
        currentPage={productsData.currentPage}
      />
    </Suspense>
  );
}
