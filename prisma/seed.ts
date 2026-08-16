import { config } from "dotenv";
config({ path: ".env.local" });
import { OrderStatus } from "@prisma/client";
import crypto from "crypto";

async function main() {
  const { prisma } = await import("../src/lib/prisma.js");
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
      deliveryCharge: 80,
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

  // 4. Create 20 Categories
  console.log("Seeding Categories...");
  const categoryNames = [
    "Luxury Heels", "Designer Bags", "Flats & Sandals", "Party Clutch", "Clearance", 
    "Winter Collection", "Summer Fits", "Bridal Wear", "Office Chic", "Casual Everyday",
    "Sportswear", "Evening Gowns", "Watches", "Sunglasses", "Jewelry",
    "Hats & Caps", "Tote Bags", "Sneakers", "Boots", "Premium Scarves"
  ];

  const categories = [];
  for (let i = 0; i < categoryNames.length; i++) {
    const category = await prisma.category.create({
      data: {
        name: categoryNames[i],
        slug: categoryNames[i].toLowerCase().replace(/ /g, "-"),
        description: `Explore our collection of premium ${categoryNames[i]}.`,
        image: `https://source.unsplash.com/random/400x400/?${categoryNames[i].split(" ")[0]},fashion`,
        sortOrder: i,
      }
    });
    categories.push(category);
  }

  // 5. Create 50 Products (each with 3 variants and images)
  console.log("Seeding Products and Variants...");
  const products = [];
  for (let i = 1; i <= 50; i++) {
    const title = `Premium Fashion Item ${i}`;
    const price = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000; // Between 1000 and 5000
    
    // Pick 2 random categories
    const cat1 = categories[Math.floor(Math.random() * categories.length)];
    const cat2 = categories[Math.floor(Math.random() * categories.length)];
    
    const product = await prisma.product.create({
      data: {
        title,
        slug: `premium-fashion-item-${i}`,
        description: `This is the ultimate ${title}, perfect for any occasion. Made with premium quality materials.`,
        price,
        discountedPrice: i % 5 === 0 ? price - 500 : null, // 1 in 5 items on sale
        isFeatured: i <= 10, // First 10 are featured
        categories: {
          create: [
            { categoryId: cat1.id },
            ...(cat1.id !== cat2.id ? [{ categoryId: cat2.id }] : [])
          ]
        },
        images: {
          create: [
            { url: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=600&q=80`, publicId: `dummy_${i}_1` },
            { url: `https://images.unsplash.com/photo-${1500000000100 + i}?auto=format&fit=crop&w=600&q=80`, publicId: `dummy_${i}_2` }
          ]
        },
        variants: {
          create: [
            { color: "Black", size: "M", stock: Math.floor(Math.random() * 50) + 10 },
            { color: "White", size: "L", stock: Math.floor(Math.random() * 50) + 10 },
            { color: "Red", size: "S", stock: Math.floor(Math.random() * 50) + 10 },
          ]
        }
      },
      include: { variants: true }
    });
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
      const selectedProducts = [];
      for(let j=0; j < numItems; j++) {
        selectedProducts.push(products[Math.floor(Math.random() * products.length)]);
      }

      let subtotal = 0;
      const orderItemsData = selectedProducts.map(p => {
        const variant = p.variants[Math.floor(Math.random() * p.variants.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const unitPrice = Number(p.discountedPrice || p.price);
        subtotal += (unitPrice * quantity);

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

      await prisma.order.create({
        data: {
          invoiceNumber: `CDBD-2026-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
          customerName: `Customer ${orderNumber}`,
          customerPhone: `01711${Math.floor(100000 + Math.random() * 900000)}`,
          customerEmail: `customer${orderNumber}@example.com`,
          division: divisions[Math.floor(Math.random() * divisions.length)],
          district: "Test District",
          fullAddress: `House ${Math.floor(Math.random() * 100)}, Test Street, Test City`,
          subtotal,
          deliveryCharge,
          totalAmount,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createdAt: pastDate,
          updatedAt: pastDate,
          items: {
            create: orderItemsData
          }
        }
      });
    }
    console.log(`Seeded ${ (b + 1) * orderBatchSize } orders...`);
  }

  console.log("✅ Heavy Data Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
