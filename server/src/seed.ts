import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { config } from "./config.js";
import { Book } from "./models/Book.js";
import { User } from "./models/User.js";

const demoBooks = [
  { title: "Las ciudades invisibles", author: "Ítalo Calvino", description: "Viajes, memoria y ciudades que existen entre las palabras.", category: "Ficción", price: 12.9, stock: 20, format: "EPUB", coverImageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=85" },
  { title: "El diseño de lo cotidiano", author: "Don Norman", description: "Principios claros para crear objetos y experiencias comprensibles.", category: "Diseño", price: 18.5, stock: 15, format: "PDF", coverImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=700&q=85" },
  { title: "Software limpio", author: "Robert C. Martin", description: "Prácticas para construir sistemas mantenibles y profesionales.", category: "Tecnología", price: 24, stock: 12, format: "EPUB", coverImageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=700&q=85" },
  { title: "Una habitación propia", author: "Virginia Woolf", description: "Un ensayo fundamental sobre literatura, autonomía y creación.", category: "Ensayo", price: 9.8, stock: 25, format: "MOBI", coverImageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=85" },
] as const;

async function seed() {
  await mongoose.connect(config.MONGODB_URI);
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Define SEED_ADMIN_EMAIL y una SEED_ADMIN_PASSWORD de al menos 12 caracteres");
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate({ email }, { name: "Administrador Lectora", email, passwordHash, role: "admin" }, { upsert: true, new: true });
  if (await Book.countDocuments() === 0) await Book.insertMany(demoBooks);
  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Seed failed");
  process.exitCode = 1;
});
