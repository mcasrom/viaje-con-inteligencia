'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle, Shield, Cloud, HeartPulse, Truck, Globe, MapPin, Clock, Sparkles } from 'lucide-react';
import DataRating from '@/components/DataRating';
import AirportDelaysWidget from '@/components/AirportDelaysWidget';

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  terrorism: { label: 'Terrorismo', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  airspace_closure: { label: 'Cierre aéreo', icon: Cloud, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  conflict: { label: 'Conflicto', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  natural_disaster: { label: 'Desastre natural', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  flight_disruption: { label: 'Disrupción vuelos', icon: Truck, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  health_outbreak: { label: 'Alerta sanitaria', icon: HeartPulse, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  protest: { label: 'Protestas/Huelgas', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  travel_advisory: { label: 'Aviso de viaje', icon: AlertTriangle, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  security_threat: { label: 'Amenaza seguridad', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  infrastructure: { label: 'Infraestructura', icon: Truck, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

const SEVERITY_CONFIG: Record<string, { label: string; badge: string; pulse: boolean }> = {
  critical: { label: 'CRÍTICO', badge: 'bg-red-500/20 text-red-400 border-red-500/30', pulse: true },
  high: { label: 'ALTO', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', pulse: false },
  medium: { label: 'MEDIO', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', pulse: false },
  low: { label: 'BAJO', badge: 'bg-green-500/20 text-green-400 border-green-500/30', pulse: false },
};

interface Incident {
  id: number;
  type: string;
  entity_id: string;
  title: string;
  description: string;
  country_code: string | null;
  location: string | null;
  severity: string;
  recommendation: string;
  action_verb: string;
  analyst_note: string | null;
  analyst_updated_at: string | null;
  source: string;
  signal_count: number;
  detected_at: string;
  resolved_at: string | null;
  rating: number;
  ratingCount: number;
}

interface Signal {
  id: string;
  source: string;
  title: string;
  summary: string | null;
  location_name: string | null;
  tone_score: number;
  urgency: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${Math.floor(hours / 24)}d`;
}

function getCountryFlag(code: string | null): string {
  if (!code || code === 'unknown') return '';
  try {
    return code
      .toUpperCase()
      .split('')
      .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  } catch {
    return '';
  }
}

export default function OsintFeed() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const [incRes, sigRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/osint/signals?limit=15'),
      ]);
      const incData = await incRes.json();
      const sigData = await sigRes.json();
      setIncidents(incData.incidents || []);
      setSignals(sigData.signals || []);
      setLastUpdate(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('[OSINT] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filtered = filter === 'all'
    ? incidents
    : incidents.filter(i => i.type === filter);

  const types = [...new Set(incidents.map(i => i.type))];

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                Inicio
              </Link>
              <div className="h-4 w-px bg-slate-700" />
              <h1 className="text-lg font-semibold text-white">Inteligencia de Viaje</h1>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <span className="text-slate-500 text-xs">Actualizado: {lastUpdate}</span>
              )}
              <button
                onClick={fetchIncidents}
                disabled={loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <p className="text-slate-400 text-sm mb-4">
            Incidentes activos detectados automáticamente. Recomendaciones basadas en datos OSINT en tiempo real.
          </p>

          {types.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Todos ({incidents.length})
              </button>
              {types.map(type => {
                const config = TYPE_CONFIG[type];
                const count = incidents.filter(i => i.type === type).length;
                if (!config || count === 0) return null;
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === type
                        ? `${config.bg} ${config.color} border ${config.border}`
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Sentimiento GDELT */}
        {signals.length > 0 && (
          <div className="mb-6 bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Sentimiento GDELT</h2>
              <span className="text-[10px] text-slate-500">últimas señales con análisis de tono</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {signals.map(s => {
                const toneColor = s.tone_score < -5 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  s.tone_score < 0 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  s.tone_score > 5 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  'bg-slate-500/20 text-slate-400 border-slate-500/30';
                return (
                  <div
                    key={s.id}
                    className="bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50 max-w-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${toneColor}`}>
                        {s.tone_score > 0 ? '+' : ''}{Math.round(s.tone_score)}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">{s.source}</span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{s.summary || s.title}</p>
                    {s.location_name && (
                      <p className="text-[10px] text-slate-500 mt-1">📍 {s.location_name}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Airport Delays Widget */}
        <div className="mb-8">
          <AirportDelaysWidget />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900 rounded-xl p-12 border border-slate-800 text-center">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sin incidentes activos</h2>
            <p className="text-slate-400">No hay alertas que afecten a viajeros en este momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(incident => {
              const config = TYPE_CONFIG[incident.type] || TYPE_CONFIG.travel_advisory;
              const sevConf = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.low;
              const Icon = config.icon;

              return (
                <div
                  key={incident.id}
                  className={`bg-slate-900 rounded-xl border ${sevConf.pulse ? 'animate-pulse border-red-500/30' : 'border-slate-800 hover:border-slate-700'} transition-colors overflow-hidden`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg ${config.bg} ${config.border} border flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <h3 className="text-white font-semibold text-base">{incident.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sevConf.badge}`}>
                              {sevConf.label}
                            </span>
                            {incident.country_code && (
                              <span className="text-lg" title={incident.country_code}>
                                {getCountryFlag(incident.country_code)}
                              </span>
                            )}
                          </div>
                        </div>

                        {incident.location && (
                          <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                            <MapPin className="w-3 h-3" />
                            {incident.location}
                          </div>
                        )}

                        {/* Recomendación clara */}
                        <div className={`mt-3 p-3 rounded-lg border ${config.bg} ${config.border}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className={`w-3.5 h-3.5 ${config.color}`} />
                            <span className={`text-xs font-semibold ${config.color}`}>
                              Que hacer: {incident.action_verb}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {incident.recommendation}
                          </p>
                        </div>

                        {/* Nota del analista */}
                        {incident.analyst_note && (
                          <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-blue-400 text-xs font-semibold">
                                Nota del analista
                              </span>
                              {incident.analyst_updated_at && (
                                <span className="text-slate-500 text-xs">
                                  {new Date(incident.analyst_updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                              {incident.analyst_note}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(incident.detected_at)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                              {incident.source}
                            </span>
                            {incident.signal_count > 1 && (
                              <span className="text-slate-500">
                                {incident.signal_count} fuentes
                              </span>
                            )}
                          </div>
                          <DataRating
                            entityType="incident"
                            entityId={`incident-${incident.id}`}
                            size="sm"
                            showCount={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-600 text-xs">
            Datos actualizados cada 6h vía cron automático. Fuentes: GDELT, USGS, GDACS, RSS, Reddit.
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Esta información no sustituye avisos oficiales del MAEC o embajadas.
          </p>
        </footer>
      </main>
    </div>
  );
}
