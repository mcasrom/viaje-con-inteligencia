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

      {/* CTA registro */}
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-y border-white/5">
        <p className="text-white text-sm md:text-base font-medium mb-3 text-center">
          🎯 Accede a análisis premium, alertas personalizadas y 107 países — <span className="text-blue-400">7 días gratis sin tarjeta</span>
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <a href="/free-trial" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/30">
            Crear cuenta gratis →
          </a>
          <a href="https://t.me/ViajeConInteligencia" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm transition-all border border-white/10">
            ✈️ Telegram
          </a>
          <a href="https://x.com/ViajeIntel2026" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm transition-all border border-white/10">
            𝕏 Twitter
          </a>
          <a href="https://bsky.app/profile/viajeinteligencia.bsky.social" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm transition-all border border-white/10">
            🦋 Bluesky
          </a>
        </div>
      </div>
      {/* Interactive content — client-side hydration */}
      <HomeBelowFold />
    </div>
  );
}
