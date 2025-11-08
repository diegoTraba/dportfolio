import type { Metadata } from "next";
import "./globals.css";
import { TemaProvider } from "@/contexts/TemaContext";

export const metadata: Metadata = {
  title: "DPortfolio",
  description: "Gestiona tus inversiones en criptomonedas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-custom-background text-custom-foreground transition-colors duration-300">
        <TemaProvider>{children}</TemaProvider>
      </body>
    </html>
  );
}
