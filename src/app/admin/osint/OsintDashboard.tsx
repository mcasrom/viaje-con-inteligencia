'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle, Shield, Cloud, HeartPulse, Truck, Globe, ExternalLink, Clock, MapPin, Zap } from 'lucide-react';

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  salud: { icon: HeartPulse, color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Salud' },
  seguridad: { icon: Shield, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: 'Seguridad' },
  clima: { icon: Cloud, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Clima' },
  logistico: { icon: Truck, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', label: 'Logístico' },
  geopolitico: { icon: Globe, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'Geopolítico' },
  otro: { icon: AlertTriangle, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', label: 'Otro' },
};

const URGENCY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: 'bg-red-500 text-white', label: 'CRÍTICA' },
  high: { color: 'bg-orange-500 text-white', label: 'ALTA' },
  medium: { color: 'bg-yellow-500 text-slate-900', label: 'MEDIA' },
  low: { color: 'bg-slate-600 text-slate-300', label: 'BAJA' },
};

interface OsintSignal {
  id: string;
  source: string;
  source_url: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  category: string;
  confidence: number;
  is_first_person: boolean;
  urgency: string;
  summary: string;
  location_name: string;
  created_at: string;
}

export default function OsintDashboard() {
  const [signals, setSignals] = useState<OsintSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState({ total: 0, urgent: 0, firstPerson: 0 });
  const [filter, setFilter] = useState<string>('all');
  const [scanResult, setScanResult] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/osint/signals');
      const data = await res.json();
      setSignals(data.signals || []);
      setStats(data.stats || { total: 0, urgent: 0, firstPerson: 0 });
    } catch (e) {
      console.error('[OSINT] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/cron/osint-sensor', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}` },
      });
      const data = await res.json();
      setScanResult(data);
      await fetchData();
    } catch (e) {
      console.error('[OSINT] Scan error:', e);
    } finally {
      setScanning(false);
    }
  };

  const filtered = filter === 'all' ? signals : signals.filter(s => s.category === filter);
  const categories = ['all', 'salud', 'seguridad', 'clima', 'logistico', 'geopolitico', 'otro'];

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)}d`;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-500/20">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">OSINT Sensor</span>
            </div>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Escaneando...' : 'Escanear ahora'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-slate-500 text-xs mt-1">Señales totales</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{stats.urgent}</div>
            <div className="text-slate-500 text-xs mt-1">Urgentes (24h)</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">{stats.firstPerson}</div>
            <div className="text-slate-500 text-xs mt-1">Primera persona</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-2xl font-bold text-cyan-400">{signals.filter(s => s.source === 'reddit').length}</div>
            <div className="text-slate-500 text-xs mt-1">Reddit detectadas</div>
          </div>
        </div>

        {/* Scan result */}
        {scanResult && (
          <div className="bg-slate-900 rounded-xl p-4 border border-cyan-500/20 mb-6">
            <h3 className="text-cyan-400 font-bold text-sm mb-2">Último escaneo</h3>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div><span className="text-slate-500">Duración:</span> <span className="text-white">{scanResult.elapsed}</span></div>
              <div><span className="text-slate-500">Posts encontrados:</span> <span className="text-white">{scanResult.postsFetched}</span></div>
              <div><span className="text-slate-500">Nuevos:</span> <span className="text-green-400">{scanResult.newPosts}</span></div>
              <div><span className="text-slate-500">Insertados:</span> <span className="text-green-400">{scanResult.signalsInserted}</span></div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => {
            const config = CATEGORY_CONFIG[cat === 'all' ? 'otro' : cat];
            const count = cat === 'all' ? signals.length : signals.filter(s => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === cat
                    ? cat === 'all'
                      ? 'bg-slate-700 text-white'
                      : `${config.color}`
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat !== 'all' && config && <config.icon className="w-3 h-3" />}
                {cat === 'all' ? 'Todas' : config.label}
                <span className="ml-1 opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Signals list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
            <p className="text-slate-400 text-sm">No hay señales registradas.</p>
            <p className="text-slate-600 text-xs mt-2">Haz click en "Escanear ahora" para buscar en Reddit.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(signal => {
              const config = CATEGORY_CONFIG[signal.category] || CATEGORY_CONFIG.otro;
              const urgencyConf = URGENCY_CONFIG[signal.urgency] || URGENCY_CONFIG.low;
              const Icon = config.icon;

              return (
                <div
                  key={signal.id}
                  className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-white font-medium text-sm truncate">{signal.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${urgencyConf.color}`}>
                            {urgencyConf.label}
                          </span>
                          {signal.is_first_person && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                              👁️ 1ª persona
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs leading-snug line-clamp-2">{signal.summary}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(signal.created_at)}
                          </span>
                          {signal.subreddit && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              r/{signal.subreddit}
                            </span>
                          )}
                          {signal.location_name && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {signal.location_name}
                            </span>
                          )}
                          <span>Confianza: {Math.round(signal.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    {signal.source_url && (
                      <a
                        href={signal.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-cyan-400 transition-colors shrink-0"
                        title="Ver fuente original"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
