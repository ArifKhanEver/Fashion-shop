import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

function parseMysqlUrl(url: string) {
  // Strip the ?ssl-mode=REQUIRED query string for URL parsing
  const cleanUrl = url.split("?")[0];
  const params = new URLSearchParams(url.includes("?") ? url.split("?")[1] : "");
  const sslMode = params.get("ssl-mode");
  const u = new URL(cleanUrl);
  return {
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace("/", ""),
    ...(sslMode === "REQUIRED" ? { ssl: { rejectUnauthorized: false } } : {}),
    connectionLimit: 5,
    connectTimeout: 30000,
  };
}

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaMariaDb(parseMysqlUrl(connectionString));
const prisma = new PrismaClient({ adapter });

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
  const categoryDefs = [
    { name: "Luxury Edit Heels", slug: "luxury-edit-heels", sortOrder: 1 },
    { name: "Luxury Bags", slug: "luxury-bags", sortOrder: 2 },
    { name: "Flats & Sandals", slug: "flats-sandals", sortOrder: 3 },
    { name: "Party Clutch", slug: "party-clutch", sortOrder: 4 },
    { name: "Clearance Sale", slug: "clearance-sale", sortOrder: 5 },
    { name: "Z-Style Heels", slug: "z-style-heels", sortOrder: 6 },
  ];

  for (const cat of categoryDefs) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        isActive: true,
        sortOrder: cat.sortOrder,
      },
    });
  }

  console.log(`✅ ${categoryDefs.length} categories created`);

  // Fetch category IDs
  const categoryIds = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catId = (slug: string) => categoryIds.find((c: any) => c.slug === slug)?.id as string;

  const heelsId = catId("luxury-edit-heels");
  const bagsId = catId("luxury-bags");
  const flatsId = catId("flats-sandals");
  const clutchId = catId("party-clutch");
  const clearanceId = catId("clearance-sale");
  const zstyleId = catId("z-style-heels");

  // 8 Realistic Products
  const products = [
    {
      slug: "elite-block-heel-pumps",
      title: "Elite Block Heel Pumps — Midnight Black",
      description: "Turn heads with our premium block heel pumps. Crafted from vegan leather with a cushioned footbed for all-day comfort. Perfect for office and evenings.",
      price: 3200,
      discountedPrice: 2800,
      isFeatured: true,
      categoryId: heelsId,
      imageUrl: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80",
      publicId: "product_heel_block_01",
      variants: [
        { color: "Black", size: "36", stock: 5 },
        { color: "Black", size: "37", stock: 8 },
        { color: "Black", size: "38", stock: 10 },
        { color: "Black", size: "39", stock: 6 },
        { color: "Black", size: "40", stock: 4 },
      ],
    },
    {
      slug: "velvet-kitten-heel-mules",
      title: "Velvet Kitten Heel Mules — Rose Gold",
      description: "Effortlessly chic kitten heel mules in luxurious velvet. The rose gold tone elevates any outfit from casual to couture.",
      price: 2750,
      discountedPrice: null,
      isFeatured: true,
      categoryId: heelsId,
      imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      publicId: "product_heel_kitten_01",
      variants: [
        { color: "Rose Gold", size: "36", stock: 8 },
        { color: "Rose Gold", size: "37", stock: 10 },
        { color: "Rose Gold", size: "38", stock: 7 },
        { color: "Rose Gold", size: "39", stock: 5 },
      ],
    },
    {
      slug: "classic-leather-tote-bag",
      title: "Classic Leather Tote Bag — Cognac Brown",
      description: "A timeless leather tote with gold-tone hardware and a spacious interior. Perfect for everyday carry or weekend getaways.",
      price: 4200,
      discountedPrice: 3500,
      isFeatured: true,
      categoryId: bagsId,
      imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      publicId: "product_bag_tote_01",
      variants: [
        { color: "Brown", size: "Standard", stock: 12 },
        { color: "Black", size: "Standard", stock: 8 },
      ],
    },
    {
      slug: "quilted-chain-shoulder-bag",
      title: "Quilted Chain Shoulder Bag — Pearl White",
      description: "Inspired by Parisian fashion, this quilted shoulder bag with gold chain strap is the ultimate statement piece.",
      price: 5800,
      discountedPrice: 4900,
      isFeatured: true,
      categoryId: bagsId,
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
      publicId: "product_bag_quilted_01",
      variants: [
        { color: "White", size: "Standard", stock: 6 },
        { color: "Beige", size: "Standard", stock: 9 },
      ],
    },
    {
      slug: "strappy-flat-sandals-nude",
      title: "Strappy Flat Sandals — Nude Beige",
      description: "Delicate multi-strap flat sandals that pair with everything. Lightweight sole and adjustable ankle strap for a perfect fit.",
      price: 1800,
      discountedPrice: 1450,
      isFeatured: false,
      categoryId: flatsId,
      imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80",
      publicId: "product_flat_sandal_01",
      variants: [
        { color: "Nude", size: "36", stock: 10 },
        { color: "Nude", size: "37", stock: 14 },
        { color: "Nude", size: "38", stock: 10 },
        { color: "Nude", size: "39", stock: 7 },
        { color: "Tan", size: "37", stock: 5 },
        { color: "Tan", size: "38", stock: 8 },
      ],
    },
    {
      slug: "crystal-embellished-party-clutch",
      title: "Crystal Embellished Party Clutch — Silver",
      description: "Dazzle the room with this hand-beaded crystal clutch. Hard-frame construction with a magnetic snap closure and detachable chain.",
      price: 3500,
      discountedPrice: null,
      isFeatured: false,
      categoryId: clutchId,
      imageUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
      publicId: "product_clutch_crystal_01",
      variants: [
        { color: "Silver", size: "Standard", stock: 8 },
        { color: "Gold", size: "Standard", stock: 6 },
      ],
    },
    {
      slug: "platform-espadrille-wedges-sale",
      title: "Platform Espadrille Wedges — On Sale",
      description: "Summery jute-wrapped wedge espadrilles with ankle-tie straps. Walk tall in comfort and style at a clearance price.",
      price: 2800,
      discountedPrice: 1400,
      isFeatured: false,
      categoryId: clearanceId,
      imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80",
      publicId: "product_wedge_espa_01",
      variants: [
        { color: "Tan", size: "37", stock: 3 },
        { color: "Tan", size: "38", stock: 4 },
        { color: "White", size: "38", stock: 2 },
        { color: "White", size: "39", stock: 3 },
      ],
    },
    {
      slug: "z-style-pointed-toe-stilettos",
      title: "Z-Style Pointed-Toe Stilettos — Onyx",
      description: "Our signature Z-Style collection features ultra-sleek pointed-toe stilettos with a lacquer finish. Bold, confident, and unmistakably DevWonder.",
      price: 3900,
      discountedPrice: 3200,
      isFeatured: true,
      categoryId: zstyleId,
      imageUrl: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&q=80",
      publicId: "product_zstyle_stiletto_01",
      variants: [
        { color: "Black", size: "36", stock: 5 },
        { color: "Black", size: "37", stock: 8 },
        { color: "Black", size: "38", stock: 7 },
        { color: "Black", size: "39", stock: 6 },
        { color: "Red", size: "37", stock: 4 },
        { color: "Red", size: "38", stock: 3 },
      ],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          title: p.title,
          slug: p.slug,
          description: p.description,
          price: p.price,
          discountedPrice: p.discountedPrice,
          isFeatured: p.isFeatured,
          isActive: true,
          categories: { create: [{ categoryId: p.categoryId }] },
          images: {
            create: [{
              url: p.imageUrl,
              publicId: p.publicId,
              sortOrder: 0,
            }],
          },
          variants: {
            create: p.variants,
          },
        },
      });
      console.log(`  ✅ Created: ${p.title}`);
    } else {
      console.log(`  ⏭️  Skipped (already exists): ${p.title}`);
    }
  }

  console.log(`✅ ${products.length} products processed`);
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
