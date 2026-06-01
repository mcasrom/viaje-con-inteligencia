'use client';

import Link from 'next/link';
import LanguageSelector from './LanguageSelector';

// Iconos SVG inline — sin dependencias extra
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconYouTube = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const IconTelegram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">

        {/* Logo + nombre */}
        <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
          <img src="/logo.webp" alt="Viaje con Inteligencia" width="24" height="24" className="w-6 h-6 rounded" fetchPriority="high" />
          <span className="text-sm font-bold hidden sm:inline">Viaje con Inteligencia</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">

          {/* RRSS */}
          <a
            href="https://x.com/ViajeIntel2026"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Twitter / X"
            aria-label="Síguenos en X"
          >
            <IconX />
          </a>
          <a
            href="https://www.youtube.com/@coneldronenlamochila_es"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
            title="YouTube"
            aria-label="Canal de YouTube"
          >
            <IconYouTube />
          </a>
          <a
            href="https://t.me/ViajeConInteligenciaBot"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-sky-400 transition-colors"
            title="Bot Telegram"
            aria-label="Bot de Telegram"
          >
            <IconTelegram />
          </a>

          {/* Separador */}
          <span className="w-px h-4 bg-slate-700 mx-1 hidden sm:block" />

          {/* Nav links */}
          <Link
            href="/newsletter"
            className="text-slate-400 hover:text-blue-400 transition-colors text-xs font-medium px-1"
            title="Newsletter Semanal"
          >
            Newsletter
          </Link>
          <Link
            href="/dashboard/radar"
            className="text-slate-400 hover:text-blue-400 transition-colors text-xs font-medium px-1"
            title="Mi Radar de Viaje"
          >
            Radar
          </Link>

          {/* Separador */}
          <span className="w-px h-4 bg-slate-700 mx-1 hidden sm:block" />

          {/* CTA trial — el más importante */}
          <Link
            href="/free-trial"
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full hover:from-yellow-400 hover:to-orange-400 transition-all shadow-sm shadow-yellow-500/20"
            title="7 días gratis sin tarjeta"
          >
            <span>⭐</span>
            <span className="hidden sm:inline">7 días gratis</span>
            <span className="sm:hidden">Premium</span>
          </Link>

          <LanguageSelector />
        </div>
      </div>
    </div>
  );
}
