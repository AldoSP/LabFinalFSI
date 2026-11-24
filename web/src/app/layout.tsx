import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import { StoreProvider } from "@/components/StoreProvider";
import "./globals.css";

const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Lectora | Librería digital",
  description: "Una tienda completa de libros electrónicos con checkout seguro y entrega digital.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${display.variable} ${mono.variable}`}><StoreProvider>{children}</StoreProvider></body></html>;
}
