'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, AlertCircle, Globe, Loader2 } from 'lucide-react';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  riskLevel?: string;
}

interface Props {
  countryCode: string;
  countryName: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  politics: '🏛️',
  world: '🌍',
  business: '💼',
  health: '🏥',
  science: '🔬',
  technology: '💻',
  travel: '✈️',
  security: '🛡️',
  weather: '🌤️',
};

export default function NoticiasFeed({ countryCode, countryName }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [source, setSource] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/news?country=${countryCode}&max=8`)
      .then(r => r.json())
      .then(d => {
        if (d.alerts) {
          setNews(d.alerts);
          setSource(d.source || '');
        } else {
          setError('No hay noticias disponibles');
        }
      })
      .catch(() => setError('Error al cargar noticias'))
      .finally(() => setLoading(false));
  }, [countryCode]);

  const categories = ['all', ...new Set(news.map(n => n.category))];
  const filtered = activeCategory === 'all' ? news : news.filter(n => n.category === activeCategory);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          Noticias sobre {countryName}
        </h3>
        {source && (
          <span className="text-[10px] text-slate-500">{source}</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 py-8 text-slate-500 justify-center">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="flex items-center gap-3 py-8 text-slate-500 justify-center">
          <Globe className="w-5 h-5" />
          <p className="text-sm">No hay noticias recientes para este país.</p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
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
            {filtered.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-4 border border-slate-600/30 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 shrink-0">
                    {CATEGORY_ICONS[item.category] || '📰'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {item.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.publishedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
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
