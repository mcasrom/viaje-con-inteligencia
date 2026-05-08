'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, AlertTriangle, Music, Trophy, Briefcase, Globe, Star } from 'lucide-react';

interface Event {
  id: number;
  source: string;
  country: string;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  start_date: string | null;
  end_date: string | null;
  impact_traveler: string | null;
  impact_note: string | null;
  city: string | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
}

interface Props {
  country?: string;
  days?: number;
  limit?: number;
  title?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  festival: Music,
  sports: Trophy,
  conference: Briefcase,
  cultural: Globe,
  protest: AlertTriangle,
  holiday: Star,
};

const CATEGORY_COLORS: Record<string, string> = {
  festival: 'text-purple-400 bg-purple-500/10',
  sports: 'text-green-400 bg-green-500/10',
  conference: 'text-blue-400 bg-blue-500/10',
  cultural: 'text-pink-400 bg-pink-500/10',
  protest: 'text-red-400 bg-red-500/10',
  holiday: 'text-yellow-400 bg-yellow-500/10',
  commemoration: 'text-orange-400 bg-orange-500/10',
  other: 'text-slate-400 bg-slate-500/10',
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  positive: 'bg-green-500/20 text-green-400 border-green-500/30',
};

function formatDate(d: string | null): string {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function EventTimeline({ country, days = 30, limit = 20, title }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    params.set('upcoming', 'true');
    params.set('days', String(days));
    params.set('limit', String(limit));

    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(d => {
        setEvents(d.data || []);
        setLoading(false);
      })
      .catch(e => {
        setError('Error al cargar eventos');
        setLoading(false);
      });
  }, [country, days, limit]);

  const categories = ['all', ...new Set(events.map(e => e.category))];
  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-slate-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
        <p>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No hay eventos próximos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-500" />
            {title}
          </h3>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-yellow-500 text-black'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat === 'all' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.slice(0, limit).map((ev) => {
          const Icon = CATEGORY_ICONS[ev.category] || Calendar;
          const colorClass = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.other;
          const impactColor = ev.impact_traveler
            ? IMPACT_COLORS[ev.impact_traveler]
            : IMPACT_COLORS.low;
          const days = daysUntil(ev.start_date);

          return (
            <div
              key={ev.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-white font-medium text-sm leading-tight">
                        {ev.title}
                      </h4>
                      {ev.description && (
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                          {ev.description}
                        </p>
                      )}
                    </div>
                    {days !== null && days > 0 && (
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${impactColor}`}>
                        {days === 1 ? 'Mañana' : `${days} días`}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                    {ev.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(ev.start_date)}
                        {ev.end_date && ev.end_date !== ev.start_date && (
                          <> — {formatDate(ev.end_date)}</>
                        )}
                      </span>
                    )}
                    {ev.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ev.city}
                      </span>
                    )}
                    {ev.impact_note && (
                      <span className="flex items-center gap-1 text-yellow-500/70">
                        <AlertTriangle className="w-3 h-3" />
                        {ev.impact_note}
                      </span>
                    )}
                  </div>

                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-yellow-500/70 hover:text-yellow-400 hover:underline"
                    >
                      Más información →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
