import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "El Compañero — Wuju",
    short_name: "Compañero",
    description:
      "Tu asistente libre, con la cara y voz que elegís. Chat con voz, Guardián de código y marketplace.",
    start_url: "/companion",
    scope: "/",
    display: "standalone",
    background_color: "#F7FAFC",
    theme_color: "#1A365D",
    lang: "es",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
