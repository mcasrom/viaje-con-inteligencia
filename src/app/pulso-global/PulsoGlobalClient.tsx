'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Activity, AlertTriangle, TrendingDown, TrendingUp, Minus,
  Globe, RefreshCw, Shield, AlertCircle, Info, ChevronDown, ChevronUp,
  Map as MapIcon, ListOrdered,
} from 'lucide-react';

const PulsoGlobalMap = dynamic(() => import('@/components/PulsoGlobalMap'), { ssr: false });

interface SentimentEntry {
  countryCode: string;
  countryName: string;
  coordinates: [number, number] | null;
  avgTone: number | null;
  signals: number;
  positive: number;
  negative: number;
  neutral: number;
  mood: 'positive' | 'negative' | 'neutral' | null;
}

interface HeatmapEntry {
  country: string;
  countryCode?: string;
  coordinates: [number, number] | null;
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
  coordinates: [number, number] | null;
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

const LEVEL_CONFIG: Record<number, { color: string; bg: string; border: string }> = {
  1: { color: '#facc15', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  2: { color: '#fb923c', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  3: { color: '#f87171', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const ALERT_KEYWORDS_DISPLAY = [
  { kw: 'huelga / strike', icon: '⚡', cat: 'Transporte' },
  { kw: 'protesta / protest', icon: '✊', cat: 'Social' },
  { kw: 'inundación / flood', icon: '🌊', cat: 'Clima' },
  { kw: 'terremoto / earthquake', icon: '🌍', cat: 'Desastre' },
  { kw: 'incendio / fire', icon: '🔥', cat: 'Clima' },
  { kw: 'huracán / hurricane', icon: '🌀', cat: 'Clima' },
  { kw: 'brote / outbreak', icon: '🦠', cat: 'Salud' },
  { kw: 'cancelado / cancelled', icon: '✈️', cat: 'Transporte' },
  { kw: 'atentado / attack', icon: '💥', cat: 'Seguridad' },
  { kw: 'cierre / closure', icon: '🚧', cat: 'Logística' },
  { kw: 'estafa / scam', icon: '⚠️', cat: 'Seguridad' },
  { kw: 'evacuación', icon: '🏃', cat: 'Emergencia' },
];

function CollapsibleSection({
  title, icon, count, countColor, defaultOpen, children,
}: {
  title: string; icon: React.ReactNode; count?: number; countColor?: string; defaultOpen: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-white font-bold text-lg">{title}</span>
          {count != null && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${countColor || 'bg-slate-700 text-slate-300'}`}>
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function PulsoGlobalClient() {
  const [data, setData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapMode, setMapMode] = useState<'sentiment' | 'heatmap'>('sentiment');

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

  const mapCountries = data?.sentimentRanking.filter(e => e.coordinates).length || 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700 p-6 md:p-8">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-cyan-400" />
              Pulso Global
            </h1>
            <p className="text-slate-300 mt-3 max-w-2xl leading-relaxed">
              Monitor en vivo del clima de seguridad y sentimiento en destinos de todo el mundo.
              Analizamos miles de señales OSINT diarias —GDELT, RSS, Reddit, GDACS, USGS— para
              detectar <strong className="text-cyan-400">alertas tempranas</strong>, medir el
              <strong className="text-green-400"> sentimiento país por país</strong> y avisarte
              de <strong className="text-orange-400">caídas repentinas</strong> antes de que
              afecten tu viaje.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { label: 'Fuentes', value: 'GDELT, RSS, Reddit, GDACS, USGS', icon: '📡' },
                { label: 'Señales analizadas', value: data ? `${data.summary.totalSignals} (7d)` : '—', icon: '📊' },
                { label: 'Países trackeados', value: data ? `${data.summary.countriesTracked}` : '—', icon: '🌍' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 bg-slate-700/50 rounded-xl px-3 py-2 border border-slate-600/50">
                  <span>{s.icon}</span>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                    <p className="text-xs text-slate-200 font-medium">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {data && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Señales (7d)</p>
              <p className="text-2xl font-bold text-white mt-1">{data.summary.totalSignals}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Países con datos</p>
              <p className="text-2xl font-bold text-white mt-1">{data.summary.countriesTracked}</p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Alertas activas</p>
              <p className={`text-2xl font-bold mt-1 ${data.heatmapAlerts.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {data.heatmapAlerts.length}
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs">Caídas sentimiento</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{data.topDrops.length}</p>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <MapIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-bold text-lg">Mapa Global</span>
              {!loading && data && (
                <span className="text-xs text-slate-500">{mapCountries} países en mapa</span>
              )}
            </div>
            <div className="flex gap-1 bg-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setMapMode('sentiment')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mapMode === 'sentiment' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Sentimiento
              </button>
              <button
                onClick={() => setMapMode('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mapMode === 'heatmap' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Alertas
              </button>
            </div>
          </div>
          <div className="relative">
            {loading ? (
              <div className="flex items-center justify-center h-[400px] bg-slate-900">
                <RefreshCw className="w-8 h-8 text-slate-600 animate-spin" />
              </div>
            ) : data ? (
              <div className="h-[400px] md:h-[500px]">
                <PulsoGlobalMap data={data} mode={mapMode} />
              </div>
            ) : null}
            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 rounded-xl px-3 py-2 border border-slate-700 text-xs space-y-1">
              {mapMode === 'sentiment' ? (
                <>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400" /> Positivo ({'>'}3)</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Neutral</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400" /> Negativo ({'<'} -3)</div>
                  <div className="text-slate-500 text-[10px] mt-1">Tamaño = nº señales</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400" /> Alerta temprana</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400" /> Monitorizar</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Leve</div>
                </>
              )}
            </div>
            {/* Refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="absolute top-3 right-3 z-[1000] bg-slate-900/90 rounded-xl p-2 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable: Heatmap Alerts */}
        {data && !loading && (
          <CollapsibleSection
            title="Alertas activas"
            icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
            count={data.heatmapAlerts.length}
            countColor={data.heatmapAlerts.length > 0 ? 'bg-red-500/20 text-red-400' : undefined}
            defaultOpen={data.heatmapAlerts.length > 0}
          >
            {data.heatmapAlerts.length === 0 ? (
              <div className="text-center py-6">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Sin alertas activas</p>
                <p className="text-slate-400 text-sm mt-1">No se detectan picos anómalos en las últimas 24h</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.heatmapAlerts.map((alert, i) => {
                  const lvl = LEVEL_CONFIG[alert.level] || LEVEL_CONFIG[1];
                  const lvlEmoji = alert.level === 3 ? '🔴' : alert.level === 2 ? '🟠' : '🟡';
                  return (
                    <div key={i} className={`rounded-xl border ${lvl.bg} ${lvl.border} p-4`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{lvlEmoji}</span>
                          <div>
                            <h3 className="text-white font-bold">{alert.country}</h3>
                            <span className="text-xs font-medium" style={{ color: lvl.color }}>{alert.label}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">{alert.signals24h} señales / 24h</p>
                          <p className="text-slate-500 text-xs">x{alert.spike} vs baseline</p>
                        </div>
                      </div>
                      {alert.reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {alert.reasons.map((r, j) => (
                            <span key={j} className={`px-2 py-0.5 rounded text-xs ${lvl.bg}`} style={{ color: lvl.color }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                      {alert.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {alert.keywords.map((kw, j) => (
                            <span key={j} className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                      {alert.countryCode && (
                        <Link href={`/pais/${alert.countryCode}`} className="inline-block mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                          Ver detalle →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Expandable: Sentiment Ranking */}
        {data && !loading && (
          <CollapsibleSection
            title="Ranking de sentimiento"
            icon={<Globe className="w-5 h-5 text-green-400" />}
            count={data.sentimentRanking.length}
            defaultOpen={false}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-3 py-2 font-medium">País</th>
                    <th className="text-center px-3 py-2 font-medium">Clima</th>
                    <th className="text-center px-3 py-2 font-medium">Sentimiento</th>
                    <th className="text-center px-3 py-2 font-medium">Señales</th>
                    <th className="text-center px-3 py-2 font-medium hidden md:table-cell">😊</th>
                    <th className="text-center px-3 py-2 font-medium hidden md:table-cell">😐</th>
                    <th className="text-center px-3 py-2 font-medium hidden md:table-cell">😟</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sentimentRanking.map((entry, i) => {
                    const moodEmoji = entry.mood === 'positive' ? '😊' : entry.mood === 'negative' ? '😟' : '😐';
                    return (
                      <tr key={entry.countryCode} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="px-3 py-2.5">
                          <Link
                            href={`/pais/${entry.countryCode}`}
                            className="flex items-center gap-2 text-white font-medium hover:text-cyan-400 transition-colors"
                          >
                            <span className="text-lg">{flagEmoji(entry.countryCode)}</span>
                            <span className="text-sm">{entry.countryName}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-center text-lg">{moodEmoji}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`font-mono font-bold text-sm ${
                            entry.avgTone == null ? 'text-slate-500' :
                            entry.avgTone > 3 ? 'text-green-400' :
                            entry.avgTone < -3 ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {entry.avgTone != null ? `${entry.avgTone > 0 ? '+' : ''}${entry.avgTone}` : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-300 text-sm">{entry.signals}</td>
                        <td className="px-3 py-2.5 text-center text-green-400 text-sm hidden md:table-cell">{entry.positive}</td>
                        <td className="px-3 py-2.5 text-center text-yellow-400 text-sm hidden md:table-cell">{entry.neutral}</td>
                        <td className="px-3 py-2.5 text-center text-red-400 text-sm hidden md:table-cell">{entry.negative}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

        {/* Expandable: Top Drops */}
        {data && !loading && (
          <CollapsibleSection
            title="Caídas de sentimiento"
            icon={<TrendingDown className="w-5 h-5 text-orange-400" />}
            count={data.topDrops.length}
            defaultOpen={false}
          >
            {data.topDrops.length === 0 ? (
              <div className="text-center py-6">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Sin caídas significativas</p>
                <p className="text-slate-400 text-sm">Ningún país muestra empeoramiento de sentimiento esta semana</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.topDrops.map((drop, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/pais/${drop.countryCode}`}
                        className="flex items-center gap-3 hover:text-cyan-400 transition-colors"
                      >
                        <span className="text-2xl">{flagEmoji(drop.countryCode)}</span>
                        <div>
                          <h3 className="text-white font-bold">{drop.countryName}</h3>
                          <p className="text-slate-400 text-xs">
                            Antes: {drop.olderAvg > 0 ? '+' : ''}{drop.olderAvg}
                            {' → '}
                            Ahora: {drop.recentAvg > 0 ? '+' : ''}{drop.recentAvg}
                          </p>
                        </div>
                      </Link>
                      <div className="text-right">
                        <p className="text-red-400 font-bold text-lg">-{drop.drop}</p>
                        <p className="text-slate-500 text-xs">puntos</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, drop.drop * 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Keywords detection */}
        <CollapsibleSection
          title="Palabras clave monitorizadas"
          icon={<ListOrdered className="w-5 h-5 text-purple-400" />}
          defaultOpen={false}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {ALERT_KEYWORDS_DISPLAY.map(k => (
              <div key={k.kw} className="bg-slate-700/50 rounded-xl px-3 py-2 border border-slate-600/50 flex items-center gap-2">
                <span>{k.icon}</span>
                <div>
                  <p className="text-xs text-white font-medium">{k.kw}</p>
                  <p className="text-[10px] text-slate-500">{k.cat}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-3">
            + detección de países por nombre en español e inglés en todas las señales. Más de 12 categorías de alerta.
          </p>
        </CollapsibleSection>

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
            El sentimiento se basa en el tone_score de GDELT (-10 a +10, donde valores positivos indican cobertura favorable
            y negativos señalan crisis o conflictos). El mapa de calor detecta picos de volumen y caídas de sentimiento
            en ventanas de 24h comparadas con la media de 7 días. Los datos se refrescan con cada carga de página.
          </p>
        </div>
      </div>
    </div>
  );
}
