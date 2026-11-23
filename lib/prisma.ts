import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const readOnly = process.env.VERCEL === "1";
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
    readonly: readOnly,
  }),
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
