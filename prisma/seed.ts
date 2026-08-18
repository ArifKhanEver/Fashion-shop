import { config } from "dotenv";
config({ path: ".env.local" });
import { OrderStatus, PrismaClient } from "@prisma/client";
import crypto from "crypto";

async function main() {
  const { prisma } = await import("../src/lib/prisma.js") as { prisma: PrismaClient };
  console.log("Starting Heavy Data Seeding...");

  // 1. Clear existing data
  console.log("Clearing existing data...");
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.storeSettings.deleteMany({});

  // 2. Initialize Store Settings
  console.log("Seeding StoreSettings...");
  await prisma.storeSettings.create({
    data: {
      id: "singleton",
      storeName: "DevWonder Fashion",
      headerLogoUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=200&q=80",
      phoneNumber: "+880 1700-112233",
      whatsappNumber: "+8801700112233",
      deliveryChargeInside: 80,
      deliveryChargeOutside: 120,
      gaMeasurementId: "G-DEMO12345",
      metaPixelId: "1234567890",
      sliderImages: [
        "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  });

  // 3. Create Admin
  console.log("Seeding Admin...");
  await prisma.admin.create({
    data: {
      email: "admin@fashion.devwonder.shop",
      password: "dummy_hashed_password",
      name: "Super Admin",
    }
  });

  // 4. Create 20 Categories with real image URLs
  console.log("Seeding Categories...");
  const categoryData: { name: string; image: string }[] = [
    { name: "Luxury Heels",      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80" },
    { name: "Designer Bags",     image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80" },
    { name: "Flats and Sandals", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80" },
    { name: "Party Clutch",      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80" },
    { name: "Clearance",         image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80" },
    { name: "Winter Collection", image: "https://images.unsplash.com/photo-1548778052-311f4bc2b502?w=400&q=80" },
    { name: "Summer Fits",       image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80" },
    { name: "Bridal Wear",       image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80" },
    { name: "Office Chic",       image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
    { name: "Casual Everyday",   image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80" },
    { name: "Sportswear",        image: "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400&q=80" },
    { name: "Evening Gowns",     image: "https://images.unsplash.com/photo-1566479179817-be94d4b2cd58?w=400&q=80" },
    { name: "Watches",           image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
    { name: "Sunglasses",        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80" },
    { name: "Jewelry",           image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80" },
    { name: "Hats and Caps",     image: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=400&q=80" },
    { name: "Tote Bags",         image: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=400&q=80" },
    { name: "Sneakers",          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    { name: "Boots",             image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80" },
    { name: "Premium Scarves",   image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&q=80" },
  ];

  const categories: { id: string; name: string }[] = [];
  for (let i = 0; i < categoryData.length; i++) {
    const item = categoryData[i]!;
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const category = await prisma.category.create({
      data: {
        name: item.name,
        slug,
        description: `Explore our collection of premium ${item.name}.`,
        image: item.image,
        sortOrder: i,
      }
    });
    categories.push(category);
  }

  // 5. Create 50 Products with real Unsplash images
  console.log("Seeding Products and Variants...");

  // Real Unsplash fashion product images (pre-validated working URLs)
  const productImages: string[] = [
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
    "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80",
    "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=600&q=80",
    "https://images.unsplash.com/photo-1566479179817-be94d4b2cd58?w=600&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&q=80",
    "https://images.unsplash.com/photo-1548778052-311f4bc2b502?w=600&q=80",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
    "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80",
    "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&q=80",
    "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=600&q=80",
  ];

  // Real product names for the 50 items
  const productTitles: string[] = [
    "Luxury Stiletto Heel", "Elegant Crossbody Bag", "Premium Slip-On Flat", "Velvet Party Clutch", "Rose Gold Sandals",
    "Handcrafted Leather Bag", "Classic Ballet Flat", "Sequin Evening Bag", "Block Heel Mule", "Structured Tote Bag",
    "Suede Ankle Boots", "Crystal Embellished Heels", "Woven Rattan Bag", "Metallic Pumps", "Tassel Mini Bag",
    "Pointed Toe Kitten Heel", "Quilted Chain Bag", "Espadrille Wedge Sandal", "Studded Combat Boots", "Velvet Mini Bag",
    "Strappy Stiletto", "Monogram Canvas Tote", "Platform Sneaker", "Faux Fur Slides", "Bead Embellished Flat",
    "Tortoiseshell Sunglasses", "Pearl Hoop Earrings", "Gold Chain Necklace", "Silk Floral Scarf", "Vintage Aviator Watch",
    "Wide Brim Straw Hat", "Knit Beanie Cap", "Gemstone Bracelet", "Crystal Drop Earrings", "Silver Bangle Set",
    "Asymmetric Midi Dress", "Floral Wrap Skirt", "Ruched Bodycon Dress", "Blazer Co-ord Set", "Lace Cami Top",
    "Wide Leg Trousers", "Sequin Mini Skirt", "Tie-Dye Crop Top", "Satin Slip Dress", "Ribbed Knit Cardigan",
    "High Waist Denim Shorts", "Floral Print Maxi Dress", "Faux Leather Biker Jacket", "Chiffon Palazzo Pants", "Embroidered Kurta"
  ];

  // Type for a created product with its variants
  type CreatedProduct = {
    id: string;
    title: string;
    price: { toNumber: () => number };
    discountedPrice: { toNumber: () => number } | null;
    variants: { id: string; color: string | null; size: string | null }[];
  };

  const products: CreatedProduct[] = [];
  for (let i = 1; i <= 50; i++) {
    const title = productTitles[i - 1] ?? `Premium Fashion Item ${i}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${i}`;
    const price = Math.floor(Math.random() * (5000 - 800 + 1)) + 800; // Between 800 and 5800
    const hasDiscount = i % 4 === 0; // Every 4th item has a discount

    // Pick 1-2 random categories — guaranteed non-undefined via modulo
    const cat1 = categories[Math.floor(Math.random() * categories.length)]!;
    const cat2 = categories[Math.floor(Math.random() * categories.length)]!;

    const imageUrl: string = productImages[(i - 1) % productImages.length]!;
    const image2Url: string = productImages[i % productImages.length]!;

    const product = await (prisma as any).product.create({
      data: {
        title,
        slug,
        description: `Introducing the ${title} — a must-have for any fashion-forward wardrobe. Crafted with attention to detail and premium materials, this piece blends style and comfort effortlessly.`,
        price,
        discountedPrice: hasDiscount ? price - Math.floor(price * 0.15) : null,
        isFeatured: i <= 12, // First 12 are featured
        categories: {
          create: [
            { categoryId: cat1.id },
            ...(cat1.id !== cat2.id ? [{ categoryId: cat2.id }] : []),
          ],
        },
        images: {
          create: [
            { url: imageUrl, publicId: `devwonder_fashion/products/product_${i}_1`, sortOrder: 0 },
            { url: image2Url, publicId: `devwonder_fashion/products/product_${i}_2`, sortOrder: 1 },
          ],
        },
        variants: {
          create: [
            { color: "Black", size: "S",  stock: Math.floor(Math.random() * 30) + 5 },
            { color: "White", size: "M",  stock: Math.floor(Math.random() * 30) + 5 },
            { color: "Beige", size: "L",  stock: Math.floor(Math.random() * 30) + 5 },
            { color: "Red",   size: "XL", stock: Math.floor(Math.random() * 20) + 2 },
          ],
        },
      },
      include: { variants: true },
    }) as CreatedProduct;
    products.push(product);
  }

  // 6. Create 500 Orders
  console.log("Seeding 500 Orders (this might take a few seconds)...");

  const divisions = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"];
  const statuses = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];

  const orderBatchSize = 100;
  for (let b = 0; b < 5; b++) { // 5 batches of 100
    for (let i = 0; i < orderBatchSize; i++) {
      const orderNumber = (b * orderBatchSize) + i + 1;

      // Select 1 to 3 random products for this order
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts: CreatedProduct[] = [];
      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)]!;
        selectedProducts.push(randomProduct);
      }

      let subtotal = 0;
      const orderItemsData = selectedProducts.map((p) => {
        const variantList = p.variants;
        const variant = variantList[Math.floor(Math.random() * variantList.length)]!;
        const quantity = Math.floor(Math.random() * 2) + 1;
        const unitPrice = Number(p.discountedPrice ?? p.price);
        subtotal += unitPrice * quantity;

        return {
          productId: p.id,
          variantId: variant.id,
          quantity,
          unitPrice,
          productTitle: p.title,
          variantColor: variant.color,
          variantSize: variant.size,
          productImageUrl: null,
        };
      });

      const deliveryCharge = 80;
      const totalAmount = subtotal + deliveryCharge;

      // Random past date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - daysAgo);

      const division = divisions[Math.floor(Math.random() * divisions.length)]!;
      const status = statuses[Math.floor(Math.random() * statuses.length)]!;

      await (prisma as any).order.create({
        data: {
          invoiceNumber: `CDBD-2026-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
          customerName: `Customer ${orderNumber}`,
          customerPhone: `01711${Math.floor(100000 + Math.random() * 900000)}`,
          customerEmail: `customer${orderNumber}@example.com`,
          division,
          district: "Test District",
          fullAddress: `House ${Math.floor(Math.random() * 100)}, Test Street, Test City`,
          subtotal,
          deliveryCharge,
          totalAmount,
          status,
          createdAt: pastDate,
          updatedAt: pastDate,
          items: {
            create: orderItemsData
          }
        }
      });
    }
    console.log(`Seeded ${(b + 1) * orderBatchSize} orders...`);
  }

  console.log("✅ Heavy Data Seeding Completed Successfully.");

  await (prisma as any).$disconnect();
}

main().catch((e) => {
  console.error("Seeding Error:", e);
  process.exit(1);
});
