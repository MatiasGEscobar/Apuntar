import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

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
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111111',
              color: '#e8e8e8',
              border: '1px solid #333333',
              borderRadius: '0',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '14px',
              letterSpacing: '0.05em',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#c9a227', secondary: '#0a0a0a' },
              style: {
                background: '#111111',
                border: '1px solid #c9a227',
                borderLeft: '3px solid #c9a227',
              },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0a0a' },
              style: {
                background: '#111111',
                border: '1px solid #7f1d1d',
                borderLeft: '3px solid #ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}