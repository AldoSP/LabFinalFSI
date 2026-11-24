import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import jwt from "jsonwebtoken";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { Book } from "./models/Book.js";
import { Order } from "./models/Order.js";

async function startTestServer() {
  const server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function stopTestServer(server: ReturnType<typeof createServer>) {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

function token(sub = "user-a", role: "customer" | "admin" = "customer") {
  return jwt.sign({ sub, role }, config.JWT_SECRET, { expiresIn: "5m" });
}

test("protected endpoints reject anonymous access", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(`${baseUrl}/api/orders/me`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Autenticación requerida" });
  } finally { await stopTestServer(server); }
});

test("customer cannot access administrator catalog operations", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(`${baseUrl}/api/books/admin/all`, { headers: { Authorization: `Bearer ${token()}` } });
    assert.equal(response.status, 403);
  } finally { await stopTestServer(server); }
});

test("invalid quantities are rejected before a model write", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ bookId: "507f1f77bcf86cd799439011", quantity: -2 }], delivery: { email: "buyer@example.test", country: "CO", notes: "" } }),
    });
    assert.equal(response.status, 400);
  } finally { await stopTestServer(server); }
});

test("order total comes from database prices, not browser input", async () => {
  const originalFind = Book.find;
  const originalCreate = Order.create;
  const created: Array<Record<string, unknown>> = [];
  Book.find = (() => Promise.resolve([{ _id: "507f1f77bcf86cd799439011", id: "507f1f77bcf86cd799439011", title: "Prueba", author: "Autora", price: 25, stock: 10 }])) as unknown as typeof Book.find;
  Order.create = (async (value: Record<string, unknown>) => { created.push(value); return value; }) as unknown as typeof Order.create;
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ bookId: "507f1f77bcf86cd799439011", quantity: 2, price: 0.01 }], delivery: { email: "buyer@example.test", country: "CO", notes: "" }, total: 0.02 }),
    });
    assert.equal(response.status, 201);
    assert.equal(created[0]?.total, 50);
  } finally {
    Book.find = originalFind;
    Order.create = originalCreate;
    await stopTestServer(server);
  }
});

test("payment capture queries by owner and hides another user's order", async () => {
  const originalFindOne = Order.findOne;
  let observedFilter: Record<string, unknown> | undefined;
  Order.findOne = ((filter: Record<string, unknown>) => { observedFilter = filter; return Promise.resolve(null); }) as unknown as typeof Order.findOne;
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(`${baseUrl}/api/payments/paypal/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token("user-a")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "507f1f77bcf86cd799439012" }),
    });
    assert.equal(response.status, 404);
    assert.equal(observedFilter?.userId, "user-a");
  } finally {
    Order.findOne = originalFindOne;
    await stopTestServer(server);
  }
});

test("repeated capture returns the known result without calling PayPal", async () => {
  const originalFindOne = Order.findOne;
  Order.findOne = (() => Promise.resolve({ paymentStatus: "CAPTURED", payment: { captureId: "CAP-123" }, id: "507f1f77bcf86cd799439012", toJSON: () => ({}) })) as unknown as typeof Order.findOne;
  const { server, baseUrl } = await startTestServer();
  try {
    const response = await fetch(`${baseUrl}/api/payments/paypal/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "507f1f77bcf86cd799439012" }),
    });
    assert.equal(response.status, 200);
    const body = await response.json() as { alreadyCaptured: boolean; captureId: string };
    assert.equal(body.alreadyCaptured, true);
    assert.equal(body.captureId, "CAP-123");
  } finally {
    Order.findOne = originalFindOne;
    await stopTestServer(server);
  }
});
