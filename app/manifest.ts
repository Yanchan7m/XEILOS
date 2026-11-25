import type { MetadataRoute } from "next";

// L'app XEILOS installable sur l'écran d'accueil (indispensable pour le push sur iPhone, iOS 16.4+).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Xeilos · Ton coach trading IA",
    short_name: "Xeilos",
    description: "Ton tableau de bord trading, ta tutrice IA et tes rappels de scalping.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b0d",
    theme_color: "#0b0b0d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
