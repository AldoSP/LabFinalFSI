import { createServer } from "node:http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { createApp } from "./app.js";
import { config } from "./config.js";

async function start() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("MongoDB connected");

  const app = createApp();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: config.CLIENT_ORIGIN, credentials: true },
  });
  app.set("io", io);
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (typeof token !== "string") throw new Error("Token requerido");
      const payload = jwt.verify(token, config.JWT_SECRET) as { sub: string; role: "customer" | "admin" };
      socket.data.auth = payload;
      next();
    } catch {
      next(new Error("No autorizado"));
    }
  });

  io.on("connection", (socket) => {
    const auth = socket.data.auth as { sub: string; role: "customer" | "admin" };
    void socket.join(auth.role === "admin" ? "operations" : `user:${auth.sub}`);
    socket.emit("connection:ready", { connected: true });
  });

  httpServer.listen(config.PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${config.PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error("Server failed to start", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
