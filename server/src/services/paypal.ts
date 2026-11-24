import { config } from "../config.js";

interface AccessTokenResponse { access_token: string }
interface PayPalOrderResponse {
  id: string;
  status: string;
  purchase_units?: Array<{
    amount?: { currency_code: string; value: string };
    payments?: { captures?: Array<{ id: string; status: string; amount?: { currency_code: string; value: string } }> };
  }>;
}

async function getAccessToken() {
  if (!config.PAYPAL_CLIENT_ID || !config.PAYPAL_CLIENT_SECRET) {
    throw new Error("Credenciales PayPal no configuradas");
  }
  const credentials = Buffer.from(`${config.PAYPAL_CLIENT_ID}:${config.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${config.PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error("No se pudo autenticar con PayPal");
  return (await response.json() as AccessTokenResponse).access_token;
}

export async function createPayPalOrder(amount: number, referenceId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${config.PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: referenceId,
        amount: { currency_code: "USD", value: amount.toFixed(2) },
      }],
    }),
  });
  if (!response.ok) throw new Error("PayPal no aceptó la orden");
  return await response.json() as PayPalOrderResponse;
}

export async function capturePayPalOrder(providerOrderId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${config.PAYPAL_API_BASE}/v2/checkout/orders/${providerOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("PayPal no capturó la orden");
  return await response.json() as PayPalOrderResponse;
}
