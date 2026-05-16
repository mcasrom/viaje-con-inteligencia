'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity, AlertTriangle, TrendingDown, TrendingUp, Minus,
  Globe, RefreshCw, Shield, AlertCircle, Info,
} from 'lucide-react';

interface SentimentEntry {
  countryCode: string;
  countryName: string;
  avgTone: number | null;
  signals: number;
  positive: number;
  negative: number;
  neutral: number;
  mood: 'positive' | 'negative' | 'neutral' | null;
}

interface HeatmapEntry {
  country: string;
  level: number;
  label: string;
  signals24h: number;
  spike: number;
  reasons: string[];
  keywords: string[];
}

interface TopDrop {
  countryCode: string;
  countryName: string;
  drop: number;
  recentAvg: number;
  olderAvg: number;
}

interface GlobalData {
  sentimentRanking: SentimentEntry[];
  heatmapAlerts: HeatmapEntry[];
  topDrops: TopDrop[];
  summary: {
    totalSignals: number;
    countriesTracked: number;
    criticalAlerts: number;
  };
  timestamp: string;
}

function flagEmoji(code: string): string {
  if (code === 'uk') return '🇬🇧';
  const base = 127397;
  const chars = [...code.toUpperCase()];
  if (chars.length !== 2) return '🌍';
  return String.fromCodePoint(chars[0].charCodeAt(0) + base, chars[1].charCodeAt(0) + base);
}

function moodEmoji(mood: string | null): string {
  switch (mood) {
    case 'positive': return '😊';
    case 'negative': return '😟';
    case 'neutral': return '😐';
    default: return '—';
  }
}

const LEVEL_CONFIG: Record<number, { color: string; bg: string; border: string; label: string }> = {
  1: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Leve' },
  2: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Monitorizar' },
  3: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Alerta temprana' },
};

export default function PulsoGlobalClient() {
  const [data, setData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'heatmap' | 'sentiment' | 'drops'>('heatmap');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pulso-global');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-cyan-400" />
              Pulso Global
            </h1>
            <p className="text-slate-400 mt-1">
              Alertas en vivo y sentimiento país por país desde GDELT, RSS y fuentes OSINT
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Summary cards */}
        {data && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Señales (7d)</p>
              <p className="text-2xl font-bold text-white mt-1">{data.summary.totalSignals}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Países trackeados</p>
              <p className="text-2xl font-bold text-white mt-1">{data.summary.countriesTracked}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Alertas críticas</p>
              <p className={`text-2xl font-bold mt-1 ${data.summary.criticalAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {data.summary.criticalAlerts}
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Caídas de sentimiento</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{data.topDrops.length}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          {[
            { key: 'heatmap', icon: AlertTriangle, label: 'Mapa de Calor', count: data?.heatmapAlerts.length },
            { key: 'sentiment', icon: Globe, label: 'Ranking Sentimiento', count: data?.sentimentRanking.length },
            { key: 'drops', icon: TrendingDown, label: 'Caídas', count: data?.topDrops.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count != null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  t.key === 'heatmap' && t.count > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700/50 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 font-medium">Error al cargar datos</p>
            <p className="text-red-400/70 text-sm mt-1">{error}</p>
            <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 text-sm">
              Reintentar
            </button>
          </div>
        ) : !data ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center">
            <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No hay datos disponibles</p>
          </div>
        ) : (
          <>
            {/* Tab: Heatmap */}
            {tab === 'heatmap' && (
              <div className="space-y-4">
                {data.heatmapAlerts.length === 0 ? (
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
                    <Shield className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <p className="text-green-400 font-semibold">Sin alertas activas</p>
                    <p className="text-slate-400 text-sm mt-1">No se detectan picos anómalos en las últimas 24h</p>
                  </div>
                ) : (
                  data.heatmapAlerts.map((alert, i) => {
                    const lvl = LEVEL_CONFIG[alert.level] || LEVEL_CONFIG[1];
                    return (
                      <div key={i} className={`rounded-2xl border ${lvl.bg} ${lvl.border} p-5`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`w-5 h-5 ${lvl.color}`} />
                            <div>
                              <h3 className="text-white font-bold text-lg">{alert.country}</h3>
                              <span className={`text-xs font-medium ${lvl.color}`}>{lvl.label}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-xs">{alert.signals24h} señales / 24h</p>
                            <p className="text-slate-500 text-xs">x{alert.spike} vs baseline</p>
                          </div>
                        </div>
                        {alert.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {alert.reasons.map((r, j) => (
                              <span key={j} className={`px-2 py-1 rounded text-xs ${lvl.bg} ${lvl.color} border ${lvl.border}`}>
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                        {alert.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {alert.keywords.map((kw, j) => (
                              <span key={j} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[11px]">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab: Sentiment Ranking */}
            {tab === 'sentiment' && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3 font-medium">#</th>
                        <th className="text-left px-4 py-3 font-medium">País</th>
                        <th className="text-center px-4 py-3 font-medium">Clima</th>
                        <th className="text-center px-4 py-3 font-medium">Sentimiento</th>
                        <th className="text-center px-4 py-3 font-medium">Señales</th>
                        <th className="text-center px-4 py-3 font-medium">😊</th>
                        <th className="text-center px-4 py-3 font-medium">😐</th>
                        <th className="text-center px-4 py-3 font-medium">😟</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sentimentRanking.map((entry, i) => (
                        <tr key={entry.countryCode} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 text-slate-500 text-sm">{i + 1}</td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/pais/${entry.countryCode}`}
                              className="flex items-center gap-2 text-white font-medium hover:text-cyan-400 transition-colors"
                            >
                              <span className="text-lg">{flagEmoji(entry.countryCode)}</span>
                              {entry.countryName}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-center text-xl">{moodEmoji(entry.mood)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-mono font-bold ${
                              entry.avgTone == null ? 'text-slate-500' :
                              entry.avgTone > 3 ? 'text-green-400' :
                              entry.avgTone < -3 ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {entry.avgTone != null ? `${entry.avgTone > 0 ? '+' : ''}${entry.avgTone}` : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-300 text-sm">{entry.signals}</td>
                          <td className="px-4 py-3 text-center text-green-400 text-sm">{entry.positive}</td>
                          <td className="px-4 py-3 text-center text-yellow-400 text-sm">{entry.neutral}</td>
                          <td className="px-4 py-3 text-center text-red-400 text-sm">{entry.negative}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Top Drops */}
            {tab === 'drops' && (
              <div className="space-y-3">
                {data.topDrops.length === 0 ? (
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
                    <TrendingUp className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <p className="text-green-400 font-semibold">Sin caídas significativas</p>
                    <p className="text-slate-400 text-sm mt-1">Ningún país muestra un empeoramiento de sentimiento esta semana</p>
                  </div>
                ) : (
                  data.topDrops.map((drop, i) => (
                    <div key={i} className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/pais/${drop.countryCode}`}
                          className="flex items-center gap-3 hover:text-cyan-400 transition-colors"
                        >
                          <span className="text-2xl">{flagEmoji(drop.countryCode)}</span>
                          <div>
                            <h3 className="text-white font-bold">{drop.countryName}</h3>
                            <p className="text-slate-400 text-xs">
                              Antes: {drop.olderAvg > 0 ? '+' : ''}{drop.olderAvg} → Ahora: {drop.recentAvg > 0 ? '+' : ''}{drop.recentAvg}
                            </p>
                          </div>
                        </Link>
                        <div className="text-right">
                          <p className="text-red-400 font-bold text-lg">-{drop.drop}</p>
                          <p className="text-slate-500 text-xs">puntos</p>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, drop.drop * 8)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Timestamp */}
        {data?.timestamp && !loading && (
          <p className="text-slate-600 text-xs text-center">
            Última actualización: {new Date(data.timestamp).toLocaleString('es-ES')}
          </p>
        )}

        {/* Info footer */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-slate-500 text-xs leading-relaxed">
            Datos agregados de señales OSINT (GDELT, RSS, Reddit, GDACS, USGS) de los últimos 7 días.
            El sentimiento se basa en el tone_score de GDELT (-10 a +10).
            El mapa de calor detecta picos de volumen y caídas de sentimiento en ventanas de 24h vs 7 días.
          </p>
        </div>
      </div>
    </div>
  );
}
