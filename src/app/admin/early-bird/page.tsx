'use client';

import { useState, useEffect } from 'react';
import { Sunrise, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Users, Activity, Mail, Send } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface DigestRecord {
  id: number;
  created_at: string;
  digest_text: string;
  incidents_count: number;
  maec_changes_count: number;
  sentiment_alerts_count: number;
  health_ok: number;
  health_fail: number;
  traffic_page_views: number | null;
  traffic_uniques: number | null;
  newsletter_subscribers: number;
  sent_telegram: boolean;
  sent_email: boolean;
}

export default function AdminEarlyBirdPage() {
  const [digests, setDigests] = useState<DigestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/early-bird')
      .then(r => r.json())
      .then(d => { setDigests(d.digests || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-slate-400">Cargando Early Bird...</p>
      </div>
    );
  }

  if (!digests.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Sunrise className="w-6 h-6 text-amber-400" />
            Early Bird — Historial
          </h1>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <p className="text-slate-400 text-lg mb-4">No hay digests de Early Bird aún</p>
            <p className="text-slate-500 text-sm">El cron se ejecuta a las 07:00 UTC. Ejecuta manualmente: <code className="text-amber-400">curl -H &quot;Authorization: Bearer $CRON_SECRET&quot; http://localhost:3000/api/cron/early-bird</code></p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = digests.slice(0, 14).reverse().map(d => ({
    date: new Date(d.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    incidentes: d.incidents_count,
    maec: d.maec_changes_count,
    sentimiento: d.sentiment_alerts_count,
  }));

  const trendData = digests.slice(0, 14).reverse().map(d => ({
    date: new Date(d.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    page_views: d.traffic_page_views || 0,
    uniques: d.traffic_uniques || 0,
    suscriptores: d.newsletter_subscribers,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sunrise className="w-6 h-6 text-amber-400" />
            Early Bird — Historial
          </h1>
          <span className="text-slate-500 text-sm">{digests.length} digests</span>
        </div>

        {/* Latest summary cards */}
        {digests.length > 0 && (() => {
          const latest = digests[0];
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Incidentes (24h)</p>
                <p className="text-2xl font-bold text-white">{latest.incidents_count}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Cambios MAEC (48h)</p>
                <p className="text-2xl font-bold text-white">{latest.maec_changes_count}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Sistema OK</p>
                <p className="text-2xl font-bold text-white">{latest.health_ok}/{latest.health_ok + latest.health_fail}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Newsletter</p>
                <p className="text-2xl font-bold text-white">{latest.newsletter_subscribers}</p>
              </div>
            </div>
          );
        })()}

        {/* Incident trend chart */}
        {chartData.length > 1 && (
          <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Tendencia de alertas (últimos 14 días)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                <Line type="monotone" dataKey="incidentes" stroke="#ef4444" strokeWidth={2} name="Incidentes" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="maec" stroke="#3b82f6" strokeWidth={2} name="Cambios MAEC" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sentimiento" stroke="#f59e0b" strokeWidth={2} name="Sentimiento negativo" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Traffic trend chart */}
        {trendData.length > 1 && (
          <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Tráfico y suscriptores</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                <Bar dataKey="page_views" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Page views" />
                <Bar dataKey="uniques" fill="#10b981" radius={[4, 4, 0, 0]} name="Visitantes únicos" />
                <Bar dataKey="suscriptores" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Suscriptores" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Digest list */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white">Historial de digests</h2>
            <p className="text-slate-500 text-xs mt-1">Haz clic para ver el contenido completo de cada digest.</p>
          </div>
          <div className="divide-y divide-slate-700/50">
            {digests.map(d => (
              <div key={d.id}>
                <button
                  onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                  className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-white font-medium">{new Date(d.created_at).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span className="text-slate-500 text-sm">{new Date(d.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs ${d.incidents_count > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                        {d.incidents_count} inc
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${d.maec_changes_count > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                        {d.maec_changes_count} MAEC
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${d.health_fail > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {d.health_ok}/{d.health_ok + d.health_fail} sys
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        {d.sent_telegram ? <Send className="w-3 h-3 text-blue-400" /> : <span className="w-3 h-3 rounded-full bg-slate-600" />}
                        {d.sent_email ? <Mail className="w-3 h-3 text-green-400" /> : <span className="w-3 h-3 rounded-full bg-slate-600" />}
                      </span>
                      {expanded === d.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                </button>
                {expanded === d.id && (
                  <div className="px-4 pb-4">
                    <pre className="bg-slate-900 rounded-lg p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                      {d.digest_text}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
