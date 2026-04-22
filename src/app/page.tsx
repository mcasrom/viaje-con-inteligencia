import MapaMundial from '@/components/MapaMundial';
import Testimonios from '@/components/Testimonios';
import NewsletterSignup from '@/components/NewsletterSignup';
import Link from 'next/link';
import { Activity, Shield, AlertTriangle, Globe, FileText, Camera, Plane } from 'lucide-react';

export default function Home() {
  return (
    <>
      <MapaMundial />
      
      {/* Memoria de Viaje - Destacado */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 shadow-lg shadow-orange-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">📁 Memoria de Viaje</h3>
                <p className="text-orange-100 text-sm">
                  Guarda tus documentos de viaje de forma 100% local en tu teléfono. 
                  No se suben a Internet. Si pierdes el móvil, los pierdes. Exporta backups periódicos.
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <NewsletterSignup variant="blog" />
      </div>
      <Testimonios />
    </>
  );
}
