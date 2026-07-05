import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "Workshop de Personajes",
  description: "MVP de personajes guardables en perfil y autocontenidos"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
