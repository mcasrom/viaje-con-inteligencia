'use client';

import { useState, useEffect } from 'react';
import { Activity, Globe, ArrowUp, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface CountryRow {
  country: string;
  name: string;
  requests: number;
  pct: number;
  note: string;
}

interface TopPath {
  path: string;
  requests: number;
}

interface WeekData {
  week_start: string;
  week_end: string;
  page_views: number;
  unique_visitors: number;
  total_requests: number;
  bandwidth_bytes: number;
  threat_count: number;
  ssl_encrypted_pct: number;
  crawler_requests: number;
  countries: CountryRow[];
  top_pages: TopPath[];
  extracted_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function countryName(code: string): string {
  const map: Record<string, string> = {
    AU: 'Australia', US: 'Estados Unidos', ES: 'España', DE: 'Alemania',
    FR: 'Francia', GB: 'Reino Unido', IE: 'Irlanda', NL: 'Países Bajos',
    JP: 'Japón', SG: 'Singapur', CH: 'Suiza', CN: 'China',
    KR: 'Corea del Sur', CA: 'Canadá', BE: 'Bélgica',
    BR: 'Brasil', MX: 'México', AR: 'Argentina', CO: 'Colombia',
    CL: 'Chile', PE: 'Perú', IT: 'Italia', PT: 'Portugal',
    IN: 'India', RU: 'Rusia', IL: 'Israel', EG: 'Egipto',
    ZA: 'Sudáfrica', NZ: 'Nueva Zelanda', HK: 'Hong Kong',
  };
  return map[code] || code;
}

function countryNote(code: string, rank: number): string {
  if (code === 'AU' && rank === 0) return '← tú en Brisbane (desarrollo local)';
  if (code === 'US') return '← crawlers, GitHub Actions, Hetzner uptime monitors';
  if (code === 'ES') return '← tu residencia habitual';
  return '';
}

export default function AdminAnalyticsPage() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { setWeeks(d.weeks || d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-slate-400">Cargando analytics...</p>
      </div>
    );
  }

  if (!weeks.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Activity className="w-6 h-6 text-orange-400" />
            Cloudflare Analytics
          </h1>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <p className="text-slate-400 text-lg mb-4">No hay datos de Cloudflare Analytics aún</p>
            <p className="text-slate-500 text-sm">El cron dominical (8f/8) genera el primer informe. Si hoy es domingo, ejecuta el master cron manualmente.</p>
          </div>
        </div>
      </div>
    );
  }

  const latest = weeks[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-orange-400" />
            Cloudflare Analytics
          </h1>
          <span className="text-slate-500 text-sm">{latest.week_start} → {latest.week_end}</span>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs mb-1">Visitantes únicos</p>
            <p className="text-2xl font-bold text-white">{latest.unique_visitors.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs mb-1">Páginas vistas</p>
            <p className="text-2xl font-bold text-white">{latest.page_views.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs mb-1">Peticiones totales</p>
            <p className="text-2xl font-bold text-white">{latest.total_requests.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs mb-1">Ancho de banda</p>
            <p className="text-2xl font-bold text-white">{formatBytes(latest.bandwidth_bytes)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs mb-1">SSL</p>
            <p className="text-2xl font-bold text-white">{latest.ssl_encrypted_pct}%</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs mb-1">Amenazas</p>
            <p className="text-2xl font-bold text-white">{latest.threat_count.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs mb-1">Crawlers estimados</p>
            <p className="text-2xl font-bold text-white">{latest.crawler_requests.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-xs mb-1">Última extracción</p>
            <p className="text-sm font-bold text-white">{new Date(latest.extracted_at).toLocaleString('es-ES')}</p>
          </div>
        </div>

        {/* Trend chart */}
        {weeks.length > 1 && (
          <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Tendencia semanal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[...weeks].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week_start" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                <Line type="monotone" dataKey="unique_visitors" stroke="#3b82f6" strokeWidth={2} name="Visitantes únicos" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="page_views" stroke="#f59e0b" strokeWidth={2} name="Páginas vistas" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Country chart */}
        {latest.countries && latest.countries.length > 0 && (
          <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Top países por requests</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={latest.countries.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                <YAxis type="category" dataKey="country" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} width={30} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }} />
                <Bar dataKey="requests" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Top pages chart */}
        {latest.top_pages && latest.top_pages.length > 0 && (
          <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Top páginas</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={latest.top_pages.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                <YAxis type="category" dataKey="path" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#475569' }} width={200} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }} />
                <Bar dataKey="requests" fill="#10b981" radius={[0, 4, 4, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Country table */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Tráfico por país
            </h2>
            <p className="text-slate-500 text-xs mt-1">Últimos 7 días. AU = desarrollo local (Brisbane). US = crawlers + GitHub Actions + Hetzner monitors.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="text-left p-4 font-medium">#</th>
                  <th className="text-left p-4 font-medium">País</th>
                  <th className="text-right p-4 font-medium">Requests</th>
                  <th className="text-right p-4 font-medium">%</th>
                  <th className="text-left p-4 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {(latest.countries || []).map((c: any, i: number) => (
                  <tr key={c.country} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-4 text-slate-500">{i + 1}</td>
                    <td className="p-4">
                      <span className="text-white font-medium">{c.country}</span>
                      <span className="text-slate-400 ml-2">{countryName(c.country)}</span>
                    </td>
                    <td className="p-4 text-right text-white font-mono">{c.requests.toLocaleString()}</td>
                    <td className="p-4 text-right text-slate-300 font-mono">{c.pct}%</td>
                    <td className="p-4 text-slate-500 text-xs">{countryNote(c.country, i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top pages */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-green-400" />
              Páginas más visitadas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="text-left p-4 font-medium">#</th>
                  <th className="text-left p-4 font-medium">Ruta</th>
                  <th className="text-right p-4 font-medium">Requests</th>
                </tr>
              </thead>
              <tbody>
                {(latest.top_pages || []).slice(0, 20).map((p: any, i: number) => (
                  <tr key={p.path} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-4 text-slate-500">{i + 1}</td>
                    <td className="p-4 text-white font-mono text-xs break-all">{p.path}</td>
                    <td className="p-4 text-right text-white font-mono">{p.requests.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Historical weeks */}
        {weeks.length > 1 && (
          <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Semanas anteriores</h2>
            <div className="space-y-2">
              {weeks.slice(1).map((w) => (
                <button
                  key={w.week_start}
                  onClick={() => setExpandedCountry(expandedCountry === w.week_start ? null : w.week_start)}
                  className="w-full bg-slate-700/50 rounded-xl p-4 text-left hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{w.week_start} → {w.week_end}</span>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{w.unique_visitors.toLocaleString()} visitantes</span>
                      <span>{w.total_requests.toLocaleString()} req</span>
                      {expandedCountry === w.week_start ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  {expandedCountry === w.week_start && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-slate-400 text-xs uppercase border-b border-slate-600">
                            <th className="text-left p-2 font-medium">País</th>
                            <th className="text-right p-2 font-medium">Requests</th>
                            <th className="text-right p-2 font-medium">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(w.countries || []).slice(0, 10).map((c: any) => (
                            <tr key={c.country} className="border-b border-slate-700/50">
                              <td className="p-2 text-white">{c.country} {countryName(c.country)}</td>
                              <td className="p-2 text-right text-white font-mono">{c.requests.toLocaleString()}</td>
                              <td className="p-2 text-right text-slate-300 font-mono">{c.pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Legend */}
        <section className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Interpretación de datos</h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><strong className="text-white">AU (Australia) dominante</strong> — Eres tú desarrollando desde Brisbane. Cada &quot;npm run dev&quot; genera SSR requests, hot reloads, y preview builds.</li>
            <li><strong className="text-white">US (Estados Unidos)</strong> — Crawlers (Googlebot, Bingbot), GitHub Actions runners, uptime monitors de Hetzner/Checkly.</li>
            <li><strong className="text-white">ES (España)</strong> — Tu tráfico cuando estás en tu residencia habitual. Parte del tráfico orgánico real.</li>
            <li><strong className="text-white">LATAM</strong> — Casi inexistente. Proyecto sin tráfico orgánico significativo aún (lanzamiento reciente, outreach pendiente).</li>
            <li>Los datos se generan cada <strong>domingo</strong> en el cron 8f/8 del master cron y se almacenan en Supabase <code className="text-blue-400">cloudflare_analytics</code>.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
