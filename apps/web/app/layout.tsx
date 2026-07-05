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
  title: "El Compañero — Tu asistente libre, con cara y voz",
  description:
    "Un compañero libre. La cara y voz que vos elijas. Para el trabajo que sea.",
  openGraph: {
    title: "El Compañero — Tu asistente libre, con cara y voz",
    description:
      "Un compañero libre. La cara y voz que vos elijas. Para el trabajo que sea.",
    images: ["/parts/placeholder.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "El Compañero — Tu asistente libre, con cara y voz",
    description:
      "Un compañero libre. La cara y voz que vos elijas. Para el trabajo que sea.",
    images: ["/parts/placeholder.png"],
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
