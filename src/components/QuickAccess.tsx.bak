'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoginButton from './LoginButton';

function QuickAccessInner() {
  const [showPanel, setShowPanel] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urgent = searchParams.get('leaving');
    if (urgent) {
      setShowPanel(true);
    }
  }, [searchParams]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end gap-3">
      <div className="bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700 w-72 mb-16 mr-2" style={{ display: showPanel ? 'block' : 'none' }}>
        <h3 className="text-white font-bold mb-3">⚡ Acceso Rápido</h3>
        <div className="space-y-2">
          <Link 
            href="/comparar" 
            className="block p-2 bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30"
          >
            ⚖️ Comparar países
          </Link>
          <Link 
            href="/checklist" 
            className="block p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30"
          >
            📋 Checklist viaje
          </Link>
          <Link 
            href="/relojes" 
            className="block p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30"
          >
            🌍 Relojes mundiales
          </Link>
          <Link 
            href="/blog" 
            className="block p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30"
          >
            📖 Blog recomendaciones
          </Link>
          <Link 
            href="https://t.me/ViajeConInteligenciaBot" 
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30"
          >
            🤖 Bot Telegram
          </Link>
          <Link 
            href="/premium"
            className="block p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30"
          >
            💬 Chat IA
          </Link>
          <Link 
            href="/kpi"
            className="block p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30"
          >
            🛡️ Índice de Paz
          </Link>
          <Link 
            href="/dashboard"
            className="block p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
          >
            📊 Mi Dashboard
          </Link>
          <div className="pt-2 mt-2 border-t border-slate-600">
            <p className="text-slate-500 text-xs">Próximamente:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded">🎲 Destino aleatorio</span>
              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded">✈️ Vuelos</span>
              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded">📄 Check visa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <LoginButton variant="icon" />
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black p-4 rounded-full shadow-lg transition-colors"
          title="Accesos rápidos"
        >
          <span className="text-2xl">⚡</span>
        </button>
      </div>
    </div>
  );
}

export default function QuickAccess() {
  return (
    <Suspense fallback={null}>
      <QuickAccessInner />
    </Suspense>
  );
}