import Link from "next/link";
import Image from "next/image";
import { Tag, Briefcase, ShoppingBag, Sparkles, Shirt, Gem } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count?: { products: number };
}

interface CategoryGridProps {
  categories: Category[];
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "luxury-edit-heels": Gem,
  "luxury-bags": ShoppingBag,
  "flats-sandals": Gem,
  "party-clutch": Briefcase,
  "clearance-sale": Tag,
  "z-style-heels": Sparkles,
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.slug] ?? Shirt;

        return (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 group"
          >
            {/* Circle */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-pink-50 border-2 border-transparent group-hover:border-[#E91E8C] group-hover:shadow-lg transition-all duration-300 flex items-center justify-center overflow-hidden relative text-[#E91E8C]">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover rounded-full"
                  unoptimized
                />
              ) : (
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 opacity-70" />
              )}
            </div>

            {/* Label */}
            <span className="text-xs font-semibold text-gray-700 group-hover:text-[#E91E8C] transition-colors text-center max-w-[80px] leading-tight">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
