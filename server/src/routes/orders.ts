import { Router } from "express";
import mongoose from "mongoose";
import type { Server } from "socket.io";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Book } from "../models/Book.js";
import { Order } from "../models/Order.js";
import { canTransition } from "../services/orderState.js";

const router = Router();
const createOrderSchema = z.object({
  items: z.array(z.object({
    bookId: z.string().min(1),
    quantity: z.number().int().positive("La cantidad debe ser al menos 1").max(10, "La cantidad máxima por título es 10"),
  })).min(1).max(30),
  delivery: z.object({
    email: z.string().trim().pipe(z.email()),
    country: z.string().trim().min(2).max(80),
    notes: z.string().trim().max(500).optional().default(""),
  }),
});

router.post("/", requireAuth, async (request, response, next) => {
  try {
    const input = createOrderSchema.parse(request.body);
    const uniqueIds = [...new Set(input.items.map((item) => item.bookId))];
    if (uniqueIds.length !== input.items.length) {
      response.status(400).json({ message: "Cada libro debe aparecer una sola vez" });
      return;
    }
    const books = await Book.find({ _id: { $in: uniqueIds }, available: true });
    if (books.length !== uniqueIds.length) {
      response.status(400).json({ message: "Uno o más libros no están disponibles" });
      return;
    }
    const items = input.items.map((item) => {
      const book = books.find((candidate) => candidate.id === item.bookId);
      if (!book || book.stock < item.quantity) throw new Error("STOCK_INSUFFICIENT");
      return { bookId: book._id, title: book.title, author: book.author, unitPrice: book.price, quantity: item.quantity };
    });
    const total = Number(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2));
    const order = await Order.create({
      userId: request.auth!.sub,
      items,
      delivery: input.delivery,
      total,
      currency: "USD",
      status: "PENDING_PAYMENT",
      paymentStatus: "CREATED",
      stockReserved: false,
      payment: { provider: "paypal", idempotencyKey: `order:${new mongoose.Types.ObjectId()}` },
    });
    response.status(201).json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_INSUFFICIENT") {
      response.status(409).json({ message: "Stock insuficiente" });
      return;
    }
    next(error);
  }
});

router.get("/me", requireAuth, async (request, response, next) => {
  try {
    response.json(await Order.find({ userId: request.auth!.sub }).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get("/", requireAuth, requireRole("admin"), async (_request, response, next) => {
  try {
    response.json(await Order.find().populate("userId", "name email").sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get("/:id", requireAuth, async (request, response, next) => {
  try {
    const order = await Order.findOne({ _id: request.params.id, userId: request.auth!.sub });
    if (!order) { response.status(404).json({ message: "Pedido no encontrado" }); return; }
    response.json(order);
  } catch (error) { next(error); }
});

router.patch("/:id/status", requireAuth, requireRole("admin"), async (request, response, next) => {
  try {
    const target = z.object({ status: z.enum(["PAID", "PROCESSING", "READY_FOR_DELIVERY", "DELIVERED_DIGITALLY", "DELIVERED"]) }).parse(request.body).status;
    const order = await Order.findById(request.params.id);
    if (!order) { response.status(404).json({ message: "Pedido no encontrado" }); return; }
    if (!canTransition(order.status, target)) {
      response.status(409).json({ message: `Transición inválida: ${order.status} -> ${target}` });
      return;
    }
    if (order.paymentStatus !== "CAPTURED") {
      response.status(409).json({ message: "El pago no ha sido capturado" });
      return;
    }
    order.status = target;
    order.statusHistory.push({ status: target, changedBy: request.auth!.sub });
    await order.save();
    const io = request.app.get("io") as Server | undefined;
    const summary = { id: order.id, status: order.status, total: order.total, updatedAt: new Date() };
    io?.to(`user:${order.userId.toString()}`).emit("order:updated", summary);
    io?.to("operations").emit("order:updated", summary);
    response.json(order);
  } catch (error) { next(error); }
});

export default router;
