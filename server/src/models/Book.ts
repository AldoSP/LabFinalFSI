import { Schema, model, type InferSchemaType } from "mongoose";

const bookSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  author: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 3000 },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0.01 },
  stock: { type: Number, required: true, min: 0, validate: Number.isInteger },
  format: { type: String, enum: ["EPUB", "PDF", "MOBI"], required: true },
  coverImageUrl: { type: String, required: true },
  available: { type: Boolean, default: true },
  fulfillmentMode: { type: String, enum: ["digital"], default: "digital" },
}, { timestamps: true });

export type BookDocument = InferSchemaType<typeof bookSchema>;
export const Book = model("Book", bookSchema);
