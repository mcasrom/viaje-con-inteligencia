'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Shield, BarChart3, Check, X, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Trip } from '@/lib/supabase';

interface TripScore {
  trip_id: string;
  trip_name: string;
  destination: string;
  country_code: string;
  country_name: string;
  flag: string;
  days: number;
  month: number;
  score: number;
  label: string;
  breakdown: Record<string, number>;
  labels: Record<string, string>;
}

const DIMENSIONS: { key: string; label: string }[] = [
  { key: 'riesgo', label: 'Riesgo' },
  { key: 'season', label: 'Temporada' },
  { key: 'coste', label: 'Coste' },
  { key: 'perfil', label: 'Perfil' },
];

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-orange-400';
  return 'text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-600/20 text-emerald-400';
  if (score >= 60) return 'bg-green-600/20 text-green-400';
  if (score >= 40) return 'bg-yellow-600/20 text-yellow-400';
  if (score >= 20) return 'bg-orange-600/20 text-orange-400';
  return 'bg-red-600/20 text-red-400';
}

export default function CompararPage() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [results, setResults] = useState<TripScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) return;
    async function fetchTrips() {
      const res = await fetch('/api/trips', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
      }
      setLoading(false);
    }
    fetchTrips();
  }, [user, authLoading]);

  const toggleTrip = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setComparing(true);
    try {
      const res = await fetch('/api/trips/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } finally {
      setComparing(false);
    }
  };

  const bestScore = results.length > 0
    ? Math.max(...results.map(r => r.score))
    : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/viajes" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Mis Viajes</span>
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Comparador
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Selecciona viajes a comparar</h2>
          {trips.length === 0 ? (
            <p className="text-slate-400 text-sm">No tienes viajes creados.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {trips.map(trip => {
                const isSelected = selectedIds.includes(trip.id);
                return (
                  <button
                    key={trip.id}
                    onClick={() => toggleTrip(trip.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 opacity-0" />}
                    <span>{trip.destination}</span>
                    <span className="text-xs opacity-60">{trip.days}d</span>
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || comparing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm"
          >
            {comparing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            Comparar ({selectedIds.length})
          </button>
          {selectedIds.length < 2 && (
            <p className="text-xs text-slate-500 mt-2">Selecciona al menos 2 viajes</p>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-2xl p-6 overflow-x-auto">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Comparativa de seguridad</h2>
              </div>
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 py-3 pr-6 font-medium">Dimensión</th>
                    {results.map(r => (
                      <th key={r.trip_id} className="text-center text-slate-300 py-3 px-4 font-medium">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{r.flag}</span>
                          <span>{r.destination}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-normal">{r.days}d</span>
                      </th>
                    ))}
                    {results.length > 1 && (
                      <th className="text-center text-slate-400 py-3 px-4 font-medium">Diferencia</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 pr-6 text-white font-medium">Global</td>
                    {results.map(r => (
                      <td key={r.trip_id} className="text-center py-3 px-4">
                        <span className={`inline-block font-bold text-lg px-3 py-1 rounded-lg ${getScoreBg(r.score)}`}>
                          {r.score}/100
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5 capitalize">{r.label}</span>
                      </td>
                    ))}
                    {results.length > 1 && (
                      <td className="text-center py-3 px-4">
                        {(() => {
                          const sorted = [...results].sort((a, b) => b.score - a.score);
                          const best = sorted[0];
                          const diff = best.score - sorted[sorted.length - 1].score;
                          return (
                            <span className={diff > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                              {diff > 0 ? `+${diff} ${best.destination}` : '—'}
                            </span>
                          );
                        })()}
                      </td>
                    )}
                  </tr>
                  {DIMENSIONS.map(dim => (
                    <tr key={dim.key} className="border-b border-slate-700/50">
                      <td className="py-3 pr-6 text-slate-300">{dim.label}</td>
                      {results.map(r => {
                        const val = r.breakdown[dim.key];
                        return (
                          <td key={r.trip_id} className="text-center py-3 px-4">
                            <span className={`font-medium ${getScoreColor(val)}`}>
                              {val}/100
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5 capitalize">
                              {r.labels[dim.key]}
                            </span>
                          </td>
                        );
                      })}
                      {results.length > 1 && (
                        <td className="text-center py-3 px-4 text-slate-500">
                          {(() => {
                            const vals = results.map(r => r.breakdown[dim.key]);
                            const diff = Math.max(...vals) - Math.min(...vals);
                            return diff > 0 ? `±${diff}` : '—';
                          })()}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-4">
                <Info className="w-3 h-3" />
                Mejor puntuación global: {results.sort((a, b) => b.score - a.score)[0]?.destination} ({results.sort((a, b) => b.score - a.score)[0]?.score}/100)
              </p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                Recomendación
              </h3>
              {(() => {
                const sorted = [...results].sort((a, b) => b.score - a.score);
                const best = sorted[0];
                const worst = sorted[sorted.length - 1];
                const diff = best.score - worst.score;
                return (
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">
                      <span className="text-white font-semibold">{best.destination}</span> obtiene la mejor puntuación
                      con <span className="text-emerald-400 font-bold">{best.score}/100</span>
                      {diff > 0 && (
                        <>, superando a <span className="text-slate-300">{worst.destination}</span> por {diff} puntos</>
                      )}.
                    </p>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                      {best.breakdown.riesgo >= 75 && <li>Riesgo bajo según MAEC — viaje seguro</li>}
                      {best.breakdown.season >= 75 && <li>Buena temporada para visitar (afluencia moderada)</li>}
                      {best.breakdown.coste >= 75 && <li>Buena relación calidad-precio para tu presupuesto</li>}
                      {best.breakdown.perfil >= 75 && <li>Perfil de viajero compatible con el destino</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
