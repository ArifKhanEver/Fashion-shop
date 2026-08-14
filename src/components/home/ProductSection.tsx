import ProductCard from "@/components/product/ProductCard";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: { toNumber: () => number } | number;
  discountedPrice: { toNumber: () => number } | number | null;
  images: { url: string }[];
}

interface ProductSectionProps {
  products: Product[];
  isLimitedOffer?: boolean;
}

export default function ProductSection({
  products,
  isLimitedOffer = false,
}: ProductSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {products.map((product) => {
        const price =
          typeof product.price === "number"
            ? product.price
            : product.price.toNumber();
        const discountedPrice = product.discountedPrice
          ? typeof product.discountedPrice === "number"
            ? product.discountedPrice
            : product.discountedPrice.toNumber()
          : null;
        const imageUrl = product.images[0]?.url ?? "/placeholder-product.jpg";

        return (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              title: product.title,
              slug: product.slug,
              image: imageUrl,
              price: discountedPrice ?? price,
              originalPrice: discountedPrice ? price : undefined,
              discountPercent: isLimitedOffer ? 20 : undefined // Just to map isLimitedOffer to something
            }}
          />
        );
      })}
    </div>
  );
}
