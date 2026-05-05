import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Shield, Gift } from 'lucide-react';
import FreeTrialForm from './FreeTrialForm';

export const metadata: Metadata = {
  title: 'Prueba Premium Gratis 7 Días | Sin Tarjeta - Viaje con Inteligencia',
  description: 'Prueba todas las funciones Premium gratis durante 7 días. Sin tarjeta de crédito. Chat IA, alertas, itinerarios y más.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/free-trial',
  },
};

const BENEFITS = [
  { icon: '🤖', title: 'Chat IA Groq', desc: 'Planifica tu viaje con inteligencia artificial' },
  { icon: '📊', title: 'Análisis de Riesgo', desc: 'Datos oficiales MAEC actualizados' },
  { icon: '🗺️', title: 'Mapas Interactivos', desc: 'Visualiza riesgos por país' },
  { icon: '🔔', title: 'Alertas en Tiempo Real', desc: 'Sé el primero en saber' },
  { icon: '✈️', title: 'Planificador IA', desc: 'Itinerarios personalizados' },
  { icon: '📄', title: 'Reclamaciones PDF', desc: 'Genera documentos oficiales' },
];

export default function FreeTrialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <h1 className="text-xl font-bold text-white">Viaje con Inteligencia</h1>
                <p className="text-purple-400 text-sm">Prueba Premium</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/premium" className="text-slate-300 hover:text-white transition-colors">
                Ver todos los planes
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium mb-4">
            Prueba Premium Gratis
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            7 días Premium <span className="text-yellow-400">gratis</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Desbloquea todas las funciones Premium y transforma la manera de planificar tus viajes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {BENEFITS.map((benefit, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-colors">
              <span className="text-3xl mb-3 block">{benefit.icon}</span>
              <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
              <p className="text-slate-400 text-sm">{benefit.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Qué incluye la prueba gratuita?
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <span className="text-white">Acceso completo al Chat IA</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <span className="text-white">Todos los índices de riesgo</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <span className="text-white">Alertas en tiempo real</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <span className="text-white">Generador de itinerarios IA</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <span className="text-white">PDF reclamaciones viajes</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <span className="text-white">Soporte prioritario</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <FreeTrialForm />
        </div>

        <div className="mt-16 bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <div className="flex flex-wrap justify-center gap-8 text-center text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Datos seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-400" />
              <span>Sin tarjeta · Acceso completo · 7 días gratis</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            ¿Preguntas? <a href="mailto:info@viajeinteligencia.com" className="text-blue-400 hover:text-blue-300">info@viajeinteligencia.com</a>
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">Inicio</Link>
            <Link href="/premium" className="text-blue-400 hover:text-blue-300 text-sm">Precios</Link>
            <Link href="/legal" className="text-blue-400 hover:text-blue-300 text-sm">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}