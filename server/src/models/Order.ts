import { Schema, model, type InferSchemaType } from "mongoose";

export const orderStatuses = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "DELIVERED_DIGITALLY",
  "DELIVERED",
] as const;

const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: [{
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0.01 },
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
  }],
  delivery: {
    email: { type: String, required: true },
    country: { type: String, required: true },
    notes: { type: String, maxlength: 500, default: "" },
  },
  total: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: "USD", required: true },
  status: { type: String, enum: orderStatuses, default: "PENDING_PAYMENT", required: true },
  paymentStatus: { type: String, enum: ["CREATED", "APPROVED", "CAPTURED", "FAILED", "CANCELLED"], default: "CREATED", required: true },
  payment: {
    provider: { type: String, default: "paypal" },
    providerOrderId: { type: String, default: "" },
    captureId: { type: String, default: "" },
    idempotencyKey: { type: String, default: "" },
  },
  stockReserved: { type: Boolean, default: false },
  stockReservedAt: { type: Date, default: null },
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  }],
}, { timestamps: true });

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const Order = model("Order", orderSchema);
