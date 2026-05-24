import { Globe, Bell } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import HeroSearch from '@/components/HeroSearch';
import HomeBelowFold from '@/components/HomeBelowFold';

export const metadata: Metadata = {
  title: 'Travel Smart | MAEC Travel Risk Map - Risk Zero',
  description: 'Your complete guide to safe travel. Interactive travel risk map by country according to Spanish MAEC. Embassies, requirements, tips.',
  authors: [{ name: 'M.Castillo' }],
  creator: 'M.Castillo',
  publisher: 'Viaje con Inteligencia',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/en',
  },
  openGraph: {
    title: 'Travel Smart | MAEC Travel Risk Map - Risk Zero',
    description: 'Interactive travel risk map by country. Official MAEC data, embassy contacts, visa requirements, and safety recommendations for every destination.',
    url: 'https://www.viajeinteligencia.com/en',
    siteName: 'Viaje con Inteligencia',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/preview_favicon.jpg',
        width: 1200,
        height: 630,
        alt: 'Viaje con Inteligencia - Travel Risk Map',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Smart | MAEC Travel Risk Map - Risk Zero',
    description: 'Interactive travel risk map by country. Official MAEC data, embassy contacts, and safety recommendations.',
    creator: '@ViajeIntel2026',
    images: ['/preview_favicon.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomeEN() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero section — server-rendered, English */}
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-2 leading-tight">
            Is it safe to travel to...?
          </h1>
          <p className="text-slate-300 text-base md:text-lg text-center mb-6">
            Real-time country risk + OSINT alerts + official sources.
          </p>

          <HeroSearch />

          <div className="flex items-center justify-center gap-3 mt-5">
            <Link
              href="#mapa-global"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium border border-white/10"
            >
              <Globe className="w-4 h-4" />
              View global map
            </Link>
            <Link
              href="/alertas"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all text-sm font-medium shadow-lg shadow-blue-600/30"
            >
              <Bell className="w-4 h-4" />
              Get free alerts
            </Link>
          </div>
        </div>
      </div>

      <HomeBelowFold />
    </div>
  );
}
