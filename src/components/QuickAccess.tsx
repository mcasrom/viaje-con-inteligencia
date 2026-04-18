'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function QuickAccessInner() {
  const [showPanel, setShowPanel] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urgent = searchParams.get('leaving');
    const random = searchParams.get('random');
    const flights = searchParams.get('flights');
    
    if (urgent || random || flights) {
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
        <div className="absolute bottom-16 right-0 bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700 w-64">
          <h3 className="text-white font-bold mb-3">⚡ Acceso Rápido</h3>
          <div className="space-y-2">
            <Link 
              href="/?leaving=1" 
              className="block p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
            >
              🚨 Me voy AHORA
            </Link>
            <Link 
              href="/?random=1" 
              className="block p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30"
            >
              🎲 Destino aleatorio
            </Link>
            <Link 
              href="/flights" 
              className="block p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30"
            >
              ✈️ Vuelos baratos
            </Link>
            <Link 
              href="/?visa=check" 
              className="block p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30"
            >
              📄 Check visa
            </Link>
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