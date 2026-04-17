import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viaje con Inteligencia | Mapa de Riesgos de Viaje MAEC - Riesgo Zero",
  description: "Tu guía completa de viajes seguros. Mapa interactivo de riesgos por país según MAEC español. Embajadas, requisitos, consejos, qué hacer y qué no hacer en cada destino. Viaja con inteligencia, viaja seguro.",
  keywords: "viaje seguro, mapa de riesgos, MAEC, embajadas, requisitos viaje, travel risk, países riesgo, seguro viaje,外交部, risk assessment, travel advisory",
  authors: [{ name: "M.Castillo" }],
  creator: "M.Castillo",
  publisher: "Viaje con Inteligencia",
  openGraph: {
    title: "Viaje con Inteligencia | Riesgo Zero",
    description: "Mapa de riesgos de viaje por país. Información oficial MAEC. Embajadas, requisitos y consejos para viajar seguro.",
    url: "https://viaje-con-inteligencia.vercel.app",
    siteName: "Viaje con Inteligencia",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Viaje con Inteligencia - Mapa de Riesgos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viaje con Inteligencia | Riesgo Zero",
    description: "Mapa de riesgos de viaje por país según MAEC.",
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
    google: "google-site-verification-code",
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
        {children}
        <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Viaje con Inteligencia</h3>
                <p className="text-slate-400 text-sm">
                  Tu guía de viajes seguros. Mapa de riesgos según MAEC español.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Navegación</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Mapa Mundial</Link></li>
                  <li><Link href="/checklist" className="text-slate-400 hover:text-white transition-colors">Checklist</Link></li>
                  <li><Link href="/premium" className="text-slate-400 hover:text-white transition-colors">Premium</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/metodologia" className="text-slate-400 hover:text-white transition-colors">Metodología MAEC</Link></li>
                  <li><Link href="/legal" className="text-slate-400 hover:text-white transition-colors">Aviso Legal</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Contacto</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="mailto:mybloggingnotes@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                      mybloggingnotes@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="https://t.me/ViajeConInteligenciaBot" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                      @ViajeConInteligenciaBot
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} <strong className="text-slate-400">M.Castillo</strong> - Viaje con Inteligencia
                </p>
                <p className="text-slate-600 text-xs text-center md:text-right max-w-xl">
                  Datos basados en información oficial del MAEC. La información es orientativa. 
                  Verifique siempre con las autoridades competentes.
                </p>
              </div>
            </div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
