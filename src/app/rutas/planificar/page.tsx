import { Metadata } from 'next'
import RoutePlannerClient from '@/components/RoutePlanner/RoutePlannerClient'

export const metadata: Metadata = {
  title: 'Planificar Ruta — Viaje con Inteligencia',
  description: 'Planifica tu ruta entre cualquier par de países con información de coste, duración, riesgo y modos de transporte disponibles.',
  openGraph: {
    title: 'Planificar Ruta — Viaje con Inteligencia',
    description: 'Compara rutas en coche, transporte público o vuelo entre cualquier par de países con scoring de riesgo integrado.',
  },
}

export default function PlanificarRutaPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Planificar Ruta
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Encuentra la mejor ruta entre dos países. Combina información de coste, duración y riesgo de viaje para tomar la mejor decisión.
          </p>
        </div>
        <RoutePlannerClient />
      </div>
    </div>
  )
}
