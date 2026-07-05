import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "@/components/Providers";
import "./globals.css";

function getMetadataBase() {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Wuju Companion - Tu asistente de IA",
  description:
    "Wuju Companion da vida a la IA en tu escritorio. Te ayuda a programar y crece contigo.",
  openGraph: {
    title: "Wuju Companion - Tu asistente de IA",
    description:
      "Wuju Companion da vida a la IA en tu escritorio. Te ayuda a programar y crece contigo.",
    images: ["/brand/hero-inicio.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wuju Companion - Tu asistente de IA",
    description:
      "Wuju Companion da vida a la IA en tu escritorio. Te ayuda a programar y crece contigo.",
    images: ["/brand/hero-inicio.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
