'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Error en página pais:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-lg border border-red-500/50">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Algo salió mal</h2>
        <p className="text-slate-300 mb-4">
          Ha ocurrido un error al cargar la página del país.
        </p>
        <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-400 font-mono">
            {error.message || 'Error desconocido'}
          </p>
        </div>
        <button
          onClick={reset}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}