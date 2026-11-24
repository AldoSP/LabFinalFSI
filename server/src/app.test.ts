import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { createApp } from "./app.js";

test("health endpoint is public and does not expose configuration", async () => {
  const server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("unknown routes return a safe 404", async () => {
  const server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/not-a-route`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: "Ruta no encontrada" });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
