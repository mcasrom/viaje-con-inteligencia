'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, TrendingUp, TrendingDown, AlertTriangle, Shield, Loader2, Search, ChevronDown, ChevronUp, Info, Calendar, Clock, Activity } from 'lucide-react';

interface Prediction {
  countryCode: string;
  countryName: string;
  bandera: string;
  currentRisk: string;
  riskScore: number;
  probabilityUp7d: number;
  probabilityUp14d: number;
  probabilityUp30d: number;
  signalCount7d: number;
  incidentCount7d: number;
  topFactors: string[];
  predictedAt: string;
}

const riskConfig: Record<string, { label: string; color: string; bg: string; hex: string }> = {
  'sin-riesgo': { label: 'Sin riesgo', color: 'text-green-400', bg: 'bg-green-500/10', hex: '#4ade80' },
  'bajo': { label: 'Bajo', color: 'text-yellow-400', bg: 'bg-yellow-500/10', hex: '#facc15' },
  'medio': { label: 'Medio', color: 'text-orange-400', bg: 'bg-orange-500/10', hex: '#fb923c' },
  'alto': { label: 'Alto', color: 'text-red-400', bg: 'bg-red-500/10', hex: '#f87171' },
  'muy-alto': { label: 'Muy alto', color: 'text-red-600', bg: 'bg-red-900/20', hex: '#dc2626' },
};

function getRiskScoreColor(score: number): string {
  if (score < 25) return 'text-green-400';
  if (score < 40) return 'text-yellow-400';
  if (score < 60) return 'text-orange-400';
  if (score < 80) return 'text-red-400';
  return 'text-red-600';
}

function getProbColor(p: number): string {
  if (p < 0.05) return 'text-green-400';
  if (p < 0.15) return 'text-yellow-400';
  if (p < 0.3) return 'text-orange-400';
  return 'text-red-400';
}

function formatPct(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

export default function PredictionsClient() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('riskScore');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [riskFilter, setRiskFilter] = useState<string | null>(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/risk-predictions?sort=riskScore&order=desc&limit=200');
      const data = await res.json();
      setPredictions(data.predictions || []);
    } catch {
      console.error('Error loading predictions');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (code: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = predictions.filter(p =>
    (normalize(p.countryName).includes(normalize(search)) ||
    p.countryCode.toLowerCase().includes(search.toLowerCase())) &&
    (riskFilter ? p.currentRisk === riskFilter : true)
  );

  const shown = [...filtered];

  const distribution = Object.entries(
    predictions.reduce<Record<string, number>>((acc, p) => {
      acc[p.currentRisk] = (acc[p.currentRisk] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => {
    const order = ['muy-alto', 'alto', 'medio', 'bajo', 'sin-riesgo'];
    return order.indexOf(a[0]) - order.indexOf(b[0]);
  });

  const total = predictions.length;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Predicciones de Riesgo IA</h1>
            <p className="text-slate-400 text-sm">
              Predicciones de cambio de riesgo basadas en análisis por IA · {predictions.length} países
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 rounded-lg px-4 py-2">
            <Info className="w-3 h-3 shrink-0" />
            El modelo cruza OSINT, incidentes activos, cambios recientes, petróleo y estacionalidad. Las predicciones se actualizan diariamente vía cron.
          </div>

          {total > 0 && (
            <>
              <div className="flex h-8 rounded-lg overflow-hidden">
                {distribution.map(([level, count]) => {
                  const cfg = riskConfig[level] || riskConfig['sin-riesgo'];
                  const pct = Math.round((count / total) * 100);
                  const isActive = riskFilter === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setRiskFilter(isActive ? null : level)}
                      title={`${cfg.label}: ${count} países (${pct}%)`}
                      className={`relative flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                        isActive ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 z-10' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ width: `${pct}%`, backgroundColor: cfg.hex }}
                    >
                      {pct > 8 ? `${count}` : null}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                {distribution.map(([level, count]) => {
                  const cfg = riskConfig[level] || riskConfig['sin-riesgo'];
                  const isActive = riskFilter === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setRiskFilter(isActive ? null : level)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                        isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.hex }} />
                      {cfg.label} <span className="text-slate-500">{count}</span>
                    </button>
                  );
                })}
                {riskFilter && (
                  <button onClick={() => setRiskFilter(null)} className="text-purple-400 hover:text-purple-300">
                    Limpiar filtro
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <details className="mb-6 text-xs text-slate-400 bg-slate-800/30 rounded-lg px-4 py-2 open:pb-3">
          <summary className="cursor-pointer font-medium text-slate-300">¿Cómo interpretar las predicciones?</summary>
          <div className="mt-2 space-y-1.5">
            <p><strong className="text-slate-200">Score de riesgo (0-100):</strong> puntuación compuesta que combina el nivel MAEC actual + señales OSINT + incidentes activos + indicadores económicos. A mayor score, mayor precaución recomendada.</p>
            <p><strong className="text-slate-200">Probabilidad a 7 días:</strong> riesgo de que el país empeore su nivel MAEC en la próxima semana. Refleja señales OSINT muy recientes y cambios repentinos.</p>
            <p><strong className="text-slate-200">Probabilidad a 14 días:</strong> misma métrica a dos semanas vista. añade la tendencia observada y el componente estacional.</p>
            <p><strong className="text-slate-200">Probabilidad a 30 días:</strong> horizonte mensual. incorpora la inercia histórica, inflación, GPI/GTI y eventos programados. La menos precisa de las tres.</p>
            <p className="text-slate-500 mt-1">Países en nivel "muy-alto" parten con probabilidades bajas por definición (ya están en el techo de riesgo). Las subidas aquí indican señales de crisis adicional (nuevos incidentes, cierre de espacio aéreo).</p>
          </div>
        </details>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar país..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
          <span>Ordenar por:</span>
          {[
            { key: 'riskScore', label: 'Score riesgo' },
            { key: 'up7d', label: '↑ 7d' },
            { key: 'up14d', label: '↑ 14d' },
            { key: 'up30d', label: '↑ 30d' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                sortBy === s.key ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No se encontraron predicciones para &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {shown.map(p => {
              const risk = riskConfig[p.currentRisk] || riskConfig['sin-riesgo'];
              const expandedThis = expanded.has(p.countryCode);

              return (
                <div key={p.countryCode} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
                  <button
                    onClick={() => toggleExpanded(p.countryCode)}
                    className="w-full p-4 flex items-center gap-4 text-left"
                  >
                    <span className="text-3xl">{p.bandera}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-bold">{p.countryName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk.color} ${risk.bg}`}>
                          {risk.label}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs uppercase">{p.countryCode}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${getRiskScoreColor(p.riskScore)}`}>
                          {p.riskScore}
                        </p>
                        <p className="text-slate-500 text-xs">Score</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className={`font-semibold text-sm ${getProbColor(p.probabilityUp7d)}`}>
                          {formatPct(p.probabilityUp7d)}
                        </p>
                        <p className="text-slate-500 text-xs">7d</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className={`font-semibold text-sm ${getProbColor(p.probabilityUp14d)}`}>
                          {formatPct(p.probabilityUp14d)}
                        </p>
                        <p className="text-slate-500 text-xs">14d</p>
                      </div>
                      <div className="text-center hidden md:block">
                        <p className={`font-semibold text-sm ${getProbColor(p.probabilityUp30d)}`}>
                          {formatPct(p.probabilityUp30d)}
                        </p>
                        <p className="text-slate-500 text-xs">30d</p>
                      </div>
                      <div className="hidden lg:flex items-center gap-1 text-slate-500 text-xs">
                        <Activity className="w-3 h-3" />
                        <span>{p.signalCount7d}</span>
                      </div>
                      <div className="hidden lg:flex items-center gap-1 text-slate-500 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{p.incidentCount7d}</span>
                      </div>
                    </div>
                    <div className="text-slate-500">
                      {expandedThis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {expandedThis && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-700">
                      <div className="grid sm:grid-cols-3 gap-3 mt-3">
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Probabilidad 7 días
                          </p>
                          <p className={`text-lg font-bold ${getProbColor(p.probabilityUp7d)}`}>
                            {formatPct(p.probabilityUp7d)}
                          </p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Probabilidad 14 días
                          </p>
                          <p className={`text-lg font-bold ${getProbColor(p.probabilityUp14d)}`}>
                            {formatPct(p.probabilityUp14d)}
                          </p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Probabilidad 30 días
                          </p>
                          <p className={`text-lg font-bold ${getProbColor(p.probabilityUp30d)}`}>
                            {formatPct(p.probabilityUp30d)}
                          </p>
                        </div>
                      </div>

                      {p.topFactors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-slate-400 text-xs mb-2">Factores principales:</p>
                          <div className="flex flex-wrap gap-2">
                            {p.topFactors.map((f, i) => (
                              <span key={i} className="px-2 py-1 bg-slate-700/50 rounded-lg text-slate-300 text-xs">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Señales OSINT (7d): {p.signalCount7d}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Incidentes activos: {p.incidentCount7d}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Score: {p.riskScore}/100
                        </span>
                      </div>

                      <Link
                        href={`/pais/${p.countryCode}`}
                        className="mt-3 inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        Ver ficha del país →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
