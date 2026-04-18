import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const manifest = {
    name: "Viaje con Inteligencia",
    short_name: "Viaje IA",
    description: "Mapa de riesgos de viaje por país - MAEC",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
        purpose: "maskable any"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      }
    ],
    categories: ["travel", "navigation"],
    lang: "es",
    scope: "/",
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
        name: "Relojes Mundiales",
        url: "/relojes"
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