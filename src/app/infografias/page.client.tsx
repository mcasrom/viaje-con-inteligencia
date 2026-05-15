'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, Download, ChevronLeft, ChevronRight, TrendingUp, Globe, Shield, AlertTriangle, Crown, BarChart3 } from 'lucide-react';

interface Infografia {
  id: string;
  week_start: string;
  week_end: string;
  edition: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  gwi_score: number | null;
  gwi_trend: number | null;
  country_count: number | null;
  top_risk_countries: string[] | null;
  is_published: boolean;
  published_at: string;
  pdf_url: string | null;
}

function gwiColor(score: number): string {
  if (score < 25) return 'text-green-500';
  if (score < 45) return 'text-lime-500';
  if (score < 60) return 'text-amber-500';
  if (score < 75) return 'text-red-500';
  return 'text-red-700';
}

function gwiBg(score: number): string {
  if (score < 25) return 'bg-green-500/10 border-green-500/30';
  if (score < 45) return 'bg-lime-500/10 border-lime-500/30';
  if (score < 60) return 'bg-amber-500/10 border-amber-500/30';
  if (score < 75) return 'bg-red-500/10 border-red-500/30';
  return 'bg-red-700/10 border-red-700/30';
}

function formatDate(d: string) {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return d; }
}

export default function InfografiasClient() {
  const [infografias, setInfografias] = useState<Infografia[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 12;

  const fetchInfografias = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/infografias?page=${p}&perPage=${perPage}`);
      const json = await res.json();
      setInfografias(json.data || []);
      setTotal(json.total || 0);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInfografias(page); }, [page, fetchInfografias]);

  const totalPages = Math.ceil(total / perPage);
  const latest = infografias[0];

  return (
    <div className="min-h-screen bg-slate-950 pt-24">
      {/* OSINT-style header */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span className="text-blue-400 text-sm font-mono tracking-widest">INTELLIGENCE BRIEFING</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-1">Infografías de Riesgo Global</h1>
          <p className="text-blue-400/70 text-sm font-medium tracking-wide mb-3">Tu radar de seguridad global impulsado por IA</p>
          <p className="text-slate-400 text-lg max-w-2xl">
            Análisis visual semanal con datos OSINT, MAEC, GPI, GTI y fuentes abiertas. El <strong className="text-amber-400">Global Weekly Index (GWI)</strong> mide la tensión global en viajes.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600">
            <span>ES: <span className="text-slate-500">Viaje con Inteligencia: Tu radar de seguridad global impulsado por IA.</span></span>
            <span>EN: <span className="text-slate-500">Smart Traveler: AI-Driven Global Risk Radar for the Conscious Explorer.</span></span>
          </div>
        </div>
      </div>

      {latest && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-r from-blue-500/5 via-slate-900 to-blue-500/5 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-mono font-bold tracking-wider">ÚLTIMA EDICIÓN</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-1">{latest.title}</h2>
                <p className="text-slate-400 text-sm mb-4">{formatDate(latest.week_start)} — {formatDate(latest.week_end)}</p>
                {latest.gwi_score !== null && (
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg border ${gwiBg(latest.gwi_score)}`}>
                    <span className="text-slate-400 text-xs font-mono">GWI</span>
                    <span className={`text-3xl font-bold font-mono ${gwiColor(latest.gwi_score)}`}>{latest.gwi_score.toFixed(1)}</span>
                    {latest.gwi_trend !== null && (
                      <span className={`text-xs font-mono ${latest.gwi_trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {latest.gwi_trend > 0 ? '▲' : '▼'} {Math.abs(latest.gwi_trend).toFixed(1)}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/infografias/${latest.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Ver detalle
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {latest.top_risk_countries && latest.top_risk_countries.length > 0 && (
                  <div className="space-y-1 text-right">
                    <div className="text-xs text-slate-500 font-mono">TOP RIESGO</div>
                    {latest.top_risk_countries.slice(0, 5).map((name, i) => (
                      <div key={i} className="text-sm text-slate-300">{i + 1}. {name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center gap-2 mb-6 mt-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-white">Archivo Semanal</h2>
          <span className="text-xs text-slate-500 font-mono">({total} ediciones)</span>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : infografias.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No hay infografías publicadas aún.</p>
            <p className="text-slate-600 text-sm mt-1">La primera edición se publicará el próximo lunes.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {infografias.map((inf) => (
                <Link
                  key={inf.id}
                  href={`/infografias/${inf.id}`}
                  className="group bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/40 hover:bg-slate-800/50 transition-all"
                >
                  <div className="aspect-[2/3] bg-slate-900 relative overflow-hidden">
                    {inf.image_url ? (
                      <img
                        src={inf.image_url}
                        alt={inf.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Shield className="w-12 h-12 text-slate-700" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {inf.gwi_score !== null && (
                        <div className={`px-2 py-1 rounded-md text-xs font-mono font-bold backdrop-blur-sm ${gwiBg(inf.gwi_score)}`}>
                          <span className={gwiColor(inf.gwi_score)}>GWI {inf.gwi_score.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                      <Calendar className="w-3 h-3" />
                      Edición #{inf.edition}
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {inf.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(inf.week_start)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <span className="text-sm text-slate-400 font-mono">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Premium CTA */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <Crown className="w-8 h-8 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Premium — Análisis Avanzado</h3>
          <p className="text-slate-400 max-w-xl mx-auto mb-6">
            Los suscriptores Premium obtienen PDF descargable, comparativa histórica, mapa interactivo y análisis IA de cada edición.
          </p>
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Crown className="w-5 h-5" />
            Actualizar a Premium
          </Link>
        </div>
      </div>
    </div>
  );
}
