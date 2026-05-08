'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring/debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md w-full bg-red-950/50 border border-red-800 rounded-lg p-6 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Algo salió mal</h1>
        </div>
        
        <p className="text-red-200/80 text-sm mb-6">
          Disculpa, ocurrió un error inesperado. Hemos registrado el problema y nuestro equipo será notificado.
        </p>
        
        {error.message && (
          <div className="bg-red-900/30 border border-red-700/50 rounded p-3 mb-6 text-xs text-red-200/70 font-mono break-words">
            {error.message}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition-colors text-center"
          >
            Inicio
          </a>
        </div>
      </div>
    </div>
  );
}
