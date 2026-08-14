require("dotenv").config({ path: ".env" });
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const mariadb = require("mariadb");
const bcrypt = require("bcryptjs");

function parseMysqlUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace("/", ""),
    ssl: { rejectUnauthorized: false },
    connectionLimit: 5,
    connectTimeout: 30000,
    socketTimeout: 60000,
    acquireTimeout: 30000,
  };
}

const dbConfig = parseMysqlUrl(process.env.DATABASE_URL);
console.log("🔗 Connecting to:", dbConfig.host + ":" + dbConfig.port + "/" + dbConfig.database);

// Pass config directly to PrismaMariaDb (NOT a pool object)
const adapter = new PrismaMariaDb(dbConfig);
const prisma = new PrismaClient({ adapter });

// Quick raw connection test to verify DB reachability
async function testConnection() {
  const pool = mariadb.createPool(dbConfig);
  const conn = await pool.getConnection();
  console.log("✅ Raw connection test successful!");
  conn.release();
  await pool.end();
}

async function main() {
  await testConnection();
  console.log("🌱 Seeding via Prisma...");

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
      create: { name: cat.name, slug: cat.slug, isActive: true },
    });
  }

  console.log(`✅ ${categories.length} categories created`);
  console.log("\n🎉 Seeding complete!");
  console.log("📧 Admin Email: admin@fashion.devwonder.shop");
  console.log("🔑 Admin Password: Admin@1234");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
