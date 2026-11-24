"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Book, Session } from "@/lib/api";

export type CartItem = { book: Book; quantity: number };
interface StoreContextValue {
  cart: CartItem[];
  addToCart: (book: Book) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  cartCount: number;
  subtotal: number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [session, updateSession] = useState<Session | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("ebook-store-session");
    const savedCart = localStorage.getItem("ebook-store-cart");
    if (savedSession) updateSession(JSON.parse(savedSession) as Session);
    if (savedCart) setCart(JSON.parse(savedCart) as CartItem[]);
  }, []);

  useEffect(() => { localStorage.setItem("ebook-store-cart", JSON.stringify(cart)); }, [cart]);

  function setSession(value: Session | null) {
    updateSession(value);
    if (value) localStorage.setItem("ebook-store-session", JSON.stringify(value));
    else localStorage.removeItem("ebook-store-session");
  }

  function addToCart(book: Book) {
    setCart((current) => {
      const existing = current.find((item) => item.book._id === book._id);
      if (existing) return current.map((item) => item.book._id === book._id ? { ...item, quantity: Math.min(item.quantity + 1, book.stock) } : item);
      return [...current, { book, quantity: 1 }];
    });
  }

  function setQuantity(bookId: string, quantity: number) {
    setCart((current) => quantity <= 0 ? current.filter((item) => item.book._id !== bookId) : current.map((item) => item.book._id === bookId ? { ...item, quantity: Math.min(quantity, item.book.stock) } : item));
  }

  return <StoreContext.Provider value={{ cart, addToCart, setQuantity, clearCart: () => setCart([]), session, setSession, cartCount: cart.reduce((sum, item) => sum + item.quantity, 0), subtotal: cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0) }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore debe usarse dentro de StoreProvider");
  return context;
}
