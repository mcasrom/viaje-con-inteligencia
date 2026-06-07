'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, AlertCircle, Globe, Loader2 } from 'lucide-react';

interface OsintSignal {
  id: number;
  title: string;
  summary: string;
  source_url: string;
  source: string;
  category: string;
  urgency: string;
  tone_score: number | null;
  timeAgo: string;
  sourceIcon: string;
}

interface Props {
  countryCode: string;
  countryName: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  conflicto: '⚔️', salud: '🏥', clima: '🌦️', protesta: '✊',
  terrorismo: '🚨', crimen: '🔒', transporte: '✈️', otro: '📰',
};

const URGENCY_COLORS: Record<string, string> = {
  critical: 'text-red-400 border-red-500/30',
  high: 'text-orange-400 border-orange-500/30',
  medium: 'text-yellow-400 border-yellow-500/30',
  low: 'text-slate-400 border-slate-600/30',
};

export default function NoticiasFeed({ countryCode, countryName }: Props) {
  const [signals, setSignals] = useState<OsintSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/pais/${countryCode}/osint?limit=20&days=14`)
      .then(r => r.json())
      .then(d => {
        if (d.signals && d.signals.length > 0) {
          setSignals(d.signals);
        } else {
          setError('No hay alertas OSINT recientes para este país.');
        }
      })
      .catch(() => setError('Error al cargar alertas'))
      .finally(() => setLoading(false));
  }, [countryCode]);

  const categories = ['all', ...new Set(signals.map(s => s.category).filter(Boolean))];
  const filtered = activeCategory === 'all' ? signals : signals.filter(s => s.category === activeCategory);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          Alertas OSINT — {countryName}
        </h3>
        <span className="text-[10px] text-slate-500">Fuentes OSINT · últimos 14 días</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 py-8 text-slate-500 justify-center">
          <Globe className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && signals.length > 0 && (
        <>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'Todas' : cat}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((item) => (
              <a
                key={item.id}
                href={item.source_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`block bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-4 border transition-colors group ${URGENCY_COLORS[item.urgency] || 'border-slate-600/30'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 shrink-0">
                    {CATEGORY_ICONS[item.category] || item.sourceIcon || '📰'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                      {item.title}
                    </h4>
                    {item.summary && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                        {item.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>{item.sourceIcon} {item.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timeAgo}
                      </span>
                      {item.urgency && (
                        <span className={`font-medium ${URGENCY_COLORS[item.urgency]?.split(' ')[0]}`}>
                          {item.urgency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
