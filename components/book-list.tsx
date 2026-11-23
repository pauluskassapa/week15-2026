"use client";

import { FormEvent, useState } from "react";

type Book = { id: number; title: string; author: string };

export default function BookList({ initialBooks, readOnly }: { initialBooks: Book[]; readOnly: boolean }) {
  const [books, setBooks] = useState(initialBooks);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function reset() { setTitle(""); setAuthor(""); setEditId(null); }

  async function mutate(method: string, data: object, success: string) {
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/books", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const refreshed = await fetch("/api/books", { cache: "no-store" });
      if (!refreshed.ok) throw new Error("Perubahan tersimpan, tetapi daftar gagal dimuat. Muat ulang halaman.");
      setBooks(await refreshed.json()); reset(); setMessage(success);
    } catch (err) { setError(err instanceof Error ? err.message : "Terjadi kesalahan."); }
    finally { setBusy(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutate(editId === null ? "POST" : "PUT", { id: editId, title, author }, editId === null ? "Buku berhasil ditambahkan." : "Buku berhasil diperbarui.");
  }

  return (
    <main>
      <header>
        <div><h1>Daftar Buku</h1><p>Catat dan kelola koleksi buku sederhana.</p></div>
        <a href="/about">About</a>
      </header>
      {!readOnly && <section>
        <h2>{editId === null ? "Tambah Buku" : "Edit Buku"}</h2>
        <form onSubmit={submit}>
          <div className="fields">
            <label htmlFor="title">Judul buku<input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Laskar Pelangi" required maxLength={100} disabled={busy} /></label>
            <label htmlFor="author">Penulis<input id="author" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Contoh: Andrea Hirata" required maxLength={100} disabled={busy} /></label>
          </div>
          <button type="submit" disabled={busy}>{busy ? "Menyimpan..." : editId === null ? "Tambah Buku" : "Simpan Perubahan"}</button>
          {editId !== null && <button type="button" className="secondary" onClick={reset} disabled={busy}>Batal</button>}
        </form>
      </section>}
      {message && <p className="success" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <section>
        <div className="list-heading"><h2>Data Buku</h2><span>{books.length} buku</span></div>
        <div className="table-wrap"><table>
          <thead><tr><th>No.</th><th>Judul buku</th><th>Penulis</th>{!readOnly && <th>Aksi</th>}</tr></thead>
          <tbody>{books.length === 0 ? <tr><td colSpan={readOnly ? 3 : 4} className="empty">Belum ada buku. Tambahkan buku pertama.</td></tr> : books.map((book, index) => <tr key={book.id}>
            <td>{index + 1}</td><td>{book.title}</td><td>{book.author}</td>
            {!readOnly && <td className="actions"><button className="secondary" disabled={busy} onClick={() => { setEditId(book.id); setTitle(book.title); setAuthor(book.author); setMessage(""); setError(""); document.getElementById("title")?.focus(); }}>Edit</button><button className="delete" disabled={busy} onClick={() => { if (window.confirm(`Hapus buku "${book.title}"?`)) void mutate("DELETE", { id: book.id }, `Buku "${book.title}" berhasil dihapus.`); }}>Hapus</button></td>}
          </tr>)}</tbody>
        </table></div>
      </section>
      <footer>Latihan CRUD · Front End Programming · 2026</footer>
    </main>
  );
}
