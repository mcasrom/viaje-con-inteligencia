import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import QuickAccess from "@/components/QuickAccess";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viaje con Inteligencia | Mapa de Riesgos de Viaje MAEC - Riesgo Zero",
  description: "Tu guía completa de viajes seguros. Mapa interactivo de riesgos por país según MAEC español. Embajadas, requisitos, consejos, qué hacer y qué no hacer en cada destino. Viaja con inteligencia, viajanSeguro.",
  keywords: "viaje seguro, mapa de riesgos, MAEC, embajadas, requisitos viaje, travel risk, países riesgo, seguro viaje,外交部, risk assessment, travel advisory",
  authors: [{ name: "M.Castillo" }],
  creator: "M.Castillo",
  publisher: "Viaje con Inteligencia",
  manifest: '/manifest.json',
  openGraph: {
    title: "Viaje con Inteligencia | Riesgo Zero",
    description: "Mapa interactivo de riesgos de viaje por país. Información oficial MAEC. Embajadas, requisitos y consejos para viajar seguro.",
    url: "https://viaje-con-inteligencia.vercel.app",
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
    creator: "@mybloggingnotes",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="canonical" href="https://viaje-con-inteligencia.vercel.app" />
        <link rel="icon" href="/favicon.jpg" type="image/jpeg" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.jpg" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="thumbnail" content="/preview_favicon.jpg" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
<Providers>
          {children}
          <QuickAccess />
          <Footer />
          </Providers>
      </body>
    </html>
  );
}