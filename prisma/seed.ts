import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const u = new URL(connectionString);
const adapter = new PrismaMariaDb({
  host: u.hostname,
  port: Number(u.port) || 3306,
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.replace("/", ""),
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Clearing old data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteSetting.deleteMany();

  console.log("Seeding settings...");
  await prisma.siteSetting.createMany({
    data: [
      { key: "store_name", value: "DevWonder Fashion" },
      { key: "store_email", value: "contact@fashion.devwonder.shop" },
      { key: "store_phone", value: "+8801700000000" },
      { key: "currency", value: "BDT" },
      { key: "shipping_fee", value: "80" },
      { key: "free_shipping_threshold", value: "1000" },
    ],
  });

  console.log("Seeding categories...");
  const catBags = await prisma.category.create({
    data: {
      name: "Luxury Bags",
      slug: "luxury-bags",
      description: "Premium imported designer bags",
      image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop",
      sortOrder: 1,
    },
  });

  const catHeels = await prisma.category.create({
    data: {
      name: "Designer Heels",
      slug: "designer-heels",
      description: "Elegant heels for any occasion",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop",
      sortOrder: 2,
    },
  });

  const catFlats = await prisma.category.create({
    data: {
      name: "Comfort Flats",
      slug: "comfort-flats",
      description: "Everyday comfort wear",
      image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=600&auto=format&fit=crop",
      sortOrder: 3,
    },
  });

  console.log("Seeding products...");
  await prisma.product.create({
    data: {
      title: "Chanel Classic Flap Bag (Replica)",
      slug: "chanel-classic-flap-replica",
      description: "High quality premium replica of the iconic flap bag.",
      price: 4500,
      discountedPrice: 3900,
      isFeatured: true,
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop", publicId: "dummy1", sortOrder: 0 }],
      },
      categories: {
        create: [{ category: { connect: { id: catBags.id } } }],
      },
      variants: {
        create: [{ color: "Black", stock: 15 }, { color: "Beige", stock: 5 }],
      },
    },
  });

  await prisma.product.create({
    data: {
      title: "Stiletto Party Heels - Rose Gold",
      slug: "stiletto-party-heels-rosegold",
      description: "Stunning 4-inch stilettos perfect for weddings and parties.",
      price: 2800,
      isFeatured: true,
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop", publicId: "dummy2", sortOrder: 0 }],
      },
      categories: {
        create: [{ category: { connect: { id: catHeels.id } } }],
      },
      variants: {
        create: [{ size: "36", stock: 10 }, { size: "37", stock: 15 }, { size: "38", stock: 20 }],
      },
    },
  });

  await prisma.product.create({
    data: {
      title: "Everyday Leather Loafers",
      slug: "everyday-leather-loafers",
      description: "Soft faux leather loafers for daily office wear.",
      price: 1500,
      discountedPrice: 1200,
      isFeatured: false,
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=600&auto=format&fit=crop", publicId: "dummy3", sortOrder: 0 }],
      },
      categories: {
        create: [{ category: { connect: { id: catFlats.id } } }],
      },
      variants: {
        create: [{ size: "37", color: "Brown", stock: 30 }, { size: "38", color: "Brown", stock: 30 }],
      },
    },
  });

  await prisma.product.create({
    data: {
      title: "Premium Handcrafted Tote",
      slug: "premium-handcrafted-tote",
      description: "Spacious tote bag for everyday essentials.",
      price: 3200,
      isFeatured: true,
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop", publicId: "dummy4", sortOrder: 0 }],
      },
      categories: {
        create: [{ category: { connect: { id: catBags.id } } }],
      },
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
