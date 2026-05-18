'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

const TestMap = dynamic(() => import('./TestMap'), { ssr: false });

export default function TestLeafletPage() {
  const [swStatus, setSwStatus] = useState<string>('');

  const resetSW = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
      setSwStatus(`SW desregistrados: ${registrations.length}. Recargando...`);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setSwStatus('No hay Service Worker en este navegador');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-xl">Leaflet Test</h1>
        <button
          onClick={resetSW}
          className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Reset SW & Reload
        </button>
      </div>
      {swStatus && <div className="text-xs text-amber-400 mb-2">{swStatus}</div>}
      <TestMap />
    </div>
  );
}
