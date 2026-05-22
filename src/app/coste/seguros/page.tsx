import { Suspense } from 'react';
import type { Metadata } from 'next';
import SegurosForm from './SegurosForm';

export const metadata: Metadata = {
  title: 'Comparador de Seguros de Viaje | Viaje con Inteligencia',
  description: 'Compara seguros de viaje según el riesgo real del destino. IATI, Chapka, AXA y más.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/coste/seguros',
  },
};

export default function SegurosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    }>
      <SegurosForm />
    </Suspense>
  );
}
