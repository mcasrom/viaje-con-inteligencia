'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, RefreshCw, Loader2, Globe, MessageCircle, Repeat2, Eye, ThumbsUp, Pencil, Check, X, ExternalLink } from 'lucide-react';

interface AnalyticsEntry {
  id: string;
  platform: string;
  post_slug: string;
  post_title: string | null;
  post_url: string | null;
  published_at: string | null;
  likes: number;
  shares: number;
  comments: number;
  reach: number;
  source: string;
  updated_at: string;
}

interface PublishLogEntry {
  id: string;
  post_slug: string;
  platform: string;
  url: string | null;
  created_at: string;
}

const PLATFORM_META: Record<string, { label: string; icon: string; color: string }> = {
  bluesky: { label: 'Bluesky', icon: '🦋', color: '#1185fe' },
  mastodon: { label: 'Mastodon', icon: '🐘', color: '#6364ff' },
  telegram: { label: 'Telegram', icon: '✈️', color: '#26a5e4' },
  x_twitter: { label: 'X / Twitter', icon: '𝕏', color: '#ffffff' },
};

function ManualXForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ post_slug: '', post_title: '', post_url: '', likes: 0, shares: 0, comments: 0, reach: 0 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.post_slug.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/admin/social/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'x_twitter',
          manual: true,
          entries: [{
            post_slug: form.post_slug,
            post_title: form.post_title,
            post_url: form.post_url,
            likes: form.likes,
            shares: form.shares,
            comments: form.comments,
            reach: form.reach,
          }],
        }),
      });
      setOpen(false);
      setForm({ post_slug: '', post_title: '', post_url: '', likes: 0, shares: 0, comments: 0, reach: 0 });
      onSaved();
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
          <Pencil className="w-4 h-4" />
          Añadir X / Twitter
        </button>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-600 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium text-sm">Métrica manual X / Twitter</h4>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Slug del post"
              value={form.post_slug}
              onChange={e => setForm(f => ({ ...f, post_slug: e.target.value }))}
              className="col-span-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500"
            />
            <input
              placeholder="Título del post"
              value={form.post_title}
              onChange={e => setForm(f => ({ ...f, post_title: e.target.value }))}
              className="col-span-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500"
            />
            <input
              placeholder="URL del post en X"
              value={form.post_url}
              onChange={e => setForm(f => ({ ...f, post_url: e.target.value }))}
              className="col-span-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500"
            />
            <div>
              <label className="text-xs text-slate-400">Likes</label>
              <input type="number" value={form.likes} onChange={e => setForm(f => ({ ...f, likes: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Shares</label>
              <input type="number" value={form.shares} onChange={e => setForm(f => ({ ...f, shares: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Comments</label>
              <input type="number" value={form.comments} onChange={e => setForm(f => ({ ...f, comments: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Reach</label>
              <input type="number" value={form.reach} onChange={e => setForm(f => ({ ...f, reach: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Guardar métrica
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminSocialPage() {
  const [analytics, setAnalytics] = useState<AnalyticsEntry[]>([]);
  const [publishLog, setPublishLog] = useState<PublishLogEntry[]>([]);
  const [summary, setSummary] = useState<{ totalPosts: number; byPlatform: Record<string, number> }>({ totalPosts: 0, byPlatform: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/social/refresh');
      const data = await res.json();
      setAnalytics(data.analytics || []);
      setPublishLog(data.publishLog || []);
      setSummary(data.summary || { totalPosts: 0, byPlatform: {} });
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await fetch('/api/admin/social/refresh', { method: 'POST' });
      const data = await res.json();
      await fetchData();
      const parts = Object.entries(data.results || {}).map(([p, r]: any) =>
        `${PLATFORM_META[p]?.label || p}: ${r.updated}/${r.found} actualizados`
      );
      setRefreshResult(parts.join(' · ') || 'Sin resultados');
    } catch {
      setRefreshResult('Error al refrescar');
    } finally {
      setRefreshing(false);
    }
  };

  const platformTotals: Record<string, { likes: number; shares: number; comments: number; reach: number; count: number }> = {};
  for (const a of analytics) {
    if (!platformTotals[a.platform]) platformTotals[a.platform] = { likes: 0, shares: 0, comments: 0, reach: 0, count: 0 };
    platformTotals[a.platform].likes += a.likes;
    platformTotals[a.platform].shares += a.shares;
    platformTotals[a.platform].comments += a.comments;
    platformTotals[a.platform].reach += a.reach;
    platformTotals[a.platform].count++;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard Admin</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 rounded-full border border-blue-500/30">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-semibold">Analytics Redes</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs">Posts publicados</p>
            <p className="text-3xl font-bold text-white mt-1">{summary.totalPosts}</p>
          </div>
          {Object.entries(PLATFORM_META).map(([key, meta]) => (
            <div key={key} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <p className="text-slate-400 text-xs flex items-center gap-1">
                <span>{meta.icon}</span> {meta.label}
              </p>
              <p className="text-3xl font-bold text-white mt-1">{summary.byPlatform[key] || 0}</p>
              {platformTotals[key] && (
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{platformTotals[key].likes}</span>
                  <span className="flex items-center gap-1"><Repeat2 className="w-3 h-3" />{platformTotals[key].shares}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{platformTotals[key].comments}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <ManualXForm onSaved={fetchData} />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Refrescar métricas'}
          </button>
        </div>

        {refreshResult && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-300 text-sm">
            {refreshResult}
          </div>
        )}

        {/* Analytics table */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Métricas por post</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : analytics.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay métricas todavía. Usa "Refrescar métricas" para obtener datos de Bluesky, Mastodon y Telegram.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                    <th className="text-left py-3 pr-4">Post</th>
                    <th className="text-left py-3 px-4">Plataforma</th>
                    <th className="text-right py-3 px-4">Likes</th>
                    <th className="text-right py-3 px-4">Shares</th>
                    <th className="text-right py-3 px-4">Comments</th>
                    <th className="text-right py-3 px-4">Reach</th>
                    <th className="text-right py-3 px-4">Link</th>
                    <th className="text-right py-3 pl-4">Actualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((a) => {
                    const meta = PLATFORM_META[a.platform] || { label: a.platform, icon: '📱', color: '#94a3b8' };
                    return (
                      <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="text-white font-medium truncate max-w-[200px]">{a.post_title || a.post_slug}</p>
                          <p className="text-slate-500 text-xs">{a.post_slug}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5">
                            <span>{meta.icon}</span>
                            <span style={{ color: meta.color }} className="text-xs font-medium">{meta.label}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-white">{a.likes || '-'}</td>
                        <td className="py-3 px-4 text-right text-white">{a.shares || '-'}</td>
                        <td className="py-3 px-4 text-right text-white">{a.comments || '-'}</td>
                        <td className="py-3 px-4 text-right text-white">{a.reach || '-'}</td>
                        <td className="py-3 pl-4 text-right">
                          {a.post_url ? (
                            <a href={a.post_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              <ExternalLink className="w-4 h-4 inline" />
                            </a>
                          ) : '-'}
                        </td>
                        <td className="py-3 pl-4 text-right text-slate-500 text-xs">
                          {a.updated_at ? new Date(a.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Publish log */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Historial de publicaciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="text-left py-3 pr-4">Post</th>
                  <th className="text-left py-3 px-4">Plataforma</th>
                  <th className="text-right py-3 pl-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {publishLog.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-500">Sin publicaciones registradas</td></tr>
                ) : publishLog.map((entry) => {
                  const meta = PLATFORM_META[entry.platform] || { label: entry.platform, icon: '📱', color: '#94a3b8' };
                  return (
                    <tr key={entry.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="text-white">{entry.post_slug}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5">
                          <span>{meta.icon}</span>
                          <span style={{ color: meta.color }} className="text-xs font-medium">{meta.label}</span>
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right text-slate-400 text-xs">
                        {new Date(entry.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
