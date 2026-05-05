'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Sparkles, Shield, Bell, MessageSquare, FileCheck, TrendingUp, Map, Plane, Star, Zap } from 'lucide-react';

const FEATURES = [
  { icon: <MessageSquare className="w-5 h-5" />, title: 'Chat IA de Viajes', desc: 'Pregunta sobre cualquier destino, visado, seguridad o ruta. Respuestas al instante.' },
  { icon: <Plane className="w-5 h-5" />, title: 'Planificador IA', desc: 'Genera itinerarios personalizados por destino, días e intereses.' },
  { icon: <Bell className="w-5 h-5" />, title: 'Alertas en Tiempo Real', desc: 'Cambios de riesgo, conflictos naturales y recomendaciones MAEC.' },
  { icon: <Map className="w-5 h-5" />, title: 'Mapa de Sismos (USGS)', desc: 'Terremotos en vivo con magnitud, ubicación y alertas de tsunami.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Análisis de Riesgo', desc: 'Fichas completas por país: seguridad, costes, contactos y visados.' },
  { icon: <FileCheck className="w-5 h-5" />, title: 'Reclamaciones PDF', desc: 'Genera formularios de reclamación listos para enviar a aerolíneas.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'KPIs Globales', desc: '6 índices comparativos: paz, terrorismo, desarrollo, inflación, sismos.' },
  { icon: <Sparkles className="w-5 h-5" />, title: 'ML Clustering', desc: 'Destinos agrupados por IA según seguridad, coste y preferencias.' },
];

export default function PremiumPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header minimal */}
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Premium</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Herramientas que{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              trabajan por ti
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            IA, datos en tiempo real y análisis de riesgo en un solo lugar. Todo lo que necesitas para planificar, viajar seguro y resolver imprevistos.
          </p>
        </div>

        {/* Feature grid — lo que incluye */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-700/50 rounded-lg text-blue-400 shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isAnnual ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAnnual ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Anual
          </button>
        </div>

        {/* Pricing card */}
        <div className="max-w-md mx-auto mb-12">
          <div className={`bg-slate-800 rounded-2xl border-2 p-8 relative ${isAnnual ? 'border-amber-500' : 'border-slate-700'}`}>
            {isAnnual && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                Ahorra ~83%
              </div>
            )}

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">
                {isAnnual ? 'Premium Anual' : 'Premium Mensual'}
              </h2>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-white">
                  {isAnnual ? '19' : '4.99'}€
                </span>
                <span className="text-slate-400 text-sm">/{isAnnual ? 'año' : 'mes'}</span>
              </div>
              {isAnnual && (
                <p className="text-green-400 text-xs mt-2">
                  Equivale a 1.67€/mes — menos que un café
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Chat IA de viajes sin límite',
                'Planificador de itinerarios',
                'Alertas de riesgo en tiempo real',
                'Mapa de sismos USGS en vivo',
                'Monitor de conflictos activo',
                'Análisis de riesgo por país',
                'Generador de reclamaciones PDF',
                'KPIs globales comparativos',
                'ML Clustering de destinos',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/free-trial"
              className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl text-center hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              Probar 7 días gratis
            </a>
            <p className="text-slate-500 text-xs text-center mt-3">
              Sin compromiso · Cancela cuando quieras · Pago seguro con Stripe
            </p>
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-slate-400 text-sm ml-2">4.8/5</span>
          </div>
          <p className="text-slate-500 text-sm">
            2.400+ viajeros activos · 107 países con datos MAEC
          </p>
        </div>

        {/* Quick links to tools */}
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-white font-bold text-center mb-4">
            ¿Ya tienes cuenta? Accede directamente:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/dashboard" className="bg-slate-700/50 rounded-xl p-3 text-center hover:bg-slate-700 transition-colors">
              <span className="text-sm text-slate-300">📊 Dashboard</span>
            </Link>
            <Link href="/documentos" className="bg-slate-700/50 rounded-xl p-3 text-center hover:bg-slate-700 transition-colors">
              <span className="text-sm text-slate-300">📁 Documentos</span>
            </Link>
            <Link href="/viajes" className="bg-slate-700/50 rounded-xl p-3 text-center hover:bg-slate-700 transition-colors">
              <span className="text-sm text-slate-300">✈️ Mis Viajes</span>
            </Link>
            <Link href="/indices" className="bg-slate-700/50 rounded-xl p-3 text-center hover:bg-slate-700 transition-colors">
              <span className="text-sm text-slate-300">📈 KPIs</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
