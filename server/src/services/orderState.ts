import type { OrderDocument } from "../models/Order.js";

export const nextOrderStatuses: Record<OrderDocument["status"], OrderDocument["status"] | null> = {
  PENDING_PAYMENT: "PAID",
  PAID: "PROCESSING",
  PROCESSING: "READY_FOR_DELIVERY",
  READY_FOR_DELIVERY: "DELIVERED_DIGITALLY",
  DELIVERED_DIGITALLY: "DELIVERED",
  DELIVERED: null,
};

export function canTransition(from: OrderDocument["status"], to: OrderDocument["status"]) {
  return nextOrderStatuses[from] === to;
}
