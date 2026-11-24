"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api, type Session } from "@/lib/api";

export function AuthDialog({ open, onClose, onAuthenticated }: { open: boolean; onClose: () => void; onAuthenticated: (session: Session) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  async function submit(formData: FormData) {
    setBusy(true); setError("");
    try {
      const payload = Object.fromEntries(formData.entries());
      if (mode === "register") await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
      const session = await api<Session>("/api/auth/login", { method: "POST", body: JSON.stringify({ email: payload.email, password: payload.password }) });
      onAuthenticated(session);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo acceder"); }
    finally { setBusy(false); }
  }

  return <div className="backdrop"><section className="dialog"><button className="close" onClick={onClose} title="Cerrar"><X size={19} /></button><p className="eyebrow">TU BIBLIOTECA DIGITAL</p><h2>{mode === "login" ? "Volver a Lectora" : "Crear una cuenta"}</h2><form action={submit}>{mode === "register" && <label>Nombre<input name="name" required minLength={2} /></label>}<label>Correo<input type="email" name="email" required /></label><label>Contraseña<input type="password" name="password" required minLength={8} /></label>{error && <p className="form-error">{error}</p>}<button className="submit" disabled={busy}>{busy ? "Procesando…" : mode === "login" ? "Ingresar" : "Crear cuenta e ingresar"}</button></form><button className="text-action" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "¿Primera visita? Crea una cuenta" : "¿Ya tienes cuenta? Inicia sesión"}</button></section></div>;
}
