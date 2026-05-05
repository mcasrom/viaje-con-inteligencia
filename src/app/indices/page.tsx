import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MapaIndices from '@/components/MapaIndices';

export const metadata = {
  title: 'KPIs Global — Mapas Interactivos de Datos',
  description: 'Visualiza riesgo MAEC, índice de paz, coste de viaje, sismos y conflictos en un mapa interactivo.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/indices',
  },
};

export default function IndicesPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <span className="text-blue-400 text-sm font-medium">Mapas Interactivos</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">
            Mapas de Datos Interactivos
          </h1>
          <p className="text-slate-400 text-sm">
            Selecciona una capa para visualizar datos globales: riesgo, paz, coste, sismos o conflictos.
          </p>
        </div>

        <MapaIndices />

        {/* Data sources note */}
        <div className="mt-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-white font-semibold text-sm mb-2">Fuentes de datos</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-slate-400">
            <div>🛡️ <span className="text-slate-300">Riesgo:</span> MAEC</div>
            <div>🕊️ <span className="text-slate-300">Paz:</span> GPI / IEP 2025</div>
            <div>💰 <span className="text-slate-300">Coste:</span> TCI propio</div>
            <div>🌍 <span className="text-slate-300">Sismos:</span> USGS</div>
            <div>⚠️ <span className="text-slate-300">Conflictos:</span> MAEC + OSINT</div>
          </div>
        </div>
      </main>
    </div>
  );
}
