"use client";

import { Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useStore } from "./StoreProvider";

export function CartDrawer({ open, onClose, onRequireAuth }: { open: boolean; onClose: () => void; onRequireAuth: () => void }) {
  const { cart, setQuantity, subtotal, session, clearCart } = useStore();
  const [checkout, setCheckout] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  if (!open) return null;

  async function createOrder(formData: FormData) {
    if (!session) { onClose(); onRequireAuth(); return; }
    setBusy(true); setError("");
    try {
      const email = String(formData.get("email") ?? "").trim();
      const country = String(formData.get("country") ?? "").trim();
      const notes = String(formData.get("notes") ?? "").trim();
      const order = await api<{ _id: string }>("/api/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          items: cart.map((item) => ({ bookId: item.book._id, quantity: item.quantity })),
          delivery: { email, country, notes },
        }),
      });
      await api("/api/payments/paypal/order", { method: "POST", headers: { Authorization: `Bearer ${session.token}` }, body: JSON.stringify({ orderId: order._id }) });
      setComplete(true); clearCart();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear el pedido"); }
    finally { setBusy(false); }
  }

  return <div className="backdrop"><aside className="drawer"><div className="drawer-head"><div><p className="eyebrow">SELECCIÓN PERSONAL</p><h2>Tu bolsa</h2></div><button className="close static" onClick={onClose} title="Cerrar"><X size={19} /></button></div>{complete ? <div className="success"><p className="eyebrow">PEDIDO CREADO</p><h3>Tu pago Sandbox está listo.</h3><p>La orden se creó correctamente. Consulta tus pedidos para completar o revisar el flujo de PayPal.</p><button className="submit" onClick={onClose}>Continuar</button></div> : cart.length === 0 ? <p className="empty-cart">Tu bolsa está esperando una buena lectura.</p> : checkout ? <form onSubmit={(event) => { event.preventDefault(); void createOrder(new FormData(event.currentTarget)); }} className="checkout-form"><button type="button" className="text-action" onClick={() => setCheckout(false)}>← Volver a la bolsa</button><label>Correo de entrega<input name="email" type="email" defaultValue={session?.user.email} required /></label><label>País<input name="country" required minLength={2} maxLength={80} /></label><label>Notas<textarea name="notes" maxLength={500} /></label><div className="drawer-total"><span>Total</span><strong>${subtotal.toFixed(2)} USD</strong></div>{error && <p className="form-error">{error}</p>}<button className="submit" disabled={busy}>{busy ? "Creando pedido…" : "Crear pedido PayPal"}</button><p className="fine-print">El backend vuelve a calcular precios y stock antes de crear la orden.</p></form> : <><div className="cart-items">{cart.map((item) => <article key={item.book._id}><img src={item.book.coverImageUrl} alt="" /><div><h3>{item.book.title}</h3><p>{item.book.author}</p><div className="quantity"><button onClick={() => setQuantity(item.book._id, item.quantity - 1)} title="Reducir">{item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}</button><span>{item.quantity}</span><button onClick={() => setQuantity(item.book._id, item.quantity + 1)} disabled={item.quantity >= Math.min(item.book.stock, 10)} title="Máximo 10 unidades por título"><Plus size={14} /></button></div></div><strong>${(item.book.price * item.quantity).toFixed(2)}</strong></article>)}</div><div className="drawer-total"><span>Subtotal</span><strong>${subtotal.toFixed(2)} USD</strong></div><button className="submit" onClick={() => session ? setCheckout(true) : (onClose(), onRequireAuth())}>Finalizar compra</button><p className="fine-print">Máximo 10 unidades por título. Impuestos y entrega incluidos según el producto digital.</p></>}</aside></div>;
}
