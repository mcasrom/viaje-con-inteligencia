'use client';

import { useState, useEffect } from 'react';
import { Clock, Activity, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink } from 'lucide-react';

export default function AdminCronHealth() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health/cron');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))} min`;
    return `${hours}h`;
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'partial': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Monitor de Cron</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors" title="Refrescar">
              <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a href="/admin/dashboard" className="text-slate-400 text-sm hover:text-white">← Volver</a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {loading && !data && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
            <p className="text-slate-400 mt-3">Cargando historial...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">{error}</div>
        )}

        {data && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs">Ejecuciones</p>
                <p className="text-2xl font-bold text-white">{data.total}</p>
              </div>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs">Tasa de éxito</p>
                <p className={`text-2xl font-bold ${data.successRate >= 90 ? 'text-green-400' : data.successRate >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {data.successRate}%
                </p>
              </div>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs">Duración media</p>
                <p className="text-2xl font-bold text-white">{data.averages.durationSeconds.toFixed(1)}s</p>
              </div>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                <p className="text-slate-400 text-xs">Última ejecución</p>
                <p className="text-xl font-bold text-white">{timeAgo(data.lastRun.completedAt)}</p>
              </div>
            </div>

            {/* Degradation Alerts */}
            {data.degradation && (
              <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-5">
                <h2 className="text-white font-bold flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Degradación detectada
                </h2>
                <ul className="space-y-2">
                  {Object.entries(data.degradation).map(([key, msg]) => (
                    <li key={key} className="flex items-start gap-2 text-red-300 text-sm">
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {msg as string}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!data.degradation && (
              <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-5 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-green-300 text-sm">Sin degradación detectada. El cron funciona correctamente.</p>
              </div>
            )}

            {/* Last Run Detail */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h2 className="text-white font-bold mb-4">Última ejecución</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Estado</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {statusIcon(data.lastRun.status)}
                    <span className="text-white font-medium">{data.lastRun.status}</span>
                  </div>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Duración</p>
                  <p className="text-white font-medium mt-1">{(data.lastRun.durationMs / 1000).toFixed(1)}s</p>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Pasos OK</p>
                  <p className="text-green-400 font-medium mt-1">{data.lastRun.okSteps}/{data.lastRun.totalSteps}</p>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Errores</p>
                  <p className={`font-medium mt-1 ${data.lastRun.errorSteps > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {data.lastRun.errorSteps || 0}
                  </p>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Ejecutado</p>
                  <p className="text-white text-sm mt-1">{timeAgo(data.lastRun.completedAt)}</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-3">{formatTime(data.lastRun.completedAt)}</p>
            </div>

            {/* History Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h2 className="text-white font-bold">Historial ({data.total} ejecuciones)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-700/50">
                      <th className="text-left px-5 py-3 text-slate-400 font-medium">#</th>
                      <th className="text-left px-5 py-3 text-slate-400 font-medium">Estado</th>
                      <th className="text-right px-5 py-3 text-slate-400 font-medium">Duración</th>
                      <th className="text-right px-5 py-3 text-slate-400 font-medium">OK/Total</th>
                      <th className="text-right px-5 py-3 text-slate-400 font-medium">Errores</th>
                      <th className="text-right px-5 py-3 text-slate-400 font-medium">Ejecutado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {data.runs.map((run: any) => (
                      <tr key={run.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-3 text-slate-400 font-mono text-xs">#{run.id}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            {statusIcon(run.status)}
                            <span className="text-white">{run.status}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-slate-300 font-mono">
                          {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : '-'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-green-400">{run.ok_steps || 0}</span>
                          <span className="text-slate-500">/{run.total_steps || 0}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={run.error_steps > 0 ? 'text-red-400' : 'text-slate-500'}>
                            {run.error_steps || 0}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-slate-400 text-xs">
                          {formatTime(run.completed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Heartbeat Info */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h2 className="text-white font-bold mb-3">Heartbeat externo</h2>
              <p className="text-slate-300 text-sm mb-3">
                El endpoint <code className="bg-slate-700 px-1.5 py-0.5 rounded text-cyan-400">/api/heartbeat</code> devuelve 200 si el cron funciona correctamente
                y 503 si hay degradación (última ejecución &gt;27h, errores, duración anómala).
              </p>
              <p className="text-slate-400 text-xs">
                Configura un monitor externo (Better Uptime, CronHub, UptimeRobot) que lo revise cada 30-60 minutos
                y te alerte si devuelve 503.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
