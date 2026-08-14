import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create default admin
  const hashedPassword = await bcrypt.hash("Admin@1234", 12);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@fashion.devwonder.shop" },
    update: {},
    create: {
      email: "admin@fashion.devwonder.shop",
      password: hashedPassword,
      name: "DevWonder Fashion Admin",
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create sample categories
  const categories = [
    { name: "Luxury Edit Heels", slug: "luxury-edit-heels" },
    { name: "Luxury Bags", slug: "luxury-bags" },
    { name: "Flats & Sandals", slug: "flats-sandals" },
    { name: "Party Clutch", slug: "party-clutch" },
    { name: "Clearance Sale", slug: "clearance-sale" },
    { name: "Z-Style Heels", slug: "z-style-heels" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        isActive: true,
      },
    });
  }

  console.log(`✅ ${categories.length} categories created`);

  // Create products
  const categoryIds = await prisma.category.findMany({ select: { id: true, slug: true } });
  const bagsCategory = categoryIds.find(c => c.slug === "luxury-bags")?.id;
  const heelsCategory = categoryIds.find(c => c.slug === "luxury-edit-heels")?.id;

  if (bagsCategory && heelsCategory) {
    // Product 1
    await prisma.product.upsert({
      where: { slug: "classic-leather-tote-bag" },
      update: {},
      create: {
        title: "Classic Leather Tote Bag",
        slug: "classic-leather-tote-bag",
        description: "A classic leather tote bag with gold hardware.",
        price: 4200,
        isFeatured: true,
        isActive: true,
        categories: { create: [{ categoryId: bagsCategory }] },
        images: { create: [{ url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80", publicId: "bag_img", sortOrder: 0 }] },
        variants: { create: [{ color: "Brown", size: "Standard", stock: 10 }] }
      }
    });

    // Product 2
    await prisma.product.upsert({
      where: { slug: "elegant-stiletto-heels" },
      update: {},
      create: {
        title: "Elegant Stiletto Heels",
        slug: "elegant-stiletto-heels",
        description: "Premium collection stiletto heels.",
        price: 2500,
        isFeatured: true,
        isActive: true,
        categories: { create: [{ categoryId: heelsCategory }] },
        images: { create: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80", publicId: "heel_img", sortOrder: 0 }] },
        variants: { create: [{ color: "Black", size: "38", stock: 15 }, { color: "Black", size: "39", stock: 5 }] }
      }
    });
    console.log(`✅ Products seeded`);
  }
  console.log("\n🎉 Seeding complete!");
  console.log("📧 Admin Email: admin@fashion.devwonder.shop");
  console.log("🔑 Admin Password: Admin@1234");
  console.log("⚠️  Change the password after first login!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
