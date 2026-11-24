"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { API_URL } from "@/lib/api";

interface PayPalNamespace {
  Buttons: (options: {
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel: () => void;
    onError: (error: unknown) => void;
  }) => { render: (selector: string) => Promise<void> };
}

declare global {
  interface Window { paypal?: PayPalNamespace }
}

export function PayPalCheckout({ orderId, token, providerOrderId, onRefresh }: { orderId: string; token: string; providerOrderId: string; onRefresh: () => void | Promise<void> }) {
  const containerId = `paypal-${orderId}`;
  const rendered = useRef(false);
  const [error, setError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  async function renderButtons() {
    if (rendered.current || !window.paypal) return;
    rendered.current = true;
    await window.paypal.Buttons({
      createOrder: async () => providerOrderId,
      onApprove: async () => {
        const response = await fetch(`${API_URL}/api/payments/paypal/capture`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "No se pudo capturar el pago");
        await onRefresh();
      },
      onCancel: () => {
        void (async () => {
          const response = await fetch(`${API_URL}/api/payments/paypal/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ orderId }),
          });
          if (!response.ok) {
            setError("No se pudo liberar la reserva del pedido.");
            return;
          }
          await onRefresh();
          setError("Pago cancelado. El stock fue liberado; inicia nuevamente el pago.");
        })();
      },
      onError: () => setError("PayPal no pudo completar la operación."),
    }).render(`#${containerId}`);
  }

  if (!clientId) return <p className="form-error">Configura NEXT_PUBLIC_PAYPAL_CLIENT_ID para habilitar el Sandbox.</p>;
  return <><Script src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`} strategy="afterInteractive" onReady={() => { void renderButtons(); }} /><div id={containerId} />{error && <p className="form-error">{error}</p>}</>;
}
