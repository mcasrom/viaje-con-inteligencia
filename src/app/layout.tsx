import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Providers from "@/components/Providers";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import QuickAccess from "@/components/QuickAccess";
import AITravelAssistant from "@/components/AITravelAssistant";
import SOSButton from "@/components/SOSButton";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallPWA from "@/components/InstallPWA";
import Onboarding from "@/components/Onboarding";
import { initPaisesData } from "@/lib/paises-init";
import { initRutasData } from "@/lib/rutas-init";
import { initClusteringData } from "@/lib/clustering-init";
import { initIndicesData } from "@/lib/indices-init";
import { initSeasonalityData } from "@/lib/seasonality-init";
import { initSegurosData } from "@/lib/seguros-init";

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
  description: "Tu guía completa de viajes seguros. Mapa interactivo de riesgos por país según MAEC español. Embajadas, requisitos, consejos, qué hacer y qué no hacer en cada destino. Viaja con inteligencia, viaja seguro.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await Promise.all([initPaisesData(), initRutasData(), initClusteringData(), initIndicesData(), initSeasonalityData(), initSegurosData()]);
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
      </head>
      <body className={`${geistSans.variable} antialiased`}>
<Analytics />
        <SpeedInsights />
<Providers>
          <TopBar />
          <ServiceWorkerRegistration />
          <Onboarding />
          <div className="pt-12">{children}</div>
          <InstallPWA />
          <QuickAccess />
          <SOSButton />
          <AITravelAssistant />
          <Footer />
          </Providers>
      </body>
    </html>
  );
}
