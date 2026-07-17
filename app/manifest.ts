import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NY Trip Planner",
    short_name: "NY Trip",
    description: "Itinerario personal para el viaje a Nueva York, 24 ago – 2 sep 2026",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#21262C",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
