'use client';
import type { Metadata } from 'next';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, TrendingUp, Shield, DollarSign, Plane, Users, Sparkles } from 'lucide-react';
import {
  clusterDestinations,
  getDestinationsWithFeatures,
  travelAttributes,
} from '@/data/clustering';
import { paisesData as paises } from '@/data/paises';

export const metadata: Metadata = {
  title: 'ML Clustering de Destinos | IA para Viajes - Viaje con Inteligencia',
  description: 'Destinos agrupados por inteligencia artificial según seguridad, coste y preferencias. Descubre tu destino ideal con ML.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/clustering',
  },
};

const riskColor: Record<string, string> = {
  'sin-riesgo': 'bg-green-500',
  'bajo': 'bg-emerald-500',
  'medio': 'bg-orange-500',
  'alto': 'bg-red-500',
  'muy-alto': 'bg-red-700',
};

const clusterIcon = ['🛡️', '✈️', '💰', '🌍', '⭐', '🔥'];

export default function MLClusteringPage() {
  const [k, setK] = useState(4);
  const clusters = useMemo(() => clusterDestinations(k), [k]);
  const destinations = useMemo(() => getDestinationsWithFeatures(), []);

  const destMap = useMemo(() => {
    const m: Record<string, any> = {};
    destinations.forEach(d => { m[d.code] = d; });
    return m;
  }, [destinations]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">K-Means Clustering</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ML Clustering de Destinos
          </h1>
          <p className="text-slate-400">
            {destinations.length} destinos agrupados por seguridad, coste, distancia y popularidad turística.
          </p>
        </div>

        {/* K selector */}
        <div className="mb-8 flex items-center gap-4 bg-slate-800 rounded-xl p-4 border border-slate-700">
          <span className="text-sm text-slate-400">Número de clusters:</span>
          <div className="flex gap-2">
            {[3, 4, 5, 6].map(v => (
              <button
                key={v}
                onClick={() => setK(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  k === v
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Feature legend */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <Shield className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-xs text-slate-500 uppercase font-bold">Seguridad</p>
            <p className="text-slate-300 text-sm">Nivel riesgo MAEC</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <DollarSign className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-xs text-slate-500 uppercase font-bold">Coste vida</p>
            <p className="text-slate-300 text-sm">IPC del país</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <Plane className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-xs text-slate-500 uppercase font-bold">Distancia</p>
            <p className="text-slate-300 text-sm">Desde España (km)</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <Users className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-xs text-slate-500 uppercase font-bold">Turismo</p>
            <p className="text-slate-300 text-sm">Llegadas anuales</p>
          </div>
        </div>

        {/* Clusters */}
        <div className="space-y-6">
          {clusters.map((cluster, idx) => {
            const countries = cluster.destinations
              .map(code => destMap[code])
              .filter(Boolean)
              .sort((a, b) => b.riskScore - a.riskScore);

            return (
              <section key={idx} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className={`p-5 border-b ${
                  idx === 0 ? 'border-green-500/30 bg-green-500/5' :
                  idx === 1 ? 'border-blue-500/30 bg-blue-500/5' :
                  idx === 2 ? 'border-orange-500/30 bg-orange-500/5' :
                  idx === 3 ? 'border-cyan-500/30 bg-cyan-500/5' :
                  idx === 4 ? 'border-purple-500/30 bg-purple-500/5' :
                  'border-pink-500/30 bg-pink-500/5'
                }`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{clusterIcon[idx % clusterIcon.length]}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Cluster {idx + 1}: {cluster.label}
                      </h2>
                      <p className="text-slate-400 text-sm">{cluster.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-slate-500">
                      {countries.length} destinos
                    </span>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>Seguridad: {(cluster._centroid?.[0] || 0).toFixed(0)}%</span>
                      <span>IPC: {(cluster._centroid?.[1] || 0).toFixed(0)}</span>
                      <span>Dist: {((cluster._centroid?.[2] || 0) * 15000).toFixed(0)} km</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-slate-700/30">
                  {countries.map(dest => {
                    const pais = paises[dest.code];
                    const attrs = travelAttributes[dest.code];
                    return (
                      <Link
                        key={dest.code}
                        href={`/analisis?destino=${dest.code}`}
                        className="bg-slate-800 hover:bg-slate-750 p-4 transition-colors group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{dest.bandera}</span>
                          <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                            {dest.nombre}
                          </span>
                          <span className={`ml-auto w-2 h-2 rounded-full ${
                            riskColor[pais?.nivelRiesgo || 'bajo']
                          }`} title={pais?.nivelRiesgo} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-green-500" />
                            {dest.riskScore}%
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-amber-500" />
                            IPC {dest.ipc}
                          </div>
                          <div className="flex items-center gap-1">
                            <Plane className="w-3 h-3 text-blue-500" />
                            {dest.distanciaES.toLocaleString('es-ES')} km
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-purple-500" />
                            {(dest.arrivals / 1000000).toFixed(1)}M
                          </div>
                        </div>
                        {attrs && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {attrs.playa >= 8 && (
                              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded">🏖️ Playa</span>
                            )}
                            {attrs.cultural >= 8 && (
                              <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded">🏛️ Cultural</span>
                            )}
                            {attrs.naturaleza >= 8 && (
                              <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded">🌿 Naturaleza</span>
                            )}
                            {attrs.familiar >= 8 && (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded">👨‍👩‍👧 Familiar</span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Methodology note */}
        <div className="mt-8 bg-slate-800/60 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Metodología
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-400">
            <div>
              <p className="mb-2">
                El algoritmo <strong className="text-white">K-Means</strong> agrupa destinos según 4 dimensiones normalizadas y ponderadas:
              </p>
              <ul className="space-y-1">
                <li>• <strong className="text-green-400">Seguridad (×2)</strong> — Score derivado del nivel de riesgo MAEC</li>
                <li>• <strong className="text-amber-400">Coste vida (×1.5)</strong> — Índice de Precios al Consumidor</li>
                <li>• <strong className="text-blue-400">Distancia (×1)</strong> — Haversine desde Madrid</li>
                <li>• <strong className="text-purple-400">Turismo (×0.5)</strong> — Llegadas internacionales (log)</li>
              </ul>
            </div>
            <div>
              <p className="mb-2">
                <strong className="text-white">Fuentes de datos:</strong>
              </p>
              <ul className="space-y-1">
                <li>• Riesgo MAEC — Ministerio de Asuntos Exteriores</li>
                <li>• IPC — Indicadores económicos por país</li>
                <li>• Turismo — INE / UNWTO (llegadas y pernoctaciones)</li>
                <li>• Distancia — Fórmula Haversine (coordenadas GPS)</li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Atributos de viaje (playa, cultural, naturaleza, familiar) se calculan independientemente para recomendaciones.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
