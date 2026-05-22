'use client';

import dynamic from 'next/dynamic';
import { TOTAL_PAISES } from '@/lib/constants';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const MapaInteractivo = dynamic(
  () => import('@/components/MapaInteractivo'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Cargando mapa interactivo...</p>
      </div>
    </div>
  )}
);

export default function MapaPage() {
  return (
    <div className="h-screen w-full relative bg-slate-900">
      <div className="absolute top-4 left-4 z-[1000]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-sm rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-sm rounded-lg text-sm text-slate-400 border border-slate-700/50">
          Riesgo país actualizado · {TOTAL_PAISES} países
        </div>
      </div>
      <MapaInteractivo fullScreen />
    </div>
  );
}
