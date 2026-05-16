'use client';

import { useState, useEffect } from 'react';
import type { HealthResult } from '@/lib/health-check';

interface Summary { ok: number; warn: number; fail: number; total: number; failed: HealthResult[] }

export default function HealthClient() {
  const [results, setResults] = useState<HealthResult[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchHealth() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      const data = await res.json();
      setResults(data.results);
      setSummary(data.summary);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { fetchHealth() }, []);

  const statusIcon = (s: string) => s === 'ok' ? '✅' : s === 'warn' ? '⚠️' : '❌';

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🩺 Health Check</h1>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Ejecutando...' : '🔄 Refresh'}
          </button>
        </div>

        {loading && !summary ? (
          <div className="text-center py-12 text-slate-400">Ejecutando health checks...</div>
        ) : !summary ? (
          <div className="text-center py-12 text-red-400">Error al cargar health checks</div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
                <div className="text-3xl font-bold text-green-400">{summary.ok}</div>
                <div className="text-xs text-slate-400 mt-1">OK</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
                <div className="text-3xl font-bold text-yellow-400">{summary.warn}</div>
                <div className="text-xs text-slate-400 mt-1">WARN</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
                <div className="text-3xl font-bold text-red-400">{summary.fail}</div>
                <div className="text-xs text-slate-400 mt-1">FAIL</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
                <div className="text-3xl font-bold text-slate-200">{summary.total}</div>
                <div className="text-xs text-slate-400 mt-1">Total</div>
              </div>
            </div>

            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3 border ${
                  r.status === 'ok' ? 'border-green-900/50' : r.status === 'warn' ? 'border-yellow-900/50' : 'border-red-900/50'
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{statusIcon(r.status)}</span>
                    <span className="text-sm font-medium truncate">{r.service}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {r.error && <span className="text-xs text-red-400 max-w-[200px] truncate" title={r.error}>{r.error}</span>}
                    <span className={`text-xs font-mono ${
                      r.status === 'ok' ? 'text-green-400' : r.status === 'warn' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {r.latencyMs != null ? `${r.latencyMs}ms` : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-6 text-center">
              Los health checks se ejecutan automáticamente cada día a las 06:00 UTC via master cron.
              Fallos 2 días seguidos envían alerta a Telegram.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
