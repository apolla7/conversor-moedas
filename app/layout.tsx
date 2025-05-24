// app/layout.tsx
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"; // 1. Import SpeedInsights
import "./globals.css"; // Make sure this file exists for Tailwind CSS

export const metadata: Metadata = {
  title: "Calculadora de Conversão de Moeda",
  description:
    "Converta compras em moeda estrangeira para BRL utilizando a cotação PTAX, spread bancário e IOF.",
  icons: {
    icon: "/favicon.ico", // Place your favicon.ico in the 'public' folder or 'app' folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* Set appropriate language */}
      <body>
        {children}
        <SpeedInsights /> {/* 2. Add the SpeedInsights component here */}
      </body>
    </html>
  );
}
