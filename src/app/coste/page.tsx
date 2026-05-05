'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, BarChart3, Calendar, AlertTriangle, DollarSign, Globe, Loader2, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';

interface TCIResult {
  code: string;
  name: string;
  bandera: string;
  tci: number;
  trend: string;
  region: string;
}

interface DetailData {
  tci: {
    tci: number;
    trend: string;
    recommendation: string;
    factors: { label: string; value: number; weight: number; contribution: number }[];
  };
  trend: {
    weeklyData: { week: string; value: number }[];
    trend4Weeks: { direction: string; change: number };
    trend12Weeks: { direction: string; change: number };
    prediction: { nextWeek: number; nextMonth: number; confidence: number };
    bestWeekToBook: { week: number; month: string; savingsPct: number };
    volatility: string;
  };
  monthly: number[];
  conflict: {
    isAffected: boolean;
    surchargePct: number;
    timeExtraHours: number;
    closedAirspace: string;
    reason: string;
  };
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MES_COMPLETO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getTCIColor(tci: number): string {
  if (tci < 85) return '#22c55e';
  if (tci < 95) return '#86efac';
  if (tci < 105) return '#eab308';
  if (tci < 115) return '#f97316';
  return '#dc2626';
}

function getTCILabel(tci: number): string {
  if (tci < 85) return 'Muy barato';
  if (tci < 95) return 'Económico';
  if (tci < 105) return 'Medio';
  if (tci < 115) return 'Caro';
  return 'Muy caro';
}

function getTrendIcon(trend: string) {
  const t = trend.toLowerCase();
  if (t.includes('baj')) return <TrendingDown className="w-4 h-4 text-emerald-400" />;
  if (t.includes('alc') || t.includes('sub')) return <TrendingUp className="w-4 h-4 text-rose-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

export default function CosteMLPage() {
  const [countries, setCountries] = useState<TCIResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetch('/api/flight-costs?action=all')
      .then(r => r.json())
      .then(d => setCountries(d.countries || []))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    setDetailLoading(true);
    setDetail(null);
    fetch(`/api/flight-costs?action=detail&country=${selectedCountry}`)
      .then(r => r.json())
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedCountry]);

  const filtered = useMemo(() => {
    let result = [...countries];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    if (regionFilter !== 'all') {
      result = result.filter(c => c.region === regionFilter);
    }
    result.sort((a, b) => sortAsc ? a.tci - b.tci : b.tci - a.tci);
    return result;
  }, [countries, search, regionFilter, sortAsc]);

  const regions = useMemo(() => {
    const set = new Set(countries.map(c => c.region));
    return ['all', ...Array.from(set)];
  }, [countries]);

  const handleCountryClick = (code: string) => {
    setSelectedCountry(selectedCountry === code ? null : code);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">TCI · Índice de Coste de Viaje</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Estimador de Coste con ML
          </h1>
          <p className="text-slate-400">
            Índice TCI calculado con demanda, petróleo Brent, estacionalidad, IPC y riesgo MAEC. Predicciones para las próximas semanas.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-8 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-blue-500/50"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r === 'all' ? 'Todas las regiones' : r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm hover:bg-slate-700 transition-colors"
          >
            {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {sortAsc ? 'Más baratos' : 'Más caros'}
          </button>
        </div>

        {/* Ranking Table */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Calculando TCI para todos los países...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">País</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Región</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">TCI</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Nivel</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={c.code}
                      onClick={() => handleCountryClick(c.code)}
                      className={`border-b border-slate-700/30 cursor-pointer transition-colors ${
                        selectedCountry === c.code
                          ? 'bg-blue-500/10'
                          : 'hover:bg-slate-700/30'
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="text-lg mr-2">{c.bandera}</span>
                        <span className="text-white font-medium">{c.name}</span>
                        <span className="text-slate-500 text-xs ml-2">({c.code})</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{c.region}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-lg" style={{ color: getTCIColor(c.tci) }}>{c.tci}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: getTCIColor(c.tci) + '20', color: getTCIColor(c.tci) }}
                        >
                          {getTCILabel(c.tci)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(c.trend)}
                          <span className="text-slate-300 text-xs">{c.trend}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedCountry && (
          <div className="mt-8 space-y-6">
            {detailLoading ? (
              <div className="flex items-center justify-center gap-3 text-slate-400 py-12">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analizando {selectedCountry} con ML...</span>
              </div>
            ) : detail ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">TCI Actual</div>
                    <div className="text-4xl font-bold" style={{ color: getTCIColor(detail.tci.tci) }}>
                      {detail.tci.tci}
                    </div>
                    <div className="text-sm mt-1" style={{ color: getTCIColor(detail.tci.tci) }}>
                      {getTCILabel(detail.tci.tci)}
                    </div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Predicción 1 sem</div>
                    <div className="text-4xl font-bold text-blue-400">
                      {detail.trend.prediction.nextWeek}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {detail.trend.prediction.nextWeek > detail.tci.tci
                        ? <TrendingUp className="w-3 h-3 text-rose-400" />
                        : <TrendingDown className="w-3 h-3 text-emerald-400" />}
                      <span className="text-xs text-slate-400">
                        {detail.trend.prediction.nextWeek > detail.tci.tci ? 'Subirá' : 'Bajará'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Predicción 1 mes</div>
                    <div className="text-4xl font-bold text-purple-400">
                      {detail.trend.prediction.nextMonth}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Confianza: {detail.trend.prediction.confidence}%
                    </div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Mejor mes</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {detail.trend.bestWeekToBook.month}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1">
                      Ahorro estimado: -{detail.trend.bestWeekToBook.savingsPct}%
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Trend */}
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                    <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      Tendencia 12 semanas
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">
                      Tendencia 4 sem: <span className={detail.trend.trend4Weeks.direction === 'up' ? 'text-rose-400' : detail.trend.trend4Weeks.direction === 'down' ? 'text-emerald-400' : 'text-slate-400'}>{detail.trend.trend4Weeks.direction}</span> ({detail.trend.trend4Weeks.change > 0 ? '+' : ''}{detail.trend.trend4Weeks.change})
                      {' · '}12 sem: <span className={detail.trend.trend12Weeks.direction === 'up' ? 'text-rose-400' : detail.trend.trend12Weeks.direction === 'down' ? 'text-emerald-400' : 'text-slate-400'}>{detail.trend.trend12Weeks.direction}</span> ({detail.trend.trend12Weeks.change > 0 ? '+' : ''}{detail.trend.trend12Weeks.change})
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={detail.trend.weeklyData}>
                        <defs>
                          <linearGradient id="tciGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#tciGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Monthly Pattern */}
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                    <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      Patrón mensual TCI
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">Mejor mes para viajar según estacionalidad</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={detail.monthly.map((v, i) => ({ mes: MONTHS[i], value: Math.round(v * 10) / 10 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="mes" stroke="#475569" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Factors + Recommendation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Factor Breakdown */}
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      Desglose de factores
                    </h3>
                    <div className="space-y-3">
                      {detail.tci.factors.map(f => {
                        const barColor = f.value > 100 ? 'bg-rose-500' : f.value < 100 ? 'bg-emerald-500' : 'bg-slate-500';
                        return (
                          <div key={f.label}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-300">{f.label}</span>
                              <span className={`font-medium ${
                                f.value > 100 ? 'text-rose-400' : f.value < 100 ? 'text-emerald-400' : 'text-slate-400'
                              }`}>
                                {f.value.toFixed(1)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${barColor} transition-all`}
                                style={{ width: `${Math.min(f.value / 2, 100)}%` }}
                              />
                            </div>
                            <div className="text-slate-500 text-xs mt-0.5">Peso: {(f.weight * 100).toFixed(0)}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommendation + Conflict */}
                  <div className="space-y-4">
                    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                      <h3 className="text-white font-semibold mb-2">Recomendación IA</h3>
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-300 text-sm whitespace-pre-line">{detail.tci.recommendation}</p>
                      </div>
                    </div>

                    {detail.conflict.isAffected && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                        <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Impacto de conflicto aéreo
                        </h3>
                        <div className="space-y-2 text-sm text-slate-300">
                          <p>Espacio cerrado: <span className="text-white font-medium">{detail.conflict.closedAirspace}</span></p>
                          <p>Motivo: <span className="text-white">{detail.conflict.reason}</span></p>
                          <p>Recargo combustible: <span className="text-rose-400 font-bold">+{detail.conflict.surchargePct}%</span></p>
                          <p>Tiempo extra: <span className="text-amber-400">+{detail.conflict.timeExtraHours}h</span></p>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-white font-semibold">Volatilidad</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          detail.trend.volatility === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                          detail.trend.volatility === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {detail.trend.volatility === 'low' ? 'Baja' : detail.trend.volatility === 'medium' ? 'Media' : 'Alta'}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {detail.trend.volatility === 'low' ? 'Precios estables, buena predictibilidad' :
                           detail.trend.volatility === 'medium' ? 'Variaciones moderadas esperadas' :
                           'Precios volátiles, monitorear semanalmente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-8 text-center text-slate-400">
                No se pudieron cargar los datos para {selectedCountry}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
