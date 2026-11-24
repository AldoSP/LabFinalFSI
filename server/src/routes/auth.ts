import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { User } from "../models/User.js";

const router = Router();
const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().pipe(z.email()).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});
const loginSchema = z.object({ email: z.string().trim().pipe(z.email()), password: z.string().min(1) });

router.post("/register", async (request, response, next) => {
  try {
    const input = registerSchema.parse(request.body);
    const exists = await User.exists({ email: input.email });
    if (exists) {
      response.status(409).json({ message: "No se pudo completar el registro" });
      return;
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({ name: input.name, email: input.email, passwordHash, role: "customer" });
    response.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");
    const valid = user && await bcrypt.compare(input.password, user.passwordHash);
    if (!valid || !user) {
      response.status(401).json({ message: "Credenciales inválidas" });
      return;
    }
    const token = jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: "8h" });
    response.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

export default router;
