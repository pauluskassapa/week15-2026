import { NextResponse } from "next/server";
import { prisma, readOnly } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await prisma.book.findMany({ orderBy: { id: "asc" } }));
  } catch {
    return NextResponse.json({ error: "Data buku gagal dimuat." }, { status: 500 });
  }
}

async function write(request: Request, operation: "create" | "update" | "delete") {
  if (readOnly) return NextResponse.json({ error: "Versi Vercel hanya dapat membaca data. Jalankan CRUD di localhost." }, { status: 403 });
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  const { id } = body;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  if (operation !== "create" && (!Number.isSafeInteger(id) || id < 1)) {
    return NextResponse.json({ error: "ID buku tidak valid." }, { status: 400 });
  }
  if (operation !== "delete" && (!title || !author || title.length > 100 || author.length > 100)) {
    return NextResponse.json({ error: "Judul dan penulis wajib diisi, maksimal 100 karakter." }, { status: 400 });
  }
  try {
    if (operation === "create") return NextResponse.json(await prisma.book.create({ data: { title, author } }), { status: 201 });
    if (operation === "update") return NextResponse.json(await prisma.book.update({ where: { id }, data: { title, author } }));
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const missing = error && typeof error === "object" && "code" in error && error.code === "P2025";
    return NextResponse.json({ error: missing ? "Buku tidak ditemukan." : "Data gagal disimpan." }, { status: missing ? 404 : 500 });
  }
}
export const POST = (request: Request) => write(request, "create");
export const PUT = (request: Request) => write(request, "update");
export const DELETE = (request: Request) => write(request, "delete");
