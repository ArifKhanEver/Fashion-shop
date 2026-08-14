import dotenv from "dotenv";
dotenv.config();

import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const pCount = await prisma.product.count();
    const cCount = await prisma.category.count();
    const oCount = await prisma.order.count();
    console.log(`Products: ${pCount}, Categories: ${cCount}, Orders: ${oCount}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
