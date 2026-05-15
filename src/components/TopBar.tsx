'use client';

import Link from 'next/link';
import LanguageSelector from './LanguageSelector';

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
          <img src="/logo.png" alt="Viaje con Inteligencia" className="w-6 h-6 rounded" />
          <span className="text-sm font-bold hidden sm:inline">Viaje con Inteligencia</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://t.me/ViajeConInteligenciaBot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors text-xs"
            title="Bot Telegram"
          >
            🤖
          </a>
          <Link href="/premium" className="text-slate-400 hover:text-white transition-colors text-xs" title="Premium">
            ⭐
          </Link>
          <Link href="/dashboard/radar" className="text-slate-400 hover:text-blue-400 transition-colors text-xs font-medium" title="Mi Radar de Viaje">
            Radar
          </Link>
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
}
