import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import { config } from "./config.js";
import authRouter from "./routes/auth.js";
import booksRouter from "./routes/books.js";
import ordersRouter from "./routes/orders.js";
import paymentsRouter from "./routes/payments.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/books", booksRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/payments", paymentsRouter);

  app.use((_request, response) => {
    response.status(404).json({ message: "Ruta no encontrada" });
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({ message: "Datos inválidos", issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) });
      return;
    }
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      response.status(409).json({ message: "El recurso ya existe" });
      return;
    }
    const isProduction = config.NODE_ENV === "production";
    console.error("Unhandled server error", isProduction ? undefined : error);
    response.status(500).json({ message: "Error interno del servidor" });
  });

  return app;
}
