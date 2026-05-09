'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, FileText, Sparkles, ArrowRight, Globe, Info, AlertTriangle } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'event' | 'post' | 'recommendation';
  title: string;
  subtitle: string;
  date?: string;
  country?: string;
  countryCode?: string;
  impact?: string;
  score?: number;
  reasons?: string[];
  slug?: string;
  readTime?: string;
  image?: string;
}

interface SmartFeedProps {
  favorites: string[];
  events: any[];
}

export default function SmartFeed({ favorites, events }: SmartFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    if (favorites.length === 0) return;
    setPostsLoading(true);
    fetch('/api/posts?page=1&perPage=50&sort=recent')
      .then(r => r.json())
      .then(data => {
        if (!data.posts) { setPostsLoading(false); return; }
        const codes = favorites.map(c => c.toLowerCase());
        const related = data.posts.filter((p: any) => {
          const kw = (p.keywords || '').toLowerCase();
          const title = p.title.toLowerCase();
          const tags = (p.tags || []).join(' ').toLowerCase();
          return codes.some(code => kw.includes(code) || title.includes(code) || tags.includes(code));
        });
        setPosts(related.slice(0, 6));
        setPostsLoading(false);
      })
      .catch(() => setPostsLoading(false));
  }, [favorites]);

  useEffect(() => {
    if (favorites.length === 0) return;
    setRecsLoading(true);
    fetch(`/api/recommendations?favorites=${favorites.join(',')}`)
      .then(r => r.json())
      .then(data => {
        setRecommendations(data.recommendations || []);
        setRecsLoading(false);
      })
      .catch(() => setRecsLoading(false));
  }, [favorites]);

  const feedItems: FeedItem[] = [];

  events.slice(0, 5).forEach((ev: any) => {
    feedItems.push({
      id: `ev-${ev.id}`,
      type: 'event',
      title: ev.title,
      subtitle: ev.city || ev.country || '',
      date: ev.start_date,
      country: ev.country?.toLowerCase(),
      impact: ev.impact_traveler,
    });
  });

  posts.forEach((p: any) => {
    feedItems.push({
      id: `post-${p.slug}`,
      type: 'post',
      title: p.title,
      subtitle: p.category || 'Análisis',
      date: p.date,
      slug: p.slug,
      readTime: p.readTime,
      image: p.image,
    });
  });

  recommendations.slice(0, 4).forEach((r: any) => {
    feedItems.push({
      id: `rec-${r.code}`,
      type: 'recommendation',
      title: r.name,
      subtitle: r.capital || '',
      countryCode: r.code,
      score: r.score,
      reasons: r.reasons,
    });
  });

  feedItems.sort((a, b) => {
    if (a.type === 'recommendation' && b.type !== 'recommendation') return 1;
    if (b.type === 'recommendation' && a.type !== 'recommendation') return -1;
    if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  if (favorites.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Feed Inteligente</h2>
        <span className="text-slate-500 text-xs">actualizado en vivo</span>
      </div>

      {feedItems.length === 0 && !postsLoading && !recsLoading ? (
        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 text-center">
          <Info className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay actividad reciente para tus países favoritos</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {feedItems.map(item => (
            <FeedCard key={item.id} item={item} />
          ))}
          {(postsLoading || recsLoading) && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  if (item.type === 'event') {
    const impactColor = item.impact === 'high' || item.impact === 'critical'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : item.impact === 'medium'
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${impactColor}`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-white font-medium text-sm leading-tight">{item.title}</h4>
            </div>
            {item.date && (
              <p className="text-slate-500 text-xs mt-1">
                {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
            {item.subtitle && (
              <p className="text-slate-400 text-xs mt-0.5">{item.subtitle}</p>
            )}
            {item.impact && (
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-medium ${
                item.impact === 'high' || item.impact === 'critical'
                  ? 'bg-red-500/10 text-red-400'
                  : item.impact === 'medium'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-blue-500/10 text-blue-400'
              }`}>
                {item.impact === 'critical' ? 'Crítico' : item.impact === 'high' ? 'Alto' : item.impact === 'medium' ? 'Medio' : 'Bajo'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'post') {
    return (
      <Link href={`/blog/${item.slug}`} className="block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all group">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg shrink-0 bg-purple-500/20 text-purple-400">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm leading-tight group-hover:text-purple-400 transition-colors">{item.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-medium text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{item.subtitle}</span>
              {item.readTime && <span className="text-slate-500 text-[10px]">{item.readTime}</span>}
            </div>
            {item.date && (
              <p className="text-slate-500 text-xs mt-1">
                {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0 mt-2" />
        </div>
      </Link>
    );
  }

  if (item.type === 'recommendation') {
    const scoreColor = item.score && item.score >= 80 ? 'text-green-400' : item.score && item.score >= 60 ? 'text-yellow-400' : 'text-slate-400';
    return (
      <Link href={`/pais/${item.countryCode}`} className="block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all group">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg shrink-0 bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">{item.title}</h4>
              {item.score && <span className={`text-xs font-bold ${scoreColor}`}>{item.score}%</span>}
            </div>
            <p className="text-slate-400 text-xs">{item.subtitle}</p>
            {item.reasons && item.reasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.reasons.slice(0, 2).map((r, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[9px] text-slate-400">{r}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return null;
}
