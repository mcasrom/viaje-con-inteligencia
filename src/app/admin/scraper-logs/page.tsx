'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Activity } from 'lucide-react';

interface ScraperLog {
  id: string;
  source: string;
  status: string;
  items_scraped: number;
  errors: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  metadata: any;
}

export default function ScraperLogsPage() {
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/scraper-logs');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      } else {
        setError(data.error || 'Error al cargar logs');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'partial': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const statusColors: Record<string, string> = {
    success: 'bg-green-500/20 border-green-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    running: 'bg-blue-500/20 border-blue-500/30',
    partial: 'bg-yellow-500/20 border-yellow-500/30',
    no_changes: 'bg-slate-500/20 border-slate-500/30',
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Admin</span>
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Scraper Logs
          </h1>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-2xl p-6 mb-8 border border-green-700/30">
          <h2 className="text-2xl font-bold text-white mb-2">📊 Monitor de Scrapers</h2>
          <p className="text-slate-300">
            Historial de ejecuciones de scraping MAEC y sistema de alertas.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <p className="text-slate-400 text-sm mt-2">
              Asegúrate de que el schema de Supabase está aplicado.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700">
            <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-slate-400 mb-2">Sin logs todavía</h3>
            <p className="text-slate-500">
              Los logs aparecerán cuando se ejecute el cron job.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`rounded-xl p-5 border ${statusColors[log.status] || 'bg-slate-800 border-slate-700'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <h3 className="text-white font-bold">{log.source}</h3>
                      <p className="text-slate-400 text-sm">
                        {new Date(log.started_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="text-center">
                      <span className="text-slate-400">Items</span>
                      <p className="text-white font-bold">{log.items_scraped}</p>
                    </div>
                    {log.duration_ms && (
                      <div className="text-center">
                        <span className="text-slate-400">Duración</span>
                        <p className="text-white font-bold">{log.duration_ms}ms</p>
                      </div>
                    )}
                    {log.metadata?.errors && (
                      <div className="text-center">
                        <span className="text-slate-400">Errores</span>
                        <p className="text-red-400 font-bold">{log.metadata.errors}</p>
                      </div>
                    )}
                  </div>
                </div>
                {log.errors && (
                  <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-red-400 text-xs font-mono">{log.errors}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}