import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/actions/storefront.actions";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import Script from "next/script";

// Generate dynamic metadata for the product page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const imageUrl = product.images?.[0]?.url || "/placeholder-product.jpg";

  return {
    title: product.title,
    description: (product.description || "").substring(0, 160),
    openGraph: {
      title: product.title,
      description: (product.description || "").substring(0, 160),
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: (product.description || "").substring(0, 160),
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const productData = await getProductBySlug(slug);
  
  if (!productData) {
    notFound();
  }

  // Map to the structure expected by ProductDetailClient
  const mappedProduct = {
    id: productData.id,
    title: productData.title,
    slug: productData.slug,
    description: productData.description,
    price: productData.discountedPrice ? Number(productData.discountedPrice) : Number(productData.price),
    originalPrice: productData.discountedPrice ? Number(productData.price) : undefined,
    discountPercent: productData.discountedPrice ? Math.round(((Number(productData.price) - Number(productData.discountedPrice)) / Number(productData.price)) * 100) : undefined,
    image: productData.images?.[0]?.url || "/placeholder-product.jpg",
    images: productData.images.map(img => img.url),
    colors: Array.from(new Set(productData.variants.map(v => v.color).filter(Boolean))),
    sizes: Array.from(new Set(productData.variants.map(v => v.size).filter(Boolean))),
  };

  // Fetch related products (latest from the same primary category)
  let relatedProducts = [];
  if (productData.categories.length > 0) {
    const { products } = await getProducts({ pageSize: 5 }); // Simple fallback since getProductsByCategory isn't strictly needed for "latest overall", but let's just get latest
    relatedProducts = products
      .filter(p => p.id !== productData.id)
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        image: p.images?.[0]?.url || "/placeholder-product.jpg",
        price: p.discountedPrice ? Number(p.discountedPrice) : Number(p.price),
        originalPrice: p.discountedPrice ? Number(p.price) : undefined,
        discountPercent: p.discountedPrice ? Math.round(((Number(p.price) - Number(p.discountedPrice)) / Number(p.price)) * 100) : undefined,
      }));
  } else {
    const { products } = await getProducts({ pageSize: 5 });
    relatedProducts = products
      .filter(p => p.id !== productData.id)
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        image: p.images?.[0]?.url || "/placeholder-product.jpg",
        price: p.discountedPrice ? Number(p.discountedPrice) : Number(p.price),
        originalPrice: p.discountedPrice ? Number(p.price) : undefined,
        discountPercent: p.discountedPrice ? Math.round(((Number(p.price) - Number(p.discountedPrice)) / Number(p.price)) * 100) : undefined,
      }));
  }

  // Generate JSON-LD schema for the product
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: mappedProduct.title,
    image: mappedProduct.image,
    description: mappedProduct.description,
    sku: `${mappedProduct.id.toUpperCase()}-001`,
    offers: {
      "@type": "Offer",
      url: `https://fashion.devwonder.shop/product/${mappedProduct.slug}`,
      priceCurrency: "BDT",
      price: mappedProduct.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={mappedProduct} relatedProducts={relatedProducts} />
    </>
  );
}
