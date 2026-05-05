'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, BarChart3, Loader2, ChevronDown, ChevronUp, Filter, ExternalLink } from 'lucide-react';

interface TCIResult {
  code: string;
  name: string;
  bandera: string;
  tci: number;
  trend: string;
  region: string;
}

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

  useEffect(() => {
    fetch('/api/flight-costs?action=all')
      .then(r => r.json())
      .then(d => setCountries(d.countries || []))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Estimador de Coste con ML
          </h1>
          <p className="text-slate-400">
            Índice TCI calculado con demanda, petróleo Brent, estacionalidad, IPC y riesgo MAEC. Haz clic en un país para ver evolución cronológica, predicción ML y presupuesto detallado.
          </p>
        </div>

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
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Región</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">TCI</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Nivel</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Tendencia</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={c.code}
                      className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/coste/${c.code}`} className="flex items-center gap-2 group">
                          <span className="text-lg">{c.bandera}</span>
                          <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{c.name}</span>
                          <span className="text-slate-500 text-xs hidden sm:inline">({c.code})</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{c.region}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-lg" style={{ color: getTCIColor(c.tci) }}>{c.tci}</span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: getTCIColor(c.tci) + '20', color: getTCIColor(c.tci) }}
                        >
                          {getTCILabel(c.tci)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(c.trend)}
                          <span className="text-slate-300 text-xs">{c.trend}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/coste/${c.code}`}
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                        >
                          Ver análisis
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
