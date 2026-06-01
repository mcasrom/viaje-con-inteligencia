import { Globe, Bell } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const HeroSearch = dynamic(() => import('@/components/HeroSearch'), { ssr: true });
const HomeBelowFold = dynamic(() => import('@/components/HomeBelowFold'), { ssr: true });

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero section — server-rendered for instant LCP */}
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-2 leading-tight">
            ¿Es seguro viajar a...?
          </h1>
          <p className="text-slate-300 text-base md:text-lg text-center mb-6">
            Riesgo país en tiempo real + alertas OSINT + fuentes oficiales.
          </p>

          <HeroSearch />

          <div className="flex items-center justify-center gap-3 mt-5">
            <Link
              href="#mapa-global"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all text-sm font-medium border border-white/10"
            >
              <Globe className="w-4 h-4" />
              Ver mapa global
            </Link>
            <Link
              href="/alertas"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all text-sm font-medium shadow-lg shadow-blue-600/30"
            >
              <Bell className="w-4 h-4" />
              Recibir alertas gratis
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive content — client-side hydration */}
      <HomeBelowFold />
    </div>
  );
}
