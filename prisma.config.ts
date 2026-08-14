import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  datasource: {
    // DATABASE_URL format: mysql://USER:PASSWORD@HOST:3306/DBNAME
    url: process.env.DATABASE_URL ?? "mysql://root:@localhost:3306/devwonder",
  },
});
