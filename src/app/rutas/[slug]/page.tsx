'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { thematicRoutes, ThemeRoute, ThematicRoute } from '@/data/rutas-espanas';
import { ArrowLeft, Car, Clock, Shield, Star, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';

export default function RouteDetailPage() {
  const params = useParams();
  const routeId = params.slug as string;
  const route = (thematicRoutes as Record<ThemeRoute, ThematicRoute>)[routeId as ThemeRoute];

  if (!route) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ruta no encontrada</h2>
          <Link href="/rutas" className="text-blue-400 hover:text-blue-300">← Volver a rutas</Link>
        </div>
      </div>
    );
  }

  const difficultyColors: Record<string, string> = {
    facil: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    moderado: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dificil: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* HEADER */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/rutas" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a Rutas</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🗺️</span>
                <h1 className="text-3xl font-bold text-white">{route.name}</h1>
              </div>
              <p className="text-slate-400 max-w-2xl">{route.description}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${difficultyColors[route.difficulty]}`}>
              {route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)}
            </span>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <Car className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-white font-bold">{route.totalDistance} km</div>
              <div className="text-slate-500 text-xs">Distancia total</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <Clock className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-white font-bold">{route.totalDrivingTime}h</div>
              <div className="text-slate-500 text-xs">Tiempo conducción</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <Shield className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-white font-bold">{route.mlFeatures.safetyScore}/10</div>
              <div className="text-slate-500 text-xs">Puntuación seguridad</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <Star className="w-5 h-5 text-yellow-400 mb-2" />
              <div className="text-white font-bold">{route.mlFeatures.popularityScore}/10</div>
              <div className="text-slate-500 text-xs">Popularidad</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEGMENTOS */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Segmentos de la Ruta
        </h2>

        <div className="space-y-4">
          {route.segments.map((seg, i) => (
            <div key={seg.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-blue-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{seg.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      {seg.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {seg.drivingTime}h
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {seg.locations.map(loc => (
                      <span key={loc} className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MEJOR TEMPORADA */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-2">Mejor Época para Viajar</h3>
              <p className="text-slate-400 text-sm mb-3">
                Recomendamos viajar en: <span className="text-blue-400 font-medium">{route.bestSeason.join(', ')}</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-white font-bold">{route.avgDailyCost?.bajo || 0}€</div>
                  <div className="text-slate-500 text-xs">Presupuesto bajo</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-white font-bold">{route.avgDailyCost?.medio || 0}€</div>
                  <div className="text-slate-500 text-xs">Presupuesto medio</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-white font-bold">{route.avgDailyCost?.alto || 0}€</div>
                  <div className="text-slate-500 text-xs">Presupuesto alto</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/rutas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver todas las rutas
          </Link>
        </div>
      </div>
    </div>
  );
}
