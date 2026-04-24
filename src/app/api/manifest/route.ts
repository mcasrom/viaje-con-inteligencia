import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const manifest = {
    name: "Viaje con Inteligencia",
    short_name: "Viaje IA",
    description: "Mapa interactivo de riesgos de viaje - Información oficial MAEC español",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    categories: ["travel", "navigation", "weather"],
    lang: "es",
    scope: "/",
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Buscar País",
        url: "/?search=1"
      },
      {
        name: "Blog",
        url: "/blog"
      },
      {
        name: "Alertas",
        url: "/alertas"
      },
      {
        name: "Relojes Mundiales",
        url: "/relojes"
      },
      {
        name: "Premium",
        url: "/premium"
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'Content-Type': 'application/manifest+json',
    },
  });
}