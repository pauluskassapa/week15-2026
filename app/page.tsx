import BookList from "@/components/book-list";
import { prisma, readOnly } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const books = await prisma.book.findMany({ orderBy: { id: "asc" } });
  return <BookList initialBooks={books} readOnly={readOnly} />;
}
