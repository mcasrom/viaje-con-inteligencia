'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, RefreshCw, Globe, FileText, AlertTriangle, Bot } from 'lucide-react';

interface UrlResult {
  path: string;
  url: string;
  googlebot: {
    status: number;
    ms: number;
    contentLength: number;
    hasNoindexHeader: boolean;
    hasNoindexMeta: boolean;
    hasCanonical: boolean;
    title: string;
    h1: string;
    error: string | null;
  };
  bingbot: { status: number; ms: number };
  cache: { cached: boolean; date: string };
  indexable: boolean;
}

interface ApiResponse {
  checkedAt: string;
  totalChecked: number;
  indexable: number;
  notIndexable: number;
  cached: number;
  notCached: number;
  crawlerWeekly: number;
  pm2BotHits: number;
  results: UrlResult[];
}

function statusColor(code: number): string {
  if (code === 200) return 'text-green-400';
  if (code >= 300 && code < 400) return 'text-yellow-400';
  if (code >= 400) return 'text-red-400';
  return 'text-slate-500';
}

export default function AdminSEOCheckPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'indexable' | 'not-indexable' | 'cached' | 'not-cached'>('all');

  const runCheck = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seo-check');
      if (!res.ok) { setError(`Error: ${res.status}`); setLoading(false); return; }
      setData(await res.json());
    } catch { setError('Error de conexión'); }
    setLoading(false);
  };

  useEffect(() => { runCheck(); }, []);

  const results = data?.results || [];
  const filtered = filter === 'all' ? results :
    filter === 'indexable' ? results.filter(r => r.indexable) :
    filter === 'not-indexable' ? results.filter(r => !r.indexable) :
    filter === 'cached' ? results.filter(r => r.cache.cached) :
    results.filter(r => !r.cache.cached);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Search className="w-6 h-6 text-blue-400" />
            SEO Check
          </h1>
          <button
            onClick={runCheck}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analizando...' : 'Ejecutar ahora'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1">Analizadas</p>
                <p className="text-2xl font-bold text-white">{data.totalChecked}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1">Indexables</p>
                <p className="text-2xl font-bold text-green-400">{data.indexable}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1">No indexables</p>
                <p className="text-2xl font-bold text-red-400">{data.notIndexable}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1">Cache Google</p>
                <p className="text-2xl font-bold text-amber-400">{data.cached}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1">Sin cache</p>
                <p className="text-2xl font-bold text-slate-400">{data.notCached}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1">Crawlers/sem (CF)</p>
                <p className="text-2xl font-bold text-blue-400">{data.crawlerWeekly.toLocaleString()}</p>
              </div>
            </div>

            {/* Bot activity bar */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-4">
              <Bot className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="text-sm text-slate-300">
                <strong className="text-white">{data.pm2BotHits}</strong> hits de bot en logs PM2 (últimas 3000 líneas)
              </div>
              <span className="text-slate-500 text-xs ml-auto">Último check: {new Date(data.checkedAt).toLocaleString('es-ES')}</span>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'indexable', 'not-indexable', 'cached', 'not-cached'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {f === 'all' ? 'Todas' : f === 'indexable' ? 'Indexables' : f === 'not-indexable' ? 'No indexables' : f === 'cached' ? 'Con cache' : 'Sin cache'}
                </button>
              ))}
            </div>

            {/* Results table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                      <th className="text-left p-3 font-medium">URL</th>
                      <th className="text-center p-3 font-medium">Status</th>
                      <th className="text-center p-3 font-medium">Tiempo</th>
                      <th className="text-center p-3 font-medium">Indexable</th>
                      <th className="text-center p-3 font-medium">Cache</th>
                      <th className="text-center p-3 font-medium">Canonical</th>
                      <th className="text-left p-3 font-medium">Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.path} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-3 text-white font-mono text-xs max-w-[200px] truncate" title={r.path}>
                          {r.path}
                        </td>
                        <td className={`p-3 text-center font-mono text-xs ${statusColor(r.googlebot.status)}`}>
                          {r.googlebot.status || 'ERR'}
                        </td>
                        <td className="p-3 text-center text-slate-400 font-mono text-xs">
                          {r.googlebot.ms}ms
                        </td>
                        <td className="p-3 text-center">
                          {r.indexable
                            ? <CheckCircle2 className="w-4 h-4 text-green-400 inline" />
                            : <XCircle className="w-4 h-4 text-red-400 inline" />
                          }
                        </td>
                        <td className="p-3 text-center">
                          {r.cache.cached
                            ? <span className="flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 inline" /><span className="text-[10px] text-slate-500">{r.cache.date.slice(0, 12)}</span></span>
                            : <XCircle className="w-4 h-4 text-slate-500 inline" />
                          }
                        </td>
                        <td className="p-3 text-center">
                          {r.googlebot.hasCanonical
                            ? <CheckCircle2 className="w-4 h-4 text-green-400 inline" />
                            : <XCircle className="w-4 h-4 text-red-400 inline" />
                          }
                        </td>
                        <td className="p-3 text-slate-300 text-xs max-w-[250px] truncate" title={r.googlebot.title}>
                          {r.googlebot.title || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Errors section */}
            {results.filter(r => r.googlebot.error || !r.indexable).length > 0 && (
              <div className="bg-red-900/10 border border-red-800/30 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Problemas detectados
                </h2>
                <div className="space-y-3">
                  {results.filter(r => r.googlebot.error || !r.indexable).map(r => (
                    <div key={r.path} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <p className="text-white font-mono text-xs mb-2">{r.path}</p>
                      {r.googlebot.error && <p className="text-red-400 text-xs">Error: {r.googlebot.error}</p>}
                      {r.googlebot.hasNoindexHeader && <p className="text-red-400 text-xs">⚠ X-Robots-Tag: noindex</p>}
                      {r.googlebot.hasNoindexMeta && <p className="text-red-400 text-xs">⚠ Meta robots: noindex</p>}
                      {r.googlebot.status !== 200 && <p className="text-yellow-400 text-xs">Status: {r.googlebot.status}</p>}
                      {!r.cache.cached && <p className="text-slate-500 text-xs">Sin caché de Google</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-20 text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Haz clic en "Ejecutar ahora" para analizar el estado SEO de las URLs del sitemap</p>
          </div>
        )}
      </div>
    </div>
  );
}
