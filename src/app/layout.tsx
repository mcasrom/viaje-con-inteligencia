import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import Providers from "@/components/Providers";
import TopBar from "@/components/TopBar";
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });
import { initPaisesData } from "@/lib/paises-init";
import { initRutasData } from "@/lib/rutas-init";
import { initClusteringData } from "@/lib/clustering-init";
import { initIndicesData } from "@/lib/indices-init";
import { initSeasonalityData } from "@/lib/seasonality-init";
import { initSegurosData } from "@/lib/seguros-init";
import { checkCronCatchup } from "@/lib/cron-catchup";

const QuickAccess = dynamic(() => import("@/components/QuickAccess"));
const AITravelAssistant = dynamic(() => import("@/components/AITravelAssistant"));
const SOSButton = dynamic(() => import("@/components/SOSButton"));
const ServiceWorkerRegistration = dynamic(() => import("@/components/ServiceWorkerRegistration"));
const InstallPWA = dynamic(() => import("@/components/InstallPWA"));
const Onboarding = dynamic(() => import("@/components/Onboarding"));
const InfografiaPopup = dynamic(() => import("@/components/InfografiaPopup"));

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.viajeinteligencia.com"),
  title: "Viaje con Inteligencia | Mapa de Riesgos de Viaje MAEC - Riesgo Zero",
  description: "Mapa interactivo de riesgos de viaje según MAEC. Consulta embajadas, requisitos y consejos de seguridad para viajar seguro a cualquier destino.",
  authors: [{ name: "M.Castillo" }],
  creator: "M.Castillo",
  publisher: "Viaje con Inteligencia",
  alternates: {
    canonical: 'https://www.viajeinteligencia.com',
  },
  openGraph: {
    title: "Viaje con Inteligencia | Riesgo Zero",
    description: "Mapa interactivo de riesgos de viaje por país. Información oficial MAEC. Embajadas, requisitos y consejos para viajar seguro.",
    url: "https://www.viajeinteligencia.com",
    siteName: "Viaje con Inteligencia",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/preview_favicon.jpg",
        width: 1200,
        height: 630,
        alt: "Viaje con Inteligencia - Mapa de Riesgos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viaje con Inteligencia | Riesgo Zero",
    description: "Mapa interactivo de riesgos de viaje por país según MAEC.",
    creator: "@ViajeIntel2026",
    images: ["/preview_favicon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "gn0Kmx84cnhJifWfqu-3E-zEIgOak4oVJw61ObNBqds",
  },
};

const BOT_PATTERNS = /bot|crawl|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|facebookexternalhit|twitterbot|whatsapp|telegram|semrush|ahrefs|majestic|archive|ia_archiver|curl|wget|python-requests/i;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isBot = BOT_PATTERNS.test(userAgent);

  Promise.all([
    initPaisesData(), 
    initRutasData(), 
    initClusteringData(), 
    initIndicesData(), 
    initSeasonalityData(), 
    initSegurosData(),
    checkCronCatchup(),
  ]).catch(() => {});
  
  return (
    <html lang="es">
      <head>
        <meta name="msvalidate.01" content="79B687F3E7391A245058BD02622B5D5D" />
        <link rel="icon" href="/logo.png" type="image/png" sizes="32x32" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ViajeIA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="application-name" content="ViajeIA" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="alternate" hrefLang="es" href="https://www.viajeinteligencia.com" />
        <link rel="alternate" hrefLang="en" href="https://www.viajeinteligencia.com/en" />
        <link rel="alternate" hrefLang="x-default" href="https://www.viajeinteligencia.com" />
        <link rel="sitemap" type="application/xml" href="https://www.viajeinteligencia.com/sitemap.xml" />
        <meta name="thumbnail" content="/preview_favicon.jpg" />
        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://tile.thunderforest.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://nczkvsnuafkwtmgokiuo.supabase.co" />
        <link rel="preload" as="image" href="/logo.webp" fetchPriority="high" />
        <style id="leaflet-critical">{`.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden}.leaflet-tile{position:absolute;width:256px;height:256px;max-width:none!important;pointer-events:none}.leaflet-tile-container{position:absolute;left:0;top:0}.leaflet-pane>svg{position:absolute;left:0;top:0}`}</style>
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          <TopBar />
          <ServiceWorkerRegistration />
          {!isBot && <Onboarding />}
          <div className="pt-12">{children}</div>
          <InstallPWA />
          <QuickAccess />
          <SOSButton />
          <InfografiaPopup />
          <AITravelAssistant />
          <Footer />
        </Providers>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=G-8JH6BXK1JG`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8JH6BXK1JG', { page_path: window.location.pathname });
        `}</Script>
      </body>
    </html>
  );
}
