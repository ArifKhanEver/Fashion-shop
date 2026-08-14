const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Category
  const category = await prisma.category.create({
    data: {
      name: "Bags",
      slug: "bags",
      description: "Premium Leather Bags",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    }
  });

  const category2 = await prisma.category.create({
    data: {
      name: "Heels",
      slug: "heels",
      description: "Elegant Stiletto Heels",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    }
  });

  // Create Product 1
  await prisma.product.create({
    data: {
      title: "Classic Leather Tote Bag",
      slug: "classic-leather-tote-bag",
      description: "A classic leather tote bag with gold hardware.",
      price: 4200,
      isFeatured: true,
      isActive: true,
      categories: {
        create: [
          { categoryId: category.id }
        ]
      },
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80", publicId: "bag_img", sortOrder: 0 }
        ]
      },
      variants: {
        create: [
          { color: "Brown", size: "Standard", stock: 10 }
        ]
      }
    }
  });

  // Create Product 2
  await prisma.product.create({
    data: {
      title: "Elegant Stiletto Heels",
      slug: "elegant-stiletto-heels",
      description: "Premium collection stiletto heels.",
      price: 2500,
      isFeatured: true,
      isActive: true,
      categories: {
        create: [
          { categoryId: category2.id }
        ]
      },
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80", publicId: "heel_img", sortOrder: 0 }
        ]
      },
      variants: {
        create: [
          { color: "Black", size: "38", stock: 15 },
          { color: "Black", size: "39", stock: 5 },
        ]
      }
    }
  });

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
