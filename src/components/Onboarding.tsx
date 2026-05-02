'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Route, Heart, Star, ArrowRight, ArrowLeft, Sparkles, Shield, Compass, UserCheck } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    icon: <Shield className="w-6 h-6" />,
    emoji: '🌍',
    title: '¡Bienvenido a Viaje con Inteligencia!',
    subtitle: 'Tu asistente de viajes seguro con IA',
    description: 'Analizamos riesgos en tiempo real, planificamos rutas con IA y te mantenemos informado para que viajes con confianza.',
    color: 'from-blue-500 to-cyan-600',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: <Compass className="w-6 h-6" />,
    emoji: '🗺️',
    title: 'Mapa de Riesgos Global',
    subtitle: 'Datos oficiales MAEC + fuentes internacionales',
    description: 'Consulta el nivel de riesgo de 106+ países con datos actualizados. Incluye índices de paz, salud, desarrollo y alertas en tiempo real.',
    color: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    link: '/',
    linkText: 'Explorar Mapa',
  },
  {
    icon: <Route className="w-6 h-6" />,
    emoji: '🛣️',
    title: 'Planifica Rutas con IA',
    subtitle: 'Itinerarios personalizados al instante',
    description: 'Genera rutas completas por país o región. La IA considera seguridad, presupuesto, temporada y tus intereses para crear el viaje perfecto.',
    color: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    link: '/rutas',
    linkText: 'Ver Rutas',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    emoji: '⭐',
    title: 'Favoritos y Dashboard',
    subtitle: 'Tu centro de control personal',
    description: 'Guarda países favoritos, monitoriza riesgos, recibe alertas personalizadas y gana puntos de viajero. Desde Explorador hasta Oráculo.',
    color: 'from-orange-500 to-red-600',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    link: '/dashboard',
    linkText: 'Ir al Dashboard',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    emoji: '🚀',
    title: '¡Todo listo para empezar!',
    subtitle: '¿Cómo quieres comenzar?',
    description: '',
    color: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-400',
  },
];

export default function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_seen_v2');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
      setIsClosed(false);
    }
  }, []);

  const handleClose = () => {
    setIsClosed(true);
    setIsVisible(false);
    localStorage.setItem('onboarding_seen_v2', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible || isClosed) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-700">
          <div
            className={`h-full bg-gradient-to-r ${step.color} transition-all duration-300`}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center`}>
                <span className="text-2xl">{step.emoji}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className={`text-sm ${step.iconColor}`}>{step.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {step.description && (
            <div className="mb-6">
              <p className="text-slate-300 text-base leading-relaxed">{step.description}</p>
            </div>
          )}

          {/* Feature highlights for step 0 */}
          {currentStep === 0 && (
            <div className="space-y-3 mb-6">
              {[
                { icon: <MapPin className="w-4 h-4" />, text: '106+ países con datos de riesgo actualizados' },
                { icon: <Sparkles className="w-4 h-4" />, text: 'Rutas generadas por IA personalizadas' },
                { icon: <UserCheck className="w-4 h-4" />, text: 'Sistema de niveles y recompensas' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                  <div className={`${step.iconBg} p-2 rounded-lg`}>
                    <span className={step.iconColor}>{item.icon}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Final CTA buttons */}
          {currentStep === steps.length - 1 && (
            <div className="space-y-3 mb-2">
              <Link
                href="/rutas"
                onClick={handleClose}
                className="block w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-center"
              >
                🛣️ Planificar una Ruta
              </Link>
              <Link
                href="/"
                onClick={handleClose}
                className="block w-full py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors text-center"
              >
                🗺️ Explorar Mapa de Riesgos
              </Link>
              <Link
                href="/dashboard"
                onClick={handleClose}
                className="block w-full py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors text-center"
              >
                👤 Ir al Dashboard
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep ? 'bg-white' : i < currentStep ? 'bg-slate-500' : 'bg-slate-600'
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 && (
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${step.color} text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === steps.length - 1 && (
              <button
                onClick={handleClose}
                className="text-slate-400 text-sm hover:text-slate-300"
              >
                Saltar
              </button>
            )}
          </div>

          <p className="text-center text-slate-600 text-xs mt-3">
            Paso {currentStep + 1} de {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}
