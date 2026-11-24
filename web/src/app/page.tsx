"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Search, ShoppingBag, UserRound } from "lucide-react";
import { api, type Book, type Session } from "@/lib/api";
import { useStore } from "@/components/StoreProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthDialog } from "@/components/AuthDialog";

const heroCover = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=85";

export default function HomePage() {
  const { addToCart, cartCount, session, setSession } = useStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    api<Book[]>("/api/books")
      .then((result) => { setBooks(result); setCatalogError(""); })
      .catch((cause) => setCatalogError(cause instanceof Error ? cause.message : "No se pudo conectar con el catálogo"))
      .finally(() => setLoadingCatalog(false));
  }, []);
  const categories = useMemo(() => ["Todos", ...new Set(books.map((book) => book.category))], [books]);
  const visible = books.filter((book) => (category === "Todos" || book.category === category) && `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase()));

  function authenticate(nextSession: Session) { setSession(nextSession); setAuthOpen(false); }

  return <main>
    <header className="topbar"><a className="brand" href="#"><BookOpen size={21} /> LECTORA</a><nav><a href="#catalogo">Catálogo</a><a href="#colecciones">Colecciones</a><a href="/orders">Mis pedidos</a>{session?.user.role === "admin" && <a href="/admin">Administración</a>}</nav><div className="actions"><button className="icon-button" onClick={() => setAuthOpen(true)} title={session ? `Sesión de ${session.user.name}` : "Ingresar"}><UserRound size={19} /></button>{session && <button className="session-button" onClick={() => setSession(null)}>Salir</button>}<button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={18} /><span>{cartCount}</span></button></div></header>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">LIBRERÍA DIGITAL INDEPENDIENTE</p><h1>Ideas que caben<br />en cualquier lugar.</h1><p className="lede">Libros para leer, pensar y volver a mirar. Compra una copia digital, paga con seguridad y comienza a leer al instante.</p><a className="primary-link" href="#catalogo">Explorar catálogo <ArrowRight size={17} /></a></div><div className="hero-visual"><img src={visible[0]?.coverImageUrl ?? heroCover} alt="Selección editorial" /><p>SELECCIÓN DE NOVIEMBRE</p><h2>Leer abre otra puerta</h2></div></section>
    <section className="catalog" id="catalogo"><div className="section-heading"><div><p className="eyebrow">CATÁLOGO / 2026</p><h2>Encuentra tu próxima lectura</h2></div><label className="search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título o autor" /></label></div><div className="filters">{categories.map((item) => <button key={item} className={item === category ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>{catalogError && <p className="form-error catalog-state">No se pudo cargar el catálogo: {catalogError}</p>}{loadingCatalog && <p className="empty">Conectando con el catálogo…</p>}<div className="book-grid">{visible.map((book) => <article className="book" key={book._id}><div className="cover-wrap"><img src={book.coverImageUrl} alt={`Portada de ${book.title}`} /><span>{book.format}</span></div><div className="book-meta"><p>{book.category}</p><h3>{book.title}</h3><h4>{book.author}</h4><div><strong>${book.price.toFixed(2)}</strong><button onClick={() => addToCart(book)} aria-label={`Agregar ${book.title}`}><ShoppingBag size={17} /></button></div></div></article>)}</div>{!loadingCatalog && !catalogError && visible.length === 0 && <p className="empty">No hay libros que coincidan con tu búsqueda.</p>}</section>
    <footer><p>LECTORA / COMPRA LIBROS DIGITALES CON SEGURIDAD</p><span>PayPal Sandbox · entrega digital · datos protegidos</span></footer>
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onRequireAuth={() => setAuthOpen(true)} />
    <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={authenticate} />
  </main>;
}
