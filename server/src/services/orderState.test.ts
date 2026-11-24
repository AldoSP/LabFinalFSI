import assert from "node:assert/strict";
import test from "node:test";
import { canTransition } from "./orderState.js";

test("allows only the next valid order transition", () => {
  assert.equal(canTransition("PENDING_PAYMENT", "PAID"), true);
  assert.equal(canTransition("PAID", "PROCESSING"), true);
  assert.equal(canTransition("PROCESSING", "READY_FOR_DELIVERY"), true);
  assert.equal(canTransition("PAID", "DELIVERED"), false);
  assert.equal(canTransition("DELIVERED", "PROCESSING"), false);
});
