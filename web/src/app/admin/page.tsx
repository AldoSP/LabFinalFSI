"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookPlus, Boxes, ChevronRight, Package, Save } from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";
import { api, API_URL, type Book } from "@/lib/api";
import { useStore } from "@/components/StoreProvider";

interface AdminOrder { _id: string; total: number; status: string; paymentStatus: string; createdAt: string; userId: { name: string; email: string }; items: Array<{ title: string; quantity: number }> }
const transition: Record<string, string> = { PAID: "PROCESSING", PROCESSING: "READY_FOR_DELIVERY", READY_FOR_DELIVERY: "DELIVERED_DIGITALLY", DELIVERED_DIGITALLY: "DELIVERED" };

export default function AdminPage() {
  const { session } = useStore();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [message, setMessage] = useState("");
  const headers = session ? { Authorization: `Bearer ${session.token}` } : undefined;
  const load = useCallback(async () => {
    if (session?.user.role !== "admin") return;
    try { const [nextOrders, nextBooks] = await Promise.all([api<AdminOrder[]>("/api/orders", { headers }), api<Book[]>("/api/books/admin/all", { headers })]); setOrders(nextOrders); setBooks(nextBooks); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "No se pudieron cargar los datos"); }
  }, [session]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!session) return; const socket = io(API_URL, { auth: { token: session.token } }); socket.on("order:created", load); return () => { socket.disconnect(); }; }, [session, load]);

  async function advance(order: AdminOrder) { try { const status = transition[order.status]; if (!status) return; await api(`/api/orders/${order._id}/status`, { method: "PATCH", headers, body: JSON.stringify({ status }) }); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "No se pudo actualizar"); } }
  async function updateStock(book: Book, stock: number) { try { await api(`/api/books/admin/${book._id}`, { method: "PATCH", headers, body: JSON.stringify({ stock }) }); setMessage(`${book.title}: stock actualizado`); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "No se pudo actualizar stock"); } }
  async function createBook(formData: FormData) { try { await api("/api/books/admin", { method: "POST", headers, body: JSON.stringify({ title: formData.get("title"), author: formData.get("author"), description: formData.get("description"), category: formData.get("category"), price: Number(formData.get("price")), stock: Number(formData.get("stock")), format: formData.get("format"), coverImageUrl: formData.get("coverImageUrl"), available: true }) }); setMessage("Libro creado"); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "No se pudo crear el libro"); } }

  if (session?.user.role !== "admin") return <main className="account-page"><Link className="back-link" href="/"><ArrowLeft size={15} /> Volver</Link><h1>Panel administrativo</h1><p>Inicia sesión con una cuenta administradora para continuar.</p></main>;
  const columns = ["PAID", "PROCESSING", "READY_FOR_DELIVERY", "DELIVERED_DIGITALLY"];
  return <main className="admin-shell"><header className="admin-top"><Link className="brand" href="/"><ArrowLeft size={18} /> LECTORA / OPERACIÓN</Link><span>{session.user.name} · ADMIN</span></header>{message && <p className="admin-message">{message}</p>}<section className="admin-overview"><div><p className="eyebrow">RESUMEN OPERATIVO</p><h1>Pedidos y entregas</h1></div><article><Package size={20} /><strong>{orders.length}</strong><span>pedidos</span></article><article><Boxes size={20} /><strong>{books.length}</strong><span>títulos activos</span></article></section><section className="kanban">{columns.map((column) => <div className="kanban-column" key={column}><h2>{column.replaceAll("_", " ")} <span>{orders.filter((order) => order.status === column).length}</span></h2>{orders.filter((order) => order.status === column).map((order) => <article className="order-ticket" key={order._id}><p>{new Date(order.createdAt).toLocaleDateString("es")}</p><h3>{order.items.map((item) => `${item.quantity}× ${item.title}`).join(" · ")}</h3><small>{order.userId.name}</small><div><strong>${order.total.toFixed(2)}</strong><button onClick={() => advance(order)} title="Avanzar estado"><ChevronRight size={17} /></button></div></article>)}</div>)}</section><section className="admin-grid"><div><div className="panel-title"><h2><Boxes size={20} /> Stock</h2></div>{books.map((book) => <div className="stock-row" key={book._id}><img src={book.coverImageUrl} alt="" /><div><strong>{book.title}</strong><span>{book.author}</span></div><input type="number" min="0" defaultValue={book.stock} onBlur={(event) => updateStock(book, Number(event.target.value))} /><Save size={16} /></div>)}</div><form action={createBook} className="book-form"><h2><BookPlus size={20} /> Nuevo libro</h2><label>Título<input name="title" required /></label><label>Autor<input name="author" required /></label><label>Descripción<textarea name="description" required /></label><div className="form-pair"><label>Categoría<input name="category" required /></label><label>Formato<select name="format"><option>EPUB</option><option>PDF</option><option>MOBI</option></select></label></div><div className="form-pair"><label>Precio<input name="price" type="number" min="0.01" step="0.01" required /></label><label>Stock<input name="stock" type="number" min="0" required /></label></div><label>URL de portada<input name="coverImageUrl" type="url" required /></label><button className="submit">Crear libro</button></form></section></main>;
}
