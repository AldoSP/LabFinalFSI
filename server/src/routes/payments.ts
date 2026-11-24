import { Router } from "express";
import type { Server } from "socket.io";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Book } from "../models/Book.js";
import { Order } from "../models/Order.js";
import { capturePayPalOrder, createPayPalOrder } from "../services/paypal.js";

const router = Router();
const orderIdSchema = z.object({ orderId: z.string().min(1) });

const reservationTtlMs = 15 * 60 * 1000;

async function changeReservedStock(order: InstanceType<typeof Order>, direction: 1 | -1) {
  const reserved: Array<{ bookId: unknown; quantity: number }> = [];
  try {
    for (const item of order.items) {
      const filter = direction === -1 ? { _id: item.bookId, available: true, stock: { $gte: item.quantity } } : { _id: item.bookId };
      const result = await Book.updateOne(filter, { $inc: { stock: direction * item.quantity } });
      if (result.modifiedCount !== 1) throw new Error("Insufficient stock");
      reserved.push({ bookId: item.bookId, quantity: item.quantity });
    }
  } catch (error) {
    await Promise.all(reserved.map((item) => Book.updateOne({ _id: item.bookId }, { $inc: { stock: -direction * item.quantity } })));
    throw error;
  }
}

async function releaseExpiredReservation(order: InstanceType<typeof Order>) {
  const expiredAt = order.stockReservedAt?.getTime();
  if (!order.stockReserved || !expiredAt || Date.now() - expiredAt <= reservationTtlMs) return;
  await changeReservedStock(order, 1);
  order.stockReserved = false;
  order.stockReservedAt = null;
  order.paymentStatus = "CREATED";
  order.payment!.providerOrderId = "";
  await order.save();
}

router.post("/paypal/order", requireAuth, async (request, response, next) => {
  try {
    const { orderId } = orderIdSchema.parse(request.body);
    const order = await Order.findOne({ _id: orderId, userId: request.auth!.sub });
    if (!order) { response.status(404).json({ message: "Pedido no encontrado" }); return; }
    await releaseExpiredReservation(order);
    const payment = order.payment!;
    if (order.paymentStatus === "CAPTURED") { response.status(409).json({ message: "El pedido ya está pagado" }); return; }
    if (payment.providerOrderId) {
      response.json({ providerOrderId: payment.providerOrderId });
      return;
    }
    const paypalOrder = await createPayPalOrder(order.total, order.id);
    if (!paypalOrder.id) throw new Error("PayPal no devolvió un identificador");
    if (!order.stockReserved) {
      try {
        await changeReservedStock(order, -1);
      } catch {
        response.status(409).json({ message: "Stock insuficiente para iniciar el pago" });
        return;
      }
      order.stockReserved = true;
      order.stockReservedAt = new Date();
    }
    payment.providerOrderId = paypalOrder.id;
    await order.save();
    response.status(201).json({ providerOrderId: paypalOrder.id });
  } catch (error) { next(error); }
});

router.post("/paypal/capture", requireAuth, async (request, response, next) => {
  try {
    const { orderId } = orderIdSchema.parse(request.body);
    const order = await Order.findOne({ _id: orderId, userId: request.auth!.sub });
    if (!order) { response.status(404).json({ message: "Pedido no encontrado" }); return; }
    await releaseExpiredReservation(order);
    const payment = order.payment!;
    if (order.paymentStatus === "CAPTURED") {
      response.json({ alreadyCaptured: true, captureId: payment.captureId, order });
      return;
    }
    if (!payment.providerOrderId) { response.status(409).json({ message: "La orden PayPal no existe" }); return; }
    const capture = await capturePayPalOrder(payment.providerOrderId);
    const purchaseUnit = capture.purchase_units?.[0];
    const captureRecord = purchaseUnit?.payments?.captures?.[0];
    const amountMatches = purchaseUnit?.amount?.value === order.total.toFixed(2) && purchaseUnit.amount.currency_code === order.currency;
    if (capture.status !== "COMPLETED" || captureRecord?.status !== "COMPLETED" || !amountMatches || !captureRecord.id) {
      if (order.stockReserved) {
        await changeReservedStock(order, 1);
        order.stockReserved = false;
        order.stockReservedAt = null;
      }
      order.paymentStatus = "FAILED";
      await order.save();
      response.status(422).json({ message: "No se pudo verificar el pago" });
      return;
    }
    order.paymentStatus = "CAPTURED";
    order.status = "PAID";
    order.stockReserved = false;
    order.stockReservedAt = null;
    payment.captureId = captureRecord.id;
    order.statusHistory.push({ status: "PAID", changedBy: request.auth!.sub });
    await order.save();
    const io = request.app.get("io") as Server | undefined;
    const summary = { id: order.id, status: order.status, total: order.total, createdAt: order.createdAt };
    io?.to("operations").emit("order:created", summary);
    io?.to(`user:${order.userId.toString()}`).emit("order:updated", summary);
    response.json({ captureId: captureRecord.id, order });
  } catch (error) { next(error); }
});

router.post("/paypal/cancel", requireAuth, async (request, response, next) => {
  try {
    const { orderId } = orderIdSchema.parse(request.body);
    const order = await Order.findOne({ _id: orderId, userId: request.auth!.sub });
    if (!order) { response.status(404).json({ message: "Pedido no encontrado" }); return; }
    const payment = order.payment!;
    if (order.paymentStatus === "CAPTURED") { response.status(409).json({ message: "No se puede cancelar un pago capturado" }); return; }
    if (order.stockReserved) {
      await changeReservedStock(order, 1);
      order.stockReserved = false;
      order.stockReservedAt = null;
    }
    payment.providerOrderId = "";
    order.paymentStatus = "CREATED";
    await order.save();
    response.json({ order });
  } catch (error) { next(error); }
});

export default router;
