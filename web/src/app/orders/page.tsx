"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CreditCard, PackageCheck } from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";
import { api, API_URL } from "@/lib/api";
import { useStore } from "@/components/StoreProvider";
import { PayPalCheckout } from "@/components/PayPalCheckout";

interface Order {
  _id: string;
  total: number;
  status: string;
  paymentStatus: string;
  payment?: { providerOrderId?: string };
  items: Array<{ title: string; author: string; unitPrice: number; quantity: number }>;
  createdAt: string;
}

export default function OrdersPage() {
  const { session } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [startingPayment, setStartingPayment] = useState("");

  const load = useCallback(async () => {
    if (!session) return;
    try { setOrders(await api<Order[]>("/api/orders/me", { headers: { Authorization: `Bearer ${session.token}` } })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar los pedidos"); }
  }, [session]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!session) return;
    const socket = io(API_URL, { auth: { token: session.token } });
    socket.on("order:updated", load);
    return () => { socket.disconnect(); };
  }, [session, load]);

  async function startPayment(orderId: string) {
    if (!session) return;
    setStartingPayment(orderId);
    setError("");
    try {
      await api("/api/payments/paypal/order", { method: "POST", headers: { Authorization: `Bearer ${session.token}` }, body: JSON.stringify({ orderId }) });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar el pago");
    } finally {
      setStartingPayment("");
    }
  }

  if (!session) return <main className="account-page"><Link className="back-link" href="/"><ArrowLeft size={15} /> Volver al catálogo</Link><h1>Tu biblioteca comienza aquí.</h1><p>Inicia sesión desde la portada para consultar tus pedidos.</p></main>;

  return <main className="account-page"><header className="account-header"><div><Link className="back-link" href="/"><ArrowLeft size={15} /> Volver al catálogo</Link><p className="eyebrow">LECTORA / CUENTA</p><h1>Mis pedidos</h1></div><p>{session.user.name}<br />{session.user.email}</p></header>{error && <p className="form-error">{error}</p>}<div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-summary"><div><p className="eyebrow">{new Date(order.createdAt).toLocaleDateString("es")}</p><h2>{order.items.map((item) => item.title).join(", ")}</h2></div><span className={`status status-${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span></div><div className="order-items">{order.items.map((item, index) => <p key={`${item.title}-${index}`}>{item.quantity} × {item.title}<span>${(item.unitPrice * item.quantity).toFixed(2)}</span></p>)}</div><div className="order-bottom"><div><PackageCheck size={18} /><span>{order.paymentStatus === "CAPTURED" ? "Pago confirmado" : "Esperando confirmación de pago"}</span></div><strong>${order.total.toFixed(2)} USD</strong></div>{order.paymentStatus !== "CAPTURED" && <div className="paypal-box"><p><CreditCard size={15} /> Completar pago Sandbox</p>{order.payment?.providerOrderId ? <PayPalCheckout orderId={order._id} token={session.token} providerOrderId={order.payment.providerOrderId} onRefresh={load} /> : <button className="submit" disabled={startingPayment === order._id} onClick={() => startPayment(order._id)}>{startingPayment === order._id ? "Creando orden PayPal…" : "Iniciar pago"}</button>}</div>}</article>)}</div>{orders.length === 0 && !error && <p className="empty">Aún no tienes pedidos.</p>}</main>;
}
