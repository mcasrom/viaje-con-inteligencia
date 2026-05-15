'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';

const SEEN_KEY = 'slogan-seen';

export default function SloganPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(SEEN_KEY, '1');
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 text-slate-500 hover:text-white transition-colors p-1"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>

          <h2 className="text-white text-lg sm:text-xl font-bold leading-snug mb-3">
            Viaje con Inteligencia
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Tu radar de seguridad global impulsado por IA.
          </p>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            Datos oficiales MAEC, análisis ML y herramientas inteligentes para viajar informado y seguro.
          </p>

          <button
            onClick={dismiss}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm"
          >
            Explorar destino
          </button>
        </div>
      </div>
    </div>
  );
}
