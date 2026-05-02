import MapaMundial from '@/components/MapaMundial';
import Testimonios from '@/components/Testimonios';
import NewsletterSignup from '@/components/NewsletterSignup';
import PlanificadorSimple from '@/components/PlanificadorSimple';
import QuickStart from '@/components/QuickStart';
import Link from 'next/link';
import { Activity, Shield, Globe, FileText, Gift, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      {/* LEAD MAGNET - Banner destacado */}
      <PlanificadorSimple />
      
      {/* POST DESTACADO - Qué es Viaje Inteligencia */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Link
          href="/blog/Que-es-viaje-inteligencia"
          className="group block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/30 border border-blue-400/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.01]"
        >
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="md:w-64 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
              <img
                src="/post1.png"
                alt="Qué es Viaje Inteligencia"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900/60 md:bg-gradient-to-l" />
            </div>
            <div className="p-6 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full animate-pulse">
                  <Globe className="w-3 h-3" />
                  DESCUBRE EL PROYECTO
                </span>
                <Shield className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-blue-100 transition-colors">
                ¿Qué es Viaje Inteligencia?
              </h3>
              <p className="text-blue-100 text-sm md:text-base mb-4">
                Viajar ya no es solo elegir destino y comprar un vuelo. Quien viaja mejor toma mejores decisiones: datos, IA y estrategia al servicio de tus viajes.
              </p>
              <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                Leer artículo
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <MapaMundial />
      
      {/* Memoria de Viaje - PREMIUM */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 shadow-lg shadow-orange-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">📁 Memoria de Viaje</h3>
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">PREMIUM</span>
                </div>
                <p className="text-orange-100 text-sm">
                  Guarda documentos de viaje 100% local en tu móvil. 
                  No se suben a la red. Si pierdes el teléfono, los pierdes. Exporta backups.
                </p>
              </div>
            </div>
            <Link 
              href="/documentos" 
              className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all whitespace-nowrap"
            >
              Abrir app →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 border border-blue-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">📊 KPIs de Seguridad en Tiempo Real</h3>
                <p className="text-slate-400">Gráficos interactivos: riesgo político, aéreo, restricciones y recomendaciones IA</p>
              </div>
            </div>
            <Link 
              href="/dashboard/kpis" 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25 whitespace-nowrap"
            >
              Ver Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Checklist Premium Gratis - Moved below KPIs */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">🎁 Checklist Premium Gratis</h3>
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">FREE</span>
                </div>
                <p className="text-emerald-100 text-sm">
                  30 items esenciales para viajar seguro. Descárgalo ahora →</p>
              </div>
            </div>
            <Link 
              href="/lead-magnet" 
              className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all whitespace-nowrap flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Obtener Gratis
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <NewsletterSignup variant="blog" />
      </div>
      <Testimonios />
      <QuickStart />
    </>
  );
}
