'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Newspaper, Activity, Calendar, ExternalLink, Clock, Shield, Globe, Loader2, Filter } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'alerta' | 'noticia' | 'osint' | 'evento';
  title: string;
  description: string;
  url?: string;
  source: string;
  date: string;
  country?: string;
  countryCode?: string;
  severity?: string;
  category?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-900/40 text-red-300 border-red-700/40',
  high: 'bg-red-800/30 text-red-400 border-red-700/30',
  medium: 'bg-orange-800/30 text-orange-400 border-orange-700/30',
  low: 'bg-yellow-800/20 text-yellow-400 border-yellow-700/20',
};

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  alerta: { icon: '🛡️', label: 'Alerta MAEC', color: 'border-l-red-500' },
  noticia: { icon: '📰', label: 'Noticia', color: 'border-l-blue-500' },
  osint: { icon: '🔍', label: 'OSINT', color: 'border-l-purple-500' },
  evento: { icon: '📅', label: 'Evento', color: 'border-l-emerald-500' },
};

export default function FeedClient() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError('');

      try {
        const [alertsRes, newsRes, osintRes, eventsRes] = await Promise.allSettled([
          fetch('/api/maec?alerts=true').then(r => r.json()),
          fetch('/api/news?max=5').then(r => r.json()),
          fetch('/api/osint/signals?limit=10').then(r => r.json()),
          fetch('/api/events?limit=5').then(r => r.json()),
        ]);

        const feed: FeedItem[] = [];

        if (alertsRes.status === 'fulfilled' && alertsRes.value.alerts) {
          for (const a of alertsRes.value.alerts) {
            feed.push({
              id: 'alerta-' + (a.id || Math.random().toString(36).slice(2)),
              type: 'alerta',
              title: a.title || a.alert || 'Alerta de viaje',
              description: a.description || a.alert || '',
              url: a.url || a.link || '',
              source: 'MAEC',
              date: a.publishedAt || a.date || new Date().toISOString(),
              country: a.country || '',
              countryCode: a.countryCode || '',
              severity: a.riskLevel || a.severity || 'medium',
            });
          }
        }

        if (newsRes.status === 'fulfilled' && newsRes.value.alerts) {
          for (const n of newsRes.value.alerts) {
            feed.push({
              id: 'noticia-' + Math.random().toString(36).slice(2),
              type: 'noticia',
              title: n.title,
              description: n.description || '',
              url: n.url,
              source: n.source || 'GNews',
              date: n.publishedAt,
              category: n.category,
            });
          }
        }

        if (osintRes.status === 'fulfilled' && Array.isArray(osintRes.value)) {
          for (const s of osintRes.value) {
            feed.push({
              id: 'osint-' + (s.id || Math.random().toString(36).slice(2)),
              type: 'osint',
              title: s.title || s.summary?.slice(0, 100) || 'Señal OSINT',
              description: s.summary || '',
              url: s.url || '',
              source: s.source_type || 'OSINT',
              date: s.published_at || s.created_at || new Date().toISOString(),
              country: s.country_name || '',
              countryCode: s.country_code || '',
              severity: s.urgency || 'low',
            });
          }
        }

        if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value)) {
          for (const e of eventsRes.value) {
            feed.push({
              id: 'evento-' + (e.id || Math.random().toString(36).slice(2)),
              type: 'evento',
              title: e.title || e.name || 'Evento',
              description: e.description || e.summary || '',
              url: e.url || '',
              source: e.source || 'Eventos',
              date: e.start_date || e.date || new Date().toISOString(),
              country: e.country_name || '',
              countryCode: e.country_code || '',
              category: e.category || e.type || '',
            });
          }
        }

        feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setItems(feed);
      } catch {
        setError('Error al cargar el feed');
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);
  const counts = {
    all: items.length,
    alerta: items.filter(i => i.type === 'alerta').length,
    noticia: items.filter(i => i.type === 'noticia').length,
    osint: items.filter(i => i.type === 'osint').length,
    evento: items.filter(i => i.type === 'evento').length,
  };

  function timeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    if (isNaN(date)) return '';
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `hace ${days}d`;
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Feed de Viaje</h1>
          <p className="text-slate-400 text-sm">
            Alertas MAEC, noticias, señales OSINT y eventos relevantes para viajeros, todo en un solo lugar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', icon: <Filter className="w-4 h-4" />, label: 'Todo', count: counts.all },
            { id: 'alerta', icon: <Shield className="w-4 h-4" />, label: 'Alertas', count: counts.alerta },
            { id: 'noticia', icon: <Newspaper className="w-4 h-4" />, label: 'Noticias', count: counts.noticia },
            { id: 'osint', icon: <Activity className="w-4 h-4" />, label: 'OSINT', count: counts.osint },
            { id: 'evento', icon: <Calendar className="w-4 h-4" />, label: 'Eventos', count: counts.evento },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-slate-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Globe className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No hay elementos en el feed.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {filtered.map((item) => {
              const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.noticia;
              const severityColor = item.severity ? SEVERITY_COLORS[item.severity] : '';
              return (
                <div
                  key={item.id}
                  className={`bg-slate-800/60 rounded-lg border border-slate-700/50 border-l-4 ${config.color} hover:bg-slate-700/50 transition-colors`}
                >
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block p-4">
                      <FeedContent item={item} config={config} severityColor={severityColor} timeAgo={timeAgo} />
                    </a>
                  ) : (
                    <div className="p-4">
                      <FeedContent item={item} config={config} severityColor={severityColor} timeAgo={timeAgo} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedContent({ item, config, severityColor, timeAgo }: {
  item: FeedItem;
  config: { icon: string; label: string; color: string };
  severityColor: string;
  timeAgo: (d: string) => string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg mt-0.5 shrink-0">{config.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{config.label}</span>
          {severityColor && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${severityColor}`}>
              {item.severity}
            </span>
          )}
          {item.category && (
            <span className="text-[10px] text-slate-600">{item.category}</span>
          )}
        </div>
        <h3 className="text-sm font-medium text-white leading-snug mb-1">{item.title}</h3>
        {item.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{item.description}</p>
        )}
        <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(item.date)}
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {item.source}
          </span>
          {item.country && (
            <span>{item.country}</span>
          )}
          {item.url && (
            <span className="flex items-center gap-1 text-blue-400">
              <ExternalLink className="w-3 h-3" />
              Abrir
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
