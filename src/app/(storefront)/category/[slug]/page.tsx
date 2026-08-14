import { notFound } from "next/navigation";
import { getProductsByCategory } from "@/actions/storefront.actions";
import CategoryClient from "./CategoryClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getProductsByCategory(resolvedParams.slug);
  
  if (!data) return { title: "Category Not Found" };

  return {
    title: `${data.category.name} | DevWonder Fashion`,
    description: data.category.description || `Shop the latest ${data.category.name} collection at DevWonder Fashion.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const data = await getProductsByCategory(slug);
  
  if (!data) {
    notFound();
  }

  return (
    <CategoryClient 
      category={data.category} 
      products={data.products} 
    />
  );
}
