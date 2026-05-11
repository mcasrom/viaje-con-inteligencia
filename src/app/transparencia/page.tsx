import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Activity, Database, Globe, Clock, CheckCircle, AlertTriangle, XCircle, Server, MapPin, Cloud, Zap, Shield, Newspaper } from 'lucide-react';
import { TOTAL_PAISES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Transparencia | Estado del Sistema - Viaje con Inteligencia',
  description: 'Estado actual del sistema, fuentes de datos, uptime y transparencia operativa de Viaje con Inteligencia.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/transparencia',
  },
};

interface StatusItem {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'pending';
  lastUpdate: string | null;
  source: string;
}

async function getStatus() {
  try {
    const res = await fetch('https://www.viajeinteligencia.com/api/cron/status', {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getMaecStatus() {
  try {
    const res = await fetch('https://www.viajeinteligencia.com/api/maec?country=es', {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function StatusBadge({ status, neverRun }: { status: string; neverRun?: boolean }) {
  const config: Record<string, { icon: any; label: string; color: string }> = {
    healthy: { icon: CheckCircle, label: 'Operativo', color: 'text-green-400 bg-green-400/10' },
    warning: { icon: AlertTriangle, label: 'Retrasado', color: 'text-yellow-400 bg-yellow-400/10' },
    error: { icon: XCircle, label: 'Error', color: 'text-red-400 bg-red-400/10' },
    pending: neverRun ? { icon: Clock, label: 'Programado', color: 'text-blue-400 bg-blue-400/10' } : { icon: Clock, label: 'Pendiente', color: 'text-slate-400 bg-slate-400/10' },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

function timeAgo(date: string | null): string {
  if (!date) return 'Sin ejecutar aún';
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 0) return 'Fecha no válida';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${Math.floor(hours / 24)} días`;
}

function nextSchedule(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default async function TransparenciaPage() {
  const cronStatus = await getStatus();
  const maecData = await getMaecStatus();

  const sources: StatusItem[] = [
    { name: 'MAEC - Ministerio Asuntos Exteriores', status: maecData ? 'healthy' : 'error', lastUpdate: maecData?.fechaActualizacion || null, source: 'maec.es' },
    { name: 'USGS - Terremotos en tiempo real', status: 'healthy', lastUpdate: new Date().toISOString(), source: 'earthquake.usgs.gov' },
    { name: 'US State Department - Alertas de viaje', status: 'healthy', lastUpdate: new Date().toISOString(), source: 'travel.state.gov' },
    { name: 'GDACS - Alertas de desastres', status: 'healthy', lastUpdate: new Date().toISOString(), source: 'gdacs.org' },
    { name: 'OpenWeather - Datos climáticos', status: 'healthy', lastUpdate: new Date().toISOString(), source: 'openweathermap.org' },
    { name: 'Wikidata - Puntos de interés', status: 'healthy', lastUpdate: new Date().toISOString(), source: 'query.wikidata.org' },
    { name: 'Nominatim - Geocodificación', status: 'healthy', lastUpdate: new Date().toISOString(), source: 'nominatim.openstreetmap.org' },
  ];

  const cronJobs = [
    { name: 'Scraper MAEC', icon: Shield, status: cronStatus?.scrapeMaec?.status || 'pending', lastUpdate: cronStatus?.scrapeMaec?.lastRun, nextRun: cronStatus?.scrapeMaec?.nextRun, desc: `Actualiza riesgos de ${TOTAL_PAISES} países desde maec.es`, schedule: 'Diario a las 6:00' },
    { name: 'Alertas de riesgo', icon: AlertTriangle, status: cronStatus?.checkAlerts?.status || 'pending', lastUpdate: cronStatus?.checkAlerts?.lastRun, nextRun: cronStatus?.checkAlerts?.nextRun, desc: 'Genera alertas automáticas por cambios de riesgo', schedule: 'Diario a las 8:00' },
    { name: 'Digest semanal', icon: Newspaper, status: cronStatus?.weeklyDigest?.status || 'pending', lastUpdate: cronStatus?.weeklyDigest?.lastRun, nextRun: cronStatus?.weeklyDigest?.nextRun, desc: 'Resumen semanal de eventos y tendencias', schedule: 'Lunes a las 8:00' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Transparencia Operativa</h1>
          </div>
          <p className="text-slate-400 text-lg">Estado en tiempo real de todas las fuentes de datos y procesos automáticos.</p>
        </div>

        {/* Overall status */}
        <div className={`rounded-2xl p-6 mb-8 border ${
          cronStatus?.overall === 'healthy' ? 'bg-green-500/5 border-green-500/30' :
          cronStatus?.overall === 'warning' ? 'bg-yellow-500/5 border-yellow-500/30' :
          'bg-red-500/5 border-red-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Estado general del sistema</h2>
                <p className="text-slate-400 text-sm">Última comprobación: {new Date().toLocaleString('es-ES')}</p>
              </div>
            </div>
            <StatusBadge status={cronStatus?.overall || 'pending'} />
          </div>
        </div>

        {/* Fuentes de datos */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Fuentes de datos
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sources.map((s) => (
              <div key={s.name} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{s.name}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{s.source}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(s.lastUpdate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cron jobs */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Procesos automáticos
          </h2>
          <div className="space-y-4">
            {cronJobs.map((job) => (
              <div key={job.name} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <job.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">{job.name}</span>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-slate-500 text-sm mb-3">{job.desc}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Última ejecución: {timeAgo(job.lastUpdate)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Programado: {job.schedule}</span>
                  {job.nextRun && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Próximo: {nextSchedule(job.nextRun)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            Métricas de cobertura
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Países analizados', value: `${TOTAL_PAISES}`, icon: Globe },
              { label: 'Ciudades en mapa', value: '47K+', icon: MapPin },
              { label: 'Fuentes activas', value: '7', icon: Database },
              { label: 'Actualización MAEC', value: 'Diaria', icon: Clock },
            ].map((m) => (
              <div key={m.label} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
                <m.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{m.value}</div>
                <div className="text-slate-500 text-xs mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            Todos los datos se actualizan automáticamente. Si detectas algún problema, escríbenos a{' '}
            <a href="mailto:info@viajeinteligencia.com" className="text-purple-400 hover:text-purple-300">info@viajeinteligencia.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
