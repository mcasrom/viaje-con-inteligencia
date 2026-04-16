'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Bot, Bell, Map, TrendingUp, Zap, Crown, CreditCard, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [status, setStatus] = useState<'loading' | 'premium' | 'free'>('loading');
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      setStatus('premium');
    } else {
      setStatus('free');
    }
  }, []);

  const features = [
    { icon: Bot, name: 'Bot IA Personal', desc: 'Chat inteligente para tu viaje' },
    { icon: Bell, name: 'Alertas en Tiempo Real', desc: 'Notificaciones instantáneas' },
    { icon: Map, name: 'Itinerario Inteligente', desc: 'Rutas optimizadas con IA' },
    { icon: TrendingUp, name: 'Análisis de Gastos', desc: 'Predice tu presupuesto' },
    { icon: Zap, name: 'Acceso Prioritario', desc: 'Nuevos países primero' },
    { icon: Crown, name: 'Checklist Premium', desc: '+80 items personalizados' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {status === 'loading' && (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Cargando...</p>
          </div>
        )}

        {status === 'premium' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido a Premium!</h1>
              <p className="text-green-100">Tu suscripción se ha activado correctamente</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                Tu Suscripción
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Plan</p>
                  <p className="text-white font-medium">Premium Mensual</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Próxima renovación</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    En 30 días
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Características Premium</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                    <feature.icon className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="font-semibold text-white mb-1">{feature.name}</h3>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-800/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-3">🤖 Acceder al Bot IA</h3>
              <p className="text-slate-300 text-sm mb-4">
                Tu acceso premium incluye el bot conversacional con IA.
              </p>
              <a
                href="https://t.me/ViajeConInteligenciaBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Abrir Bot Premium
              </a>
            </div>
          </div>
        )}

        {status === 'free' && (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Dashboard Premium</h1>
            <p className="text-slate-400 mb-8">
              Accede a tu panel de control premium
            </p>
            <Link
              href="/premium"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Suscribirse a Premium
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
