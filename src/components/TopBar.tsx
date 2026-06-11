'use client';
import Link from 'next/link';
import LanguageSelector from './LanguageSelector';
import { Globe, Newspaper, Bell, Sparkles } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors shrink-0">
          <img src="/logo.webp" alt="Viaje con Inteligencia" width="24" height="24" className="w-6 h-6 rounded" fetchPriority="high" />
          <span className="text-sm font-bold hidden sm:inline">Viaje con Inteligencia</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link href="/decidir" className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />Decidir
          </Link>
          <Link href="/mapa" className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-xs font-medium">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />Mapa
          </Link>
          <Link href="/blog" className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-xs font-medium">
            <Newspaper className="w-3.5 h-3.5 text-cyan-400" />Blog
          </Link>
          <Link href="/alertas" className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-xs font-medium relative">
            <Bell className="w-3.5 h-3.5 text-amber-400" />Alertas
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </Link>
          <Link href="/itinerarios/espana" className="flex items-center gap-1 px-3 py-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all text-xs font-medium">
            🇪🇸 España
          </Link>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a href="https://t.me/ViajeConInteligenciaBot" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-xs" title="Bot Telegram">🤖</a>
          <Link href="/premium" className="text-slate-400 hover:text-white transition-colors text-xs" title="Premium">⭐</Link>
          <Link href="/newsletter" className="text-slate-400 hover:text-blue-400 transition-colors text-xs font-medium hidden sm:inline">Newsletter</Link>
          <Link href="/dashboard/radar" className="text-slate-400 hover:text-blue-400 transition-colors text-xs font-medium hidden sm:inline">Radar</Link>
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
}
