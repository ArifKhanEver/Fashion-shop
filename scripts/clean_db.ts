import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("Cleaning database...");
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  console.log("Database cleaned!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
