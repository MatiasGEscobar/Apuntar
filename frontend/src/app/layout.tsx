import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apuntar Academia",
  description: "Plataforma de comercio legal de armas regulada por RENAR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#e8e8e8]">
        {children}
      </body>
    </html>
  );
}