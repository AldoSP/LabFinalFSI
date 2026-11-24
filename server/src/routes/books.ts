import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Book } from "../models/Book.js";

const router = Router();
const bookSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(120),
  description: z.string().min(1).max(3000),
  category: z.string().min(1).max(80),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  format: z.enum(["EPUB", "PDF", "MOBI"]),
  coverImageUrl: z.url(),
  available: z.boolean().default(true),
});

router.get("/", async (request, response, next) => {
  try {
    const category = typeof request.query.category === "string" ? request.query.category : undefined;
    const search = typeof request.query.search === "string" ? request.query.search.trim() : "";
    const query: Record<string, unknown> = { available: true, stock: { $gt: 0 } };
    if (category) query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
    ];
    response.json(await Book.find(query).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get("/admin/all", requireAuth, requireRole("admin"), async (_request, response, next) => {
  try {
    response.json(await Book.find().sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get("/:id", async (request, response, next) => {
  try {
    const book = await Book.findOne({ _id: request.params.id, available: true, stock: { $gt: 0 } });
    if (!book) { response.status(404).json({ message: "Libro no encontrado" }); return; }
    response.json(book);
  } catch (error) { next(error); }
});

router.post("/admin", requireAuth, requireRole("admin"), async (request, response, next) => {
  try {
    const book = await Book.create(bookSchema.parse(request.body));
    response.status(201).json(book);
  } catch (error) { next(error); }
});

router.patch("/admin/:id", requireAuth, requireRole("admin"), async (request, response, next) => {
  try {
    const update = bookSchema.partial().parse(request.body);
    const book = await Book.findByIdAndUpdate(request.params.id, update, { new: true, runValidators: true });
    if (!book) { response.status(404).json({ message: "Libro no encontrado" }); return; }
    response.json(book);
  } catch (error) { next(error); }
});

router.delete("/admin/:id", requireAuth, requireRole("admin"), async (request, response, next) => {
  try {
    const book = await Book.findByIdAndUpdate(request.params.id, { available: false }, { new: true });
    if (!book) { response.status(404).json({ message: "Libro no encontrado" }); return; }
    response.status(204).send();
  } catch (error) { next(error); }
});

export default router;
