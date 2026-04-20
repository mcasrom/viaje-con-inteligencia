'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Bell, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(true);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_seen');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
      setIsClosed(false);
    }
  }, []);

  const handleClose = () => {
    setIsClosed(true);
    setIsVisible(false);
    localStorage.setItem('onboarding_seen', 'true');
  };

  if (!isVisible || isClosed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌍</span>
          </div>
          <h2 className="text-2xl font-bold text-white">¡Bienvenido a Viaje con Inteligencia!</h2>
          <p className="text-slate-400 mt-2">Tu guía de viajes seguros</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-4 p-3 bg-slate-700/50 rounded-xl">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Mapa de Riesgos</h3>
              <p className="text-slate-400 text-sm">Consulta el nivel de riesgo de cada país según el MAEC español</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-slate-700/50 rounded-xl">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Alertas en Tiempo Real</h3>
              <p className="text-slate-400 text-sm">Recibe notificaciones sobre cambios de riesgo y recomendaciones</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-slate-700/50 rounded-xl">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Favoritos y Checklist</h3>
              <p className="text-slate-400 text-sm">Guarda países y descarga tu checklist de viaje</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/checklist"
            onClick={handleClose}
            className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors text-center"
          >
            Ver Checklist
          </Link>
          <Link
            href="/"
            onClick={handleClose}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Explorar Mapa <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Este mensaje solo aparecerá una vez
        </p>
      </div>
    </div>
  );
}