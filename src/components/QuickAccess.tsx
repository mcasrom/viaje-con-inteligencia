'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-yellow-500 hover:bg-yellow-400 text-black p-4 rounded-full shadow-lg transition-colors"
        title="Accesos rápidos"
      >
        <span className="text-2xl">⚡</span>
      </button>

      {showPanel && (
        <div className="absolute bottom-16 right-0 bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700 w-72">
          <h3 className="text-white font-bold mb-3">⚡ Acceso Rápido</h3>
          <div className="space-y-2">
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
      )}
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