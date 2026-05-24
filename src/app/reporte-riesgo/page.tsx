'use client';

import { useState, useEffect } from 'react';
import { Printer, Download, ArrowLeft, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface RiskChange {
  country_code: string;
  country_name: string;
  bandera: string;
  old_risk: string;
  new_risk: string;
  old_label: string;
  new_label: string;
  direction: 'up' | 'down';
  severity: number;
  incidents: { title: string; type: string; severity: string }[];
}

const severityColor: Record<string, string> = {
  'sin-riesgo': 'bg-green-500/20 text-green-400',
  'bajo': 'bg-emerald-500/20 text-emerald-400',
  'medio': 'bg-yellow-500/20 text-yellow-400',
  'alto': 'bg-orange-500/20 text-orange-400',
  'muy-alto': 'bg-red-500/20 text-red-400',
};

interface ApiResponse {
  weekRange: string;
  totalChanges: number;
  topChanges: RiskChange[];
  summary: string;
}

export default function ReporteRiesgoPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lead-magnet/weekly-risk', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" /> Guardar PDF
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-slate-800 rounded" />
            <div className="h-4 w-48 bg-slate-800 rounded" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Reporte Semanal de Riesgo
              </h1>
              <p className="text-slate-400 text-sm">{data.weekRange}</p>
            </div>

            {data.summary && (
              <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-5 mb-6">
                <p className="text-slate-200 text-sm leading-relaxed">{data.summary}</p>
              </div>
            )}

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 text-center">
              <p className="text-slate-300 text-sm">
                <span className="text-amber-400 font-bold">{data.topChanges.length}</span> países con cambios de riesgo esta semana
              </p>
            </div>

            <div className="space-y-3">
              {data.topChanges.map((c, i) => (
                <div key={c.country_code} className="bg-slate-800 border border-slate-700 rounded-xl p-4 print:border-slate-600">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl w-8 shrink-0">{c.bandera || '🌍'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{c.country_name}</span>
                        <span className="text-xs text-slate-500">#{i + 1}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor[c.old_risk]}`}>
                          {c.old_label}
                        </span>
                        {c.direction === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-red-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-400" />
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor[c.new_risk]}`}>
                          {c.new_label}
                        </span>
                        <span className={`text-[10px] font-medium ${c.direction === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                          {c.direction === 'up' ? '+1 nivel' : '-1 nivel'}
                        </span>
                      </div>

                      {c.incidents.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.incidents.map((inc, j) => (
                            <span key={j} className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-700/50 rounded-full px-2 py-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              {inc.title.slice(0, 50)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-slate-500 mt-8">
              Generado por Viaje Inteligencia · {new Date().toLocaleDateString('es-ES')}
            </p>
          </>
        ) : (
          <div className="text-center py-20 text-slate-500">No hay datos disponibles esta semana</div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}
