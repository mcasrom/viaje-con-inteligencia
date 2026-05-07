'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Clock, Mail, Globe, Users, AlertTriangle, CheckCircle, XCircle, FileText, Database, MessageSquare, ExternalLink, RefreshCw, Play, Send, Radio, Bot, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionResult, setActionResult] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const runAction = async (action: string, cronPath?: string) => {
    setActionLoading(action);
    setActionResult(null);
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, cronPath }),
      });
      const json = await res.json();
      setActionResult({ ...json, action });
      if (json.success) {
        fetchStats();
      }
    } catch (e: any) {
      setActionResult({ action, error: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const formatTime = (ts: string | null) => {
    if (!ts) return 'Nunca';
    const d = new Date(ts);
    return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (ts: string | null) => {
    if (!ts) return 'Nunca';
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 0) return 'Fecha no válida';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))} min`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              Actualizado: {formatTime(data?.timestamp)}
            </span>
            <button
              onClick={fetchStats}
              className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-600/20 rounded-lg hover:bg-red-600/30 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Country Counts */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Auditoría de Países
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Total</p>
              <p className="text-2xl font-bold text-white">{data?.countries.total}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Visibles</p>
              <p className="text-2xl font-bold text-green-400">{data?.countries.visible}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Ocultos</p>
              <p className="text-2xl font-bold text-red-400">{data?.countries.hidden?.length}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">queHacer = 0</p>
              <p className="text-2xl font-bold text-orange-400">{data?.countries.queHacerZero?.length}</p>
            </div>
          </div>
          {data?.countries.queHacerZero?.length > 0 && (
            <div className="bg-orange-900/30 border border-orange-700/50 rounded-xl p-4">
              <p className="text-orange-300 text-sm font-medium mb-2">Países sin queHacer:</p>
              <div className="flex flex-wrap gap-2">
                {data.countries.queHacerZero.map((c: any) => (
                  <span key={c.code} className="px-2 py-1 bg-orange-800/50 text-orange-200 text-xs rounded">{c.code} {c.name}</span>
                ))}
              </div>
            </div>
          )}
          {data?.countries.hidden?.length > 0 && (
            <div className="mt-4 bg-red-900/30 border border-red-700/50 rounded-xl p-4">
              <p className="text-red-300 text-sm font-medium mb-2">Países ocultos:</p>
              <div className="flex flex-wrap gap-2">
                {data.countries.hidden.map((c: any) => (
                  <span key={c.code} className="px-2 py-1 bg-red-800/50 text-red-200 text-xs rounded">{c.code} {c.name}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-4">
            {data?.countries.riskDistribution && Object.entries(data.countries.riskDistribution).map(([level, count]) => (
              <div key={level} className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">{level}:</span>
                <span className="text-white font-bold">{count as number}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Users */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Usuarios
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Perfiles</p>
              <p className="text-2xl font-bold text-white">{data?.users.profiles}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Viajes</p>
              <p className="text-2xl font-bold text-white">{data?.users.trips}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Favoritos</p>
              <p className="text-2xl font-bold text-white">{data?.users.favorites}</p>
            </div>
          </div>
        </section>

        {/* Airspace OSINT */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Espacio Aéreo (OSINT automático)
          </h2>
          <p className="text-slate-400 text-sm mb-4">Bot OSINT scrapea fuentes abiertas cada 6h. Detecta cierres, calcula desviaciones y actualiza TCI automáticamente.</p>
          <div className="flex gap-3">
            <a href="/admin/airspace" className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-lg hover:bg-rose-600/30 transition-colors text-sm font-medium">
              Ver impacto <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => runAction('trigger-cron', '/api/cron/airspace-osint')}
              disabled={actionLoading === 'trigger-cron'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {actionLoading === 'trigger-cron' ? 'Ejecutando...' : 'Ejecutar OSINT'}
            </button>
          </div>
        </section>

        {/* Cron Jobs */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Cron Jobs
          </h2>
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">MAEC Scraper</span>
                <span className="text-slate-400 text-sm">{timeAgo(data?.cron.scrapeMaec?.[0]?.created_at)}</span>
              </div>
              {data?.cron.scrapeMaec?.[0] && (
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">Status: {data.cron.scrapeMaec[0].status}</span>
                  <span className="text-slate-400">Items: {data.cron.scrapeMaec[0].items_scraped}</span>
                  <span className="text-slate-400">Duración: {Math.round(data.cron.scrapeMaec[0].duration_ms / 1000)}s</span>
                </div>
              )}
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Risk Alerts</span>
                <span className="text-slate-400 text-sm">{timeAgo(data?.cron.checkAlerts?.[0]?.created_at)}</span>
              </div>
              {data?.cron.checkAlerts?.[0] && (
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">País: {data.cron.checkAlerts[0].country_code}</span>
                  <span className="text-slate-400">{data.cron.checkAlerts[0].old_risk} → {data.cron.checkAlerts[0].new_risk}</span>
                </div>
              )}
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">INE Tourism Scrape</span>
                <span className="text-slate-400 text-sm">{timeAgo(data?.cron.ineScrape)}</span>
              </div>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">ML Clustering</span>
                <span className="text-slate-400 text-sm">{timeAgo(data?.cron.mlClustering?.created_at)}</span>
              </div>
              {data?.cron.mlClustering && (
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">Status: {data.cron.mlClustering.status}</span>
                  <span className="text-slate-400">Segmentos: {data.cron.mlClustering.items_scraped}</span>
                  <span className="text-slate-400">Duración: {Math.round(data.cron.mlClustering.duration_ms / 1000)}s</span>
                </div>
              )}
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Flight Costs TCI</span>
                <span className="text-slate-400 text-sm">{timeAgo(data?.cron.flightCosts?.created_at)}</span>
              </div>
              {data?.cron.flightCosts && (
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">Status: {data.cron.flightCosts.status}</span>
                  <span className="text-slate-400">Países: {data.cron.flightCosts.items_scraped}</span>
                  <span className="text-slate-400">Duración: {Math.round(data.cron.flightCosts.duration_ms / 1000)}s</span>
                </div>
              )}
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">OSINT Espacio Aéreo</span>
                <span className="text-slate-400 text-sm">{timeAgo(data?.cron.osintAirspace?.created_at)}</span>
              </div>
              {data?.cron.osintAirspace && (
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">Status: {data.cron.osintAirspace.status}</span>
                  <span className="text-slate-400">Fuentes: {data.cron.osintAirspace.items_scraped}</span>
                  <span className="text-slate-400">Duración: {Math.round(data.cron.osintAirspace.duration_ms / 1000)}s</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Newsletter
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Suscriptores</p>
              <p className="text-2xl font-bold text-white">{data?.newsletter.subscribers}</p>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Últimos envíos</h3>
          {data?.newsletter.history?.length > 0 ? (
            <div className="space-y-2">
              {data.newsletter.history.map((h: any, i: number) => (
                <div key={i} className="bg-slate-700 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{h.subject || '(sin asunto)'}</p>
                    <p className="text-slate-400 text-xs">{formatTime(h.created_at)}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No hay historial de envíos</p>
          )}
        </section>

        {/* Social Media */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Redes Sociales
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Bot Users (Telegram)</p>
              <p className="text-2xl font-bold text-white">{data?.social.botUsers}</p>
            </div>
          </div>
          {data?.social.botStats?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Última actividad del bot</h3>
              {data.social.botStats.slice(0, 5).map((s: any, i: number) => (
                <div key={i} className="bg-slate-700 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{s.action || s.command || 'N/A'}</p>
                    <p className="text-slate-400 text-xs">{formatTime(s.created_at)}</p>
                  </div>
                  <span className="text-slate-400 text-xs">{s.count || 1}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 bg-slate-700 rounded-xl p-4">
            <p className="text-slate-300 text-sm font-medium mb-2">Mastodon</p>
            <p className="text-slate-400 text-xs">@viajeinteligencia@mastodon.social</p>
            <a href="https://mastodon.social/@viajeinteligencia" target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm flex items-center gap-1 mt-1">
              Ver perfil <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Blog Posts
          </h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Total Posts</p>
              <p className="text-2xl font-bold text-white">{data?.posts.total}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Sin Categoría</p>
              <p className="text-2xl font-bold text-red-400">{data?.posts.issues.noCategory?.length || 0}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Sin Imagen</p>
              <p className="text-2xl font-bold text-orange-400">{data?.posts.issues.noImage?.length || 0}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Sin Excerpt</p>
              <p className="text-2xl font-bold text-orange-400">{data?.posts.issues.noExcerpt?.length || 0}</p>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Últimos posts</h3>
          <div className="space-y-2">
            {data?.posts.recent?.map((p: any, i: number) => (
              <div key={i} className="bg-slate-700 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{p.title}</p>
                  <p className="text-slate-400 text-xs">{p.slug} · {p.category || '(sin categoría)'}</p>
                </div>
                <span className="text-slate-400 text-xs">{timeAgo(p.date)}</span>
              </div>
            ))}
          </div>
          {data?.posts.issues?.noCategory?.length > 0 && (
            <div className="mt-4 bg-red-900/30 border border-red-700/50 rounded-xl p-4">
              <p className="text-red-300 text-sm font-medium mb-2">Posts sin categoría:</p>
              <div className="flex flex-wrap gap-2">
                {data.posts.issues.noCategory.map((slug: string) => (
                  <span key={slug} className="px-2 py-1 bg-red-800/50 text-red-200 text-xs rounded">{slug}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Hardcoded Data Warnings */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Datos Hardcoded / Warnings
          </h2>
          <div className="space-y-3">
            {data?.hardcoded?.map((w: any, i: number) => (
              <div key={i} className={`rounded-xl p-4 border ${
                w.severity === 'high' ? 'bg-red-900/20 border-red-700/50' :
                w.severity === 'medium' ? 'bg-orange-900/20 border-orange-700/50' :
                'bg-yellow-900/20 border-yellow-700/50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{w.issue}</span>
                  {w.severity === 'high' ? <XCircle className="w-4 h-4 text-red-400" /> :
                   w.severity === 'medium' ? <AlertTriangle className="w-4 h-4 text-orange-400" /> :
                   <CheckCircle className="w-4 h-4 text-yellow-400" />}
                </div>
                <p className="text-slate-400 text-xs">{w.file}</p>
                <p className="text-slate-300 text-xs mt-1">Valor: <code className="bg-slate-800 px-1 rounded">{w.value}</code></p>
              </div>
            ))}
          </div>
        </section>

        {/* VERIFICACIÓN DE PÁGINAS PREMIUM */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Verificación Premium
          </h2>
          <p className="text-slate-400 text-sm mb-5">Acceso directo a cada feature marcada como Premium. Verifica que todas las páginas funcionan correctamente.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Chat IA', desc: 'Asistente IA sin límite', href: '/chat', icon: '💬', status: 'existe' },
              { label: 'Planificador Itinerarios IA', desc: 'Generar viajes con IA', href: '/itinerario', icon: '✈️', status: 'existe' },
              { label: 'Alertas en Tiempo Real', desc: 'Monitor MAEC en vivo', href: '/alertas', icon: '🔔', status: 'existe' },
              { label: 'Mapa de Sismos USGS', desc: 'Terremotos en vivo', href: '/dashboard/kpis', icon: '🌍', status: 'existe' },
              { label: 'Monitor de Conflictos', desc: 'Zonas de conflicto activas', href: '/dashboard/kpis', icon: '⚔️', status: 'existe' },
              { label: 'ML Clustering', desc: 'Destinos agrupados por IA', href: '/clustering', icon: '🤖', status: 'existe' },
              { label: 'KPIs Globales', desc: '6 índices comparativos', href: '/indices', icon: '📊', status: 'existe' },
              { label: 'Reclamaciones PDF', desc: 'Generar formularios', href: '/checklist', icon: '📋', status: 'existe' },
              { label: 'Dashboard Personalizado', desc: 'Panel del usuario', href: '/dashboard', icon: '📱', status: 'existe' },
              { label: 'Mis Viajes + Documentos', desc: 'Gestión de viajes', href: '/viajes', icon: '🗂️', status: 'existe' },
              { label: 'Decidir Destino (IA)', desc: 'Recomendador inteligente', href: '/decidir', icon: '🎯', status: 'existe' },
              { label: 'Análisis Petróleo ML', desc: 'Predicciones de crudo', href: '/petroleo', icon: '🛢️', status: 'existe' },
              { label: 'Eventos Globales', desc: 'Calendario mundial', href: '/eventos', icon: '📅', status: 'existe' },
              { label: 'Relojes Mundiales', desc: '18 ciudades en vivo', href: '/relojes', icon: '🕐', status: 'existe' },
              { label: 'Radio Inteligente', desc: 'Destinos con scoring', href: '/radius', icon: '📡', status: 'existe' },
            ].map((feature) => (
              <a
                key={feature.href}
                href={feature.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-start gap-3 rounded-xl p-4 border transition-colors ${
                  feature.status === 'no-existe'
                    ? 'bg-red-900/10 border-red-700/30 hover:bg-red-900/20'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <span className="text-xl">{feature.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{feature.label}</p>
                    {feature.status === 'no-existe' && (
                      <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">FALTA</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs truncate">{feature.desc}</p>
                  <p className="text-slate-500 text-[11px] font-mono mt-0.5">{feature.href}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </section>

        {/* Acciones - Cron Triggers */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Disparar Cron Jobs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { path: '/api/cron/scrape-maec', label: 'MAEC Scraper', icon: '🌍' },
              { path: '/api/cron/check-alerts', label: 'Check Alerts', icon: '⚠️' },
              { path: '/api/cron/daily-digest', label: 'Daily Digest', icon: '📧' },
              { path: '/api/cron/weekly-digest', label: 'Weekly Digest', icon: '📰' },
              { path: '/api/cron/ine-scrape', label: 'INE Scrape', icon: '📊' },
              { path: '/api/cron/ml-clustering', label: 'ML Clustering', icon: '🤖' },
              { path: '/api/cron/flight-costs', label: 'Flight Costs TCI', icon: '✈️' },
            ].map((cron) => (
              <button
                key={cron.path}
                onClick={() => runAction('trigger-cron', cron.path)}
                disabled={actionLoading !== null}
                className="flex items-center gap-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl p-4 transition-colors"
              >
                <span className="text-2xl">{cron.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">{cron.label}</p>
                  <p className="text-slate-400 text-xs">{cron.path}</p>
                </div>
                {actionLoading === 'trigger-cron' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <Play className="w-4 h-4 text-green-400" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Acciones - Social Media Publish */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            Publicar Posts en Redes
          </h2>
          <p className="text-slate-400 text-sm mb-4">Publica todos los posts del blog que aún no se han enviado a Telegram y Mastodon.</p>
          <button
            onClick={() => runAction('publish-posts')}
            disabled={actionLoading !== null}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl px-6 py-4 transition-colors w-full md:w-auto"
          >
            <Send className="w-5 h-5" />
            {actionLoading === 'publish-posts' ? (
              <>Publicando...</>
            ) : (
              <>Publicar todos los posts no publicados</>
            )}
          </button>
          {actionResult && actionResult.action === 'publish-posts' && (
            <div className="mt-4 space-y-2">
              {actionResult.results?.map((r: any, i: number) => (
                <div key={i} className="bg-slate-700 rounded-xl p-3">
                  <p className="text-white text-sm">{r.title}</p>
                  <div className="flex gap-3 mt-1">
                    <span className={`text-xs ${r.telegram ? 'text-green-400' : 'text-red-400'}`}>
                      {r.telegram ? '✅ Telegram' : '❌ Telegram'}
                    </span>
                    <span className={`text-xs ${r.mastodon ? 'text-green-400' : 'text-red-400'}`}>
                      {r.mastodon ? `✅ Mastodon → ${r.mastodonUrl}` : '❌ Mastodon'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Action Result */}
        {actionResult && actionResult.action !== 'publish-posts' && (
          <section className={`rounded-2xl border p-6 ${actionResult.success ? 'bg-green-900/20 border-green-700/50' : 'bg-red-900/20 border-red-700/50'}`}>
            <h3 className="text-white font-bold mb-2">
              {actionResult.success ? '✅ Ejecutado' : '❌ Error'}
            </h3>
            <pre className="text-slate-300 text-xs overflow-auto max-h-48">
              {JSON.stringify(actionResult.result || actionResult, null, 2)}
            </pre>
          </section>
        )}
      </main>
    </div>
  );
}
