// Direct MariaDB seed script - bypasses PrismaMariaDb adapter
// Uses raw mariadb driver for maximum compatibility

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const mariadb = require("mariadb");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");

function parseMysqlUrl(url) {
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
    connectionLimit: 3,
    connectTimeout: 30000,
    socketTimeout: 60000,
    acquireTimeout: 60000,
    allowPublicKeyRetrieval: true,
  };
}

const dbConfig = parseMysqlUrl(process.env.DATABASE_URL);
console.log("🔗 Connecting to:", dbConfig.host + ":" + dbConfig.port + "/" + dbConfig.database);

const pool = mariadb.createPool(dbConfig);

async function query(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(sql, params);
    return result;
  } finally {
    conn.release();
  }
}

async function main() {
  console.log("🌱 Seeding database with raw MariaDB driver...");
  
  // Test connection
  await query("SELECT 1");
  console.log("✅ Connection successful!");

  // Admin
  const hashedPassword = await bcrypt.hash("Admin@1234", 12);
  const adminEmail = "admin@fashion.devwonder.shop";
  const existing = await query("SELECT id FROM admins WHERE email = ?", [adminEmail]);
  if (existing.length === 0) {
    const adminId = randomUUID();
    await query(
      "INSERT INTO admins (id, email, password, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [adminId, adminEmail, hashedPassword, "DevWonder Fashion Admin"]
    );
    console.log(`✅ Admin created: ${adminEmail}`);
  } else {
    console.log(`⏭️  Admin already exists: ${adminEmail}`);
  }

  // Categories
  const categoryDefs = [
    { name: "Luxury Edit Heels", slug: "luxury-edit-heels", sortOrder: 1 },
    { name: "Luxury Bags", slug: "luxury-bags", sortOrder: 2 },
    { name: "Flats & Sandals", slug: "flats-sandals", sortOrder: 3 },
    { name: "Party Clutch", slug: "party-clutch", sortOrder: 4 },
    { name: "Clearance Sale", slug: "clearance-sale", sortOrder: 5 },
    { name: "Z-Style Heels", slug: "z-style-heels", sortOrder: 6 },
  ];

  const categoryIds = {};
  for (const cat of categoryDefs) {
    const existing = await query("SELECT id FROM categories WHERE slug = ?", [cat.slug]);
    let id;
    if (existing.length === 0) {
      id = randomUUID();
      await query(
        "INSERT INTO categories (id, name, slug, isActive, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, NOW(), NOW())",
        [id, cat.name, cat.slug, cat.sortOrder]
      );
      console.log(`  ✅ Category: ${cat.name}`);
    } else {
      id = existing[0].id;
      console.log(`  ⏭️  Category exists: ${cat.name}`);
    }
    categoryIds[cat.slug] = id;
  }

  // Products
  const products = [
    {
      slug: "elite-block-heel-pumps",
      title: "Elite Block Heel Pumps — Midnight Black",
      description: "Turn heads with our premium block heel pumps. Crafted from vegan leather with a cushioned footbed for all-day comfort.",
      price: 3200,
      discountedPrice: 2800,
      isFeatured: 1,
      categorySlug: "luxury-edit-heels",
      imageUrl: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80",
      variants: [
        { color: "Black", size: "36", stock: 5 },
        { color: "Black", size: "37", stock: 8 },
        { color: "Black", size: "38", stock: 10 },
        { color: "Black", size: "39", stock: 6 },
      ],
    },
    {
      slug: "velvet-kitten-heel-mules",
      title: "Velvet Kitten Heel Mules — Rose Gold",
      description: "Effortlessly chic kitten heel mules in luxurious velvet.",
      price: 2750,
      discountedPrice: null,
      isFeatured: 1,
      categorySlug: "luxury-edit-heels",
      imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
      variants: [
        { color: "Rose Gold", size: "36", stock: 8 },
        { color: "Rose Gold", size: "37", stock: 10 },
        { color: "Rose Gold", size: "38", stock: 7 },
      ],
    },
    {
      slug: "classic-leather-tote-bag",
      title: "Classic Leather Tote Bag — Cognac Brown",
      description: "A timeless leather tote with gold-tone hardware and a spacious interior.",
      price: 4200,
      discountedPrice: 3500,
      isFeatured: 1,
      categorySlug: "luxury-bags",
      imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      variants: [
        { color: "Brown", size: "Standard", stock: 12 },
        { color: "Black", size: "Standard", stock: 8 },
      ],
    },
    {
      slug: "quilted-chain-shoulder-bag",
      title: "Quilted Chain Shoulder Bag — Pearl White",
      description: "Quilted shoulder bag with gold chain strap — the ultimate statement piece.",
      price: 5800,
      discountedPrice: 4900,
      isFeatured: 1,
      categorySlug: "luxury-bags",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
      variants: [
        { color: "White", size: "Standard", stock: 6 },
        { color: "Beige", size: "Standard", stock: 9 },
      ],
    },
    {
      slug: "strappy-flat-sandals-nude",
      title: "Strappy Flat Sandals — Nude Beige",
      description: "Delicate multi-strap flat sandals with adjustable ankle strap.",
      price: 1800,
      discountedPrice: 1450,
      isFeatured: 0,
      categorySlug: "flats-sandals",
      imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80",
      variants: [
        { color: "Nude", size: "36", stock: 10 },
        { color: "Nude", size: "37", stock: 14 },
        { color: "Nude", size: "38", stock: 10 },
        { color: "Tan", size: "37", stock: 5 },
      ],
    },
    {
      slug: "crystal-embellished-party-clutch",
      title: "Crystal Embellished Party Clutch — Silver",
      description: "Hand-beaded crystal clutch with magnetic snap closure.",
      price: 3500,
      discountedPrice: null,
      isFeatured: 0,
      categorySlug: "party-clutch",
      imageUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
      variants: [
        { color: "Silver", size: "Standard", stock: 8 },
        { color: "Gold", size: "Standard", stock: 6 },
      ],
    },
    {
      slug: "platform-espadrille-wedges-sale",
      title: "Platform Espadrille Wedges — On Sale",
      description: "Summery jute-wrapped wedge espadrilles with ankle-tie straps.",
      price: 2800,
      discountedPrice: 1400,
      isFeatured: 0,
      categorySlug: "clearance-sale",
      imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80",
      variants: [
        { color: "Tan", size: "37", stock: 3 },
        { color: "Tan", size: "38", stock: 4 },
        { color: "White", size: "38", stock: 2 },
      ],
    },
    {
      slug: "z-style-pointed-toe-stilettos",
      title: "Z-Style Pointed-Toe Stilettos — Onyx",
      description: "Signature Z-Style ultra-sleek pointed-toe stilettos with lacquer finish.",
      price: 3900,
      discountedPrice: 3200,
      isFeatured: 1,
      categorySlug: "z-style-heels",
      imageUrl: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&q=80",
      variants: [
        { color: "Black", size: "36", stock: 5 },
        { color: "Black", size: "37", stock: 8 },
        { color: "Black", size: "38", stock: 7 },
        { color: "Red", size: "37", stock: 4 },
        { color: "Red", size: "38", stock: 3 },
      ],
    },
  ];

  for (const p of products) {
    const existing = await query("SELECT id FROM products WHERE slug = ?", [p.slug]);
    if (existing.length === 0) {
      const productId = randomUUID();
      await query(
        "INSERT INTO products (id, title, slug, description, price, discountedPrice, isFeatured, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())",
        [productId, p.title, p.slug, p.description, p.price, p.discountedPrice, p.isFeatured]
      );
      
      // Image
      const imgId = randomUUID();
      await query(
        "INSERT INTO product_images (id, url, publicId, sortOrder, productId) VALUES (?, ?, ?, 0, ?)",
        [imgId, p.imageUrl, `seed_${p.slug}`, productId]
      );
      
      // Category relationship
      const catId = categoryIds[p.categorySlug];
      await query(
        "INSERT INTO product_categories (productId, categoryId) VALUES (?, ?)",
        [productId, catId]
      );
      
      // Variants
      for (const v of p.variants) {
        const varId = randomUUID();
        await query(
          "INSERT INTO product_variants (id, color, size, stock, productId) VALUES (?, ?, ?, ?, ?)",
          [varId, v.color, v.size, v.stock, productId]
        );
      }
      
      console.log(`  ✅ Created: ${p.title}`);
    } else {
      console.log(`  ⏭️  Skipped: ${p.title}`);
    }
  }

  console.log("\n🎉 Seeding complete!");
  console.log("📧 Admin: admin@fashion.devwonder.shop | 🔑 Password: Admin@1234");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e.message || e); process.exit(1); })
  .finally(async () => { await pool.end(); });
