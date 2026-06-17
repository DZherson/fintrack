import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinTrack — Gestión de finanzas personales",
  description:
    "Toma el control de tus finanzas personales. Registra, categoriza y visualiza tus gastos e ingresos en un dashboard limpio e intuitivo.",
  keywords: ["finanzas personales", "presupuesto", "gastos", "ahorros", "dashboard"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
