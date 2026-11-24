import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface AuthPayload {
  sub: string;
  role: "customer" | "admin";
}

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    response.status(401).json({ message: "Autenticación requerida" });
    return;
  }

  try {
    request.auth = jwt.verify(token, config.JWT_SECRET) as AuthPayload;
    next();
  } catch {
    response.status(401).json({ message: "Sesión inválida o expirada" });
  }
}

export function requireRole(role: AuthPayload["role"]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (request.auth?.role !== role) {
      response.status(403).json({ message: "No autorizado" });
      return;
    }
    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}
