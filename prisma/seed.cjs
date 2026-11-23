const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }) });
async function main() {
  await prisma.book.upsert({ where: { id: 1 }, update: {}, create: { id: 1, title: 'Laskar Pelangi', author: 'Andrea Hirata' } });
  await prisma.book.upsert({ where: { id: 2 }, update: {}, create: { id: 2, title: 'Bumi', author: 'Tere Liye' } });
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
