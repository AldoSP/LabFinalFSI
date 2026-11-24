export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  format: "EPUB" | "PDF" | "MOBI";
  coverImageUrl: string;
}

export interface Session {
  token: string;
  user: { id: string; name: string; email: string; role: "customer" | "admin" };
}

export async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? "No se pudo completar la operación");
  return data as T;
}
