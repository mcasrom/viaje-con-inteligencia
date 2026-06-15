'use client';

import { useState, useEffect } from 'react';
import { Activity, Globe, ArrowUp, ChevronDown, ChevronUp, Server, Smartphone, Monitor, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';

// ── Cloudflare types ──────────────────────────────────────────────────────────
interface CountryRow  { country: string; name: string; requests: number; pct: number; note: string; }
interface TopPath     { path: string; requests: number; }
interface WeekData {
  week_start: string; week_end: string; page_views: number; unique_visitors: number;
  total_requests: number; bandwidth_bytes: number; threat_count: number;
  ssl_encrypted_pct: number; crawler_requests: number;
  countries: CountryRow[]; top_pages: TopPath[]; extracted_at: string;
}

// ── Nginx types ───────────────────────────────────────────────────────────────
interface NginxPage { path: string; hits: number; label: string; }
interface NginxPais { code: string; hits: number; }
interface NginxBot  { ua: string; hits: number; }
interface NginxWeek {
  week_start: string; human_hits: number; bot_ratio_pct: number;
  mobile_hits: number; desktop_hits: number; mobile_ratio_pct: number;
  top_pages: NginxPage[]; top_pais: NginxPais[]; top_bots: NginxBot[];
  status_codes: Record<string, number>; daily_human: Record<string, number>;
  extracted_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(b: number) {
  if (b >= 1e9) return `${(b / 1e9).toFixed(2)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  return `${(b / 1e3).toFixed(0)} KB`;
}

function countryName(code: string) {
  const m: Record<string, string> = {
    AU:'Australia', US:'Estados Unidos', ES:'España', DE:'Alemania', FR:'Francia',
    GB:'Reino Unido', IE:'Irlanda', NL:'Países Bajos', JP:'Japón', SG:'Singapur',
    CH:'Suiza', CN:'China', KR:'Corea del Sur', CA:'Canadá', BE:'Bélgica',
    BR:'Brasil', MX:'México', AR:'Argentina', CO:'Colombia', CL:'Chile',
    PE:'Perú', IT:'Italia', PT:'Portugal', IN:'India', RU:'Rusia',
    IL:'Israel', EG:'Egipto', ZA:'Sudáfrica', NZ:'Nueva Zelanda', HK:'Hong Kong',
    AE:'Emiratos Árabes', MW:'Malawi', NA:'Namibia', LR:'Liberia',
    SL:'Sierra Leona', BI:'Burundi', ZM:'Zambia', MA:'Marruecos',
  };
  return m[code] || code;
}

function countryNote(code: string, rank: number) {
  if (code === 'AU' && rank === 0) return '← tú en Brisbane (desarrollo local)';
  if (code === 'US') return '← crawlers, GitHub Actions, Hetzner monitors';
  if (code === 'ES') return '← tu residencia habitual';
  return '';
}

const PIE_COLORS = ['#3b82f6', '#64748b'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [weeks,      setWeeks]      = useState<WeekData[]>([]);
  const [nginxWeeks, setNginxWeeks] = useState<NginxWeek[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => {
        setWeeks(d.weeks || []);
        setNginxWeeks(d.nginx_weeks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <p className="text-slate-400">Cargando analytics...</p>
    </div>
  );

  const latest      = weeks[0] || null;
  const latestNginx = nginxWeeks[0] || null;

  // daily_human → array para LineChart
  const dailyData = latestNginx
    ? Object.entries(latestNginx.daily_human || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, hits]) => ({ date: date.slice(5), hits }))
    : [];

  // status_codes → array para BarChart
  const statusData = latestNginx
    ? Object.entries(latestNginx.status_codes || {})
        .map(([code, hits]) => ({ code, hits }))
        .sort((a, b) => b.hits - a.hits)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-orange-400" />
            Analytics Dashboard
          </h1>
          {latest && (
            <span className="text-slate-500 text-sm">{latest.week_start} → {latest.week_end}</span>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            BLOQUE 1 — CLOUDFLARE
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 pt-2">
          <Globe className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-orange-400 uppercase tracking-wide text-sm">Cloudflare Analytics</h2>
        </div>

        {!latest ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <p className="text-slate-400">No hay datos de Cloudflare aún.</p>
          </div>
        ) : (
          <>
            {/* KPIs CF */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Visitantes únicos',   value: latest.unique_visitors.toLocaleString() },
                { label: 'Páginas vistas',       value: latest.page_views.toLocaleString() },
                { label: 'Peticiones totales',   value: latest.total_requests.toLocaleString() },
                { label: 'Ancho de banda',       value: formatBytes(latest.bandwidth_bytes) },
                { label: 'SSL',                  value: `${latest.ssl_encrypted_pct}%` },
                { label: 'Amenazas',             value: latest.threat_count.toLocaleString() },
                { label: 'Crawlers estimados',   value: latest.crawler_requests.toLocaleString() },
                { label: 'Última extracción',    value: new Date(latest.extracted_at).toLocaleString('es-ES'), small: true },
              ].map(k => (
                <div key={k.label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <p className="text-slate-400 text-xs mb-1">{k.label}</p>
                  <p className={`font-bold text-white ${k.small ? 'text-sm' : 'text-2xl'}`}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Tendencia CF */}
            {weeks.length > 1 && (
              <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-base font-bold text-white mb-4">Tendencia semanal</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={[...weeks].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="week_start" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                    <Line type="monotone" dataKey="unique_visitors" stroke="#3b82f6" strokeWidth={2} name="Visitantes únicos" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="page_views"      stroke="#f59e0b" strokeWidth={2} name="Páginas vistas"    dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </section>
            )}

            {/* Países CF */}
            {latest.countries?.length > 0 && (
              <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-base font-bold text-white mb-4">Top países (Cloudflare)</h3>
                <ResponsiveContainer width="100%" height={240}>
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

            {/* Top páginas CF */}
            {latest.top_pages?.length > 0 && (
              <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ArrowUp className="w-5 h-5 text-green-400" /> Páginas más visitadas (Cloudflare)
                  </h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                      <th className="text-left p-4 font-medium">#</th>
                      <th className="text-left p-4 font-medium">Ruta</th>
                      <th className="text-right p-4 font-medium">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.top_pages.slice(0, 20).map((p, i) => (
                      <tr key={p.path} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-4 text-slate-500">{i + 1}</td>
                        <td className="p-4 text-white font-mono text-xs break-all">{p.path}</td>
                        <td className="p-4 text-right text-white font-mono">{p.requests.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
            BLOQUE 2 — NGINX (TRÁFICO HUMANO REAL)
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 pt-6">
          <Server className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-emerald-400 uppercase tracking-wide text-sm">Nginx — Tráfico Humano Real</h2>
        </div>

        {!latestNginx ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <p className="text-slate-400 text-lg mb-2">No hay datos de Nginx aún</p>
            <p className="text-slate-500 text-sm">El cron de los lunes (06:15) genera el primer informe.</p>
            <code className="mt-4 block text-xs text-blue-400 bg-slate-900 p-3 rounded-lg">
              python3 /var/www/viajeinteligencia/scripts/nginx-traffic-analyzer.py
            </code>
          </div>
        ) : (
          <>
            {/* KPIs Nginx */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl border border-emerald-900/50 p-4">
                <p className="text-slate-400 text-xs mb-1">Hits humanos</p>
                <p className="text-2xl font-bold text-emerald-400">{latestNginx.human_hits.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1">Ratio bots</p>
                <p className={`text-2xl font-bold ${latestNginx.bot_ratio_pct > 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {latestNginx.bot_ratio_pct}%
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs mb-1">Mobile</p>
                  <p className="text-2xl font-bold text-white">{latestNginx.mobile_ratio_pct}%</p>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-3">
                <Monitor className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs mb-1">Desktop hits</p>
                  <p className="text-2xl font-bold text-white">{latestNginx.desktop_hits.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Mobile vs Desktop pie + daily trend */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Pie mobile/desktop */}
              <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-base font-bold text-white mb-4">Mobile vs Desktop</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Mobile',  value: latestNginx.mobile_hits },
                        { name: 'Desktop', value: latestNginx.desktop_hits },
                      ]}
                      cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#64748b" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </section>

              {/* Daily human hits */}
              {dailyData.length > 0 && (
                <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-base font-bold text-white mb-4">Hits humanos por día</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }} />
                      <Line type="monotone" dataKey="hits" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Hits humanos" />
                    </LineChart>
                  </ResponsiveContainer>
                </section>
              )}
            </div>

            {/* Top páginas Nginx */}
            {latestNginx.top_pages?.length > 0 && (
              <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-base font-bold text-white mb-4">Top páginas humanas (Nginx)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={latestNginx.top_pages.slice(0, 15)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                    <YAxis type="category" dataKey="path" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#475569' }} width={180} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }}
                      formatter={(val: any, _: any, props: any) => [val, props.payload.label || props.payload.path]}
                    />
                    <Bar dataKey="hits" fill="#10b981" radius={[0, 4, 4, 0]} name="Hits humanos" />
                  </BarChart>
                </ResponsiveContainer>
              </section>
            )}

            {/* Top países Nginx */}
            {latestNginx.top_pais?.length > 0 && (
              <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" /> Países — tráfico humano real
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Bots filtrados. Lo que queda es tráfico genuino.</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                      <th className="text-left p-4 font-medium">#</th>
                      <th className="text-left p-4 font-medium">País</th>
                      <th className="text-right p-4 font-medium">Hits</th>
                      <th className="text-left p-4 font-medium">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestNginx.top_pais.map((p, i) => (
                      <tr key={p.code} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-4 text-slate-500">{i + 1}</td>
                        <td className="p-4">
                          <span className="text-white font-medium">{p.code}</span>
                          <span className="text-slate-400 ml-2">{countryName(p.code)}</span>
                        </td>
                        <td className="p-4 text-right text-white font-mono">{p.hits.toLocaleString()}</td>
                        <td className="p-4 text-slate-500 text-xs">{countryNote(p.code, i)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Status codes */}
            {statusData.length > 0 && (
              <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" /> HTTP Status codes
                </h3>
                <div className="flex flex-wrap gap-3">
                  {statusData.map(s => {
                    const color = s.code.startsWith('2') ? 'text-emerald-400' :
                                  s.code.startsWith('3') ? 'text-blue-400' :
                                  s.code.startsWith('4') ? 'text-yellow-400' : 'text-red-400';
                    return (
                      <div key={s.code} className="bg-slate-700/60 rounded-lg px-4 py-3 text-center min-w-[80px]">
                        <p className={`text-lg font-bold font-mono ${color}`}>{s.code}</p>
                        <p className="text-slate-400 text-xs">{s.hits.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top bots */}
            {latestNginx.top_bots?.length > 0 && (
              <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-base font-bold text-white">Top User-Agents bot</h3>
                  <p className="text-slate-500 text-xs mt-1">Los más activos filtrados de los logs.</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                      <th className="text-left p-4 font-medium">#</th>
                      <th className="text-left p-4 font-medium">User-Agent</th>
                      <th className="text-right p-4 font-medium">Hits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestNginx.top_bots.map((b, i) => (
                      <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-4 text-slate-500">{i + 1}</td>
                        <td className="p-4 text-slate-300 font-mono text-xs break-all">{b.ua}</td>
                        <td className="p-4 text-right text-white font-mono">{b.hits.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Semanas Nginx anteriores */}
            {nginxWeeks.length > 1 && (
              <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-base font-bold text-white mb-4">Semanas Nginx anteriores</h3>
                <div className="space-y-2">
                  {nginxWeeks.slice(1).map(w => (
                    <button
                      key={w.week_start}
                      onClick={() => setExpanded(expanded === `nx-${w.week_start}` ? null : `nx-${w.week_start}`)}
                      className="w-full bg-slate-700/50 rounded-xl p-4 text-left hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{w.week_start}</span>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="text-emerald-400 font-mono">{w.human_hits.toLocaleString()} humanos</span>
                          <span>bots {w.bot_ratio_pct}%</span>
                          {expanded === `nx-${w.week_start}` ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                      {expanded === `nx-${w.week_start}` && (
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-slate-400 text-xs mb-2 uppercase">Top páginas</p>
                            {(w.top_pages || []).slice(0, 8).map((p, i) => (
                              <div key={p.path} className="flex justify-between text-xs py-1 border-b border-slate-600/50">
                                <span className="text-slate-300 font-mono truncate">{p.path}</span>
                                <span className="text-white font-mono ml-2 shrink-0">{p.hits}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-2 uppercase">Top países</p>
                            {(w.top_pais || []).slice(0, 8).map(p => (
                              <div key={p.code} className="flex justify-between text-xs py-1 border-b border-slate-600/50">
                                <span className="text-white">{p.code} <span className="text-slate-400">{countryName(p.code)}</span></span>
                                <span className="text-white font-mono">{p.hits}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── HISTÓRICO CF SEMANAS ── */}
        {weeks.length > 1 && (
          <>
            <div className="flex items-center gap-2 pt-4">
              <Globe className="w-5 h-5 text-orange-400" />
              <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wide">Cloudflare — Semanas anteriores</h2>
            </div>
            <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="space-y-2">
                {weeks.slice(1).map(w => (
                  <button
                    key={w.week_start}
                    onClick={() => setExpanded(expanded === w.week_start ? null : w.week_start)}
                    className="w-full bg-slate-700/50 rounded-xl p-4 text-left hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{w.week_start} → {w.week_end}</span>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{w.unique_visitors.toLocaleString()} visitantes</span>
                        <span>{w.total_requests.toLocaleString()} req</span>
                        {expanded === w.week_start ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                    {expanded === w.week_start && (
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
                                <td className="p-2 text-white">{c.country} <span className="text-slate-400">{countryName(c.country)}</span></td>
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
          </>
        )}

        {/* ── LEYENDA ── */}
        <section className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Interpretación</h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><strong className="text-orange-400">Cloudflare</strong> — toda la capa edge: incluye bots, crawlers, assets estáticos, pre-fetches.</li>
            <li><strong className="text-emerald-400">Nginx</strong> — tráfico humano filtrado desde logs del servidor: bots eliminados por UA, solo peticiones HTML reales.</li>
            <li><strong className="text-white">AU</strong> — desarrollo local Brisbane. <strong className="text-white">US</strong> — crawlers, GitHub Actions, Hetzner monitors. <strong className="text-white">ES</strong> — residencia habitual.</li>
            <li>Países africanos (MW, NA, LR, SL, BI, ZM) — nicho real: usuarios buscando info de destinos poco comunes.</li>
            <li>Crons: Cloudflare → domingos 08:00 | Nginx → lunes 06:15.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
