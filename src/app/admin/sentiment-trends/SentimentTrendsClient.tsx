'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, Globe } from 'lucide-react';

interface TrendEntry {
  countryCode: string;
  countryName: string;
  currentAvg: number | null;
  previousAvg: number | null;
  delta: number | null;
  currentSignals: number;
  previousSignals: number;
  direction: 'up' | 'down' | 'stable' | null;
}

interface TrendData {
  trends: TrendEntry[];
  summary: { totalTracked: number; improving: number; worsening: number; stable: number };
  timestamp: string;
}

function flagEmoji(code: string): string {
  if (code === 'uk') return '🇬🇧';
  const base = 127397;
  const chars = [...code.toUpperCase()];
  if (chars.length !== 2) return '🌍';
  return String.fromCodePoint(chars[0].charCodeAt(0) + base, chars[1].charCodeAt(0) + base);
}

function formatTone(v: number | null): string {
  if (v == null) return '—';
  return v > 0 ? `+${v}` : `${v}`;
}

export default function SentimentTrendsClient() {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'delta' | 'worsening'>('delta');
  const [filterDir, setFilterDir] = useState<'all' | 'down' | 'up'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sentiment-trends');
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = data?.trends.filter(t => {
    if (filterDir === 'down') return t.direction === 'down';
    if (filterDir === 'up') return t.direction === 'up';
    return true;
  }) ?? [];

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'worsening') return (a.delta ?? 0) - (b.delta ?? 0);
    return (b.delta ?? 0) - (a.delta ?? 0);
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              Tendencias de Sentimiento
            </h1>
            <p className="text-slate-400 text-sm mt-1">Delta semanal de tone_score por país (semana actual vs anterior)</p>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 text-sm disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Summary cards */}
        {data && !loading && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Países trackeados</p>
              <p className="text-2xl font-bold text-white mt-1">{data.summary.totalTracked}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Mejorando 😊</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{data.summary.improving}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Empeorando 😟</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{data.summary.worsening}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Estable 😐</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{data.summary.stable}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {(['all', 'down', 'up'] as const).map(f => (
              <button key={f} onClick={() => setFilterDir(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterDir === f ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                {f === 'all' ? 'Todos' : f === 'down' ? '😟 Empeoran' : '😊 Mejoran'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button onClick={() => setSortBy('worsening')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sortBy === 'worsening' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              Peores primero
            </button>
            <button onClick={() => setSortBy('delta')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sortBy === 'delta' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              Mejores primero
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-slate-600 animate-spin" /></div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">País</th>
                    <th className="text-center px-4 py-3 font-medium">Delta</th>
                    <th className="text-center px-4 py-3 font-medium">Semana actual</th>
                    <th className="text-center px-4 py-3 font-medium">Semana anterior</th>
                    <th className="text-center px-4 py-3 font-medium">Señales (actual)</th>
                    <th className="text-center px-4 py-3 font-medium">Señales (anterior)</th>
                    <th className="text-center px-4 py-3 font-medium">Dirección</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(entry => {
                    const dirIcon = entry.direction === 'up' ? '😊' : entry.direction === 'down' ? '😟' : '😐';
                    const dirColor = entry.direction === 'up' ? 'text-green-400' : entry.direction === 'down' ? 'text-red-400' : 'text-yellow-400';
                    const bgClass = entry.direction === 'down' ? 'bg-red-900/10' : entry.direction === 'up' ? 'bg-green-900/10' : '';
                    return (
                      <tr key={entry.countryCode} className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${bgClass}`}>
                        <td className="px-4 py-3">
                          <Link href={`/pais/${entry.countryCode}`} className="flex items-center gap-2 text-white font-medium hover:text-cyan-400 transition-colors">
                            <span className="text-lg">{flagEmoji(entry.countryCode)}</span>
                            {entry.countryName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-mono font-bold text-sm ${entry.delta == null ? 'text-slate-500' : entry.delta > 0 ? 'text-green-400' : entry.delta < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                            {entry.delta != null ? `${entry.delta > 0 ? '+' : ''}${entry.delta}` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-sm text-slate-200">{formatTone(entry.currentAvg)}</td>
                        <td className="px-4 py-3 text-center font-mono text-sm text-slate-400">{formatTone(entry.previousAvg)}</td>
                        <td className="px-4 py-3 text-center text-sm text-slate-300">{entry.currentSignals}</td>
                        <td className="px-4 py-3 text-center text-sm text-slate-500">{entry.previousSignals}</td>
                        <td className={`px-4 py-3 text-center text-lg ${dirColor}`}>{dirIcon}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {sorted.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Sin datos de tendencia disponibles</p>}
          </div>
        )}

        {data?.timestamp && !loading && (
          <p className="text-slate-600 text-xs text-center">Última actualización: {new Date(data.timestamp).toLocaleString('es-ES')}</p>
        )}
      </div>
    </div>
  );
}
