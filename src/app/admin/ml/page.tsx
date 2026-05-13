'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2, Clock, BarChart3 } from 'lucide-react';

interface TrainingLog {
  id: number;
  model_version: string;
  trained_at: string;
  features_computed: number;
  features_errors: number;
  predictions_made: number;
  predictions_errors: number;
  total_countries: number;
  duration_ms: number;
  rf_models: number;
  rf_samples: number;
  rf_mae_risk_score: number | null;
  rf_mae_prob_7d: number | null;
  rf_mae_prob_14d: number | null;
  rf_mae_prob_30d: number | null;
  rf_max_deviation_risk_score: number | null;
  countries_with_large_deviation: number;
}

export default function AdminMLPage() {
  const [history, setHistory] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/ml')
      .then(r => r.json())
      .then(d => { setHistory(d.history); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const latest = history[0];
  const prev = history[1];
  const maeTrend = (key: keyof TrainingLog) => {
    if (!latest || !prev) return 'neutral';
    const v = latest[key] as number;
    const p = prev[key] as number;
    if (v === null || p === null || v === undefined || p === undefined) return 'neutral';
    if (v < p) return 'up';
    if (v > p) return 'down';
    return 'neutral';
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingDown className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Brain className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold text-white">ML — Evolución</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {latest && (
          <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Último entrenamiento
              <span className="text-xs text-slate-500 font-normal ml-auto">
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date(latest.trained_at).toLocaleString('es-ES')}
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="MAE riskScore" value={latest.rf_mae_risk_score?.toFixed(2) ?? '-'} trend={maeTrend('rf_mae_risk_score')} />
              <MetricCard label="MAE probUp 7d" value={latest.rf_mae_prob_7d != null ? (latest.rf_mae_prob_7d * 100).toFixed(2) + '%' : '-'} trend={maeTrend('rf_mae_prob_7d')} />
              <MetricCard label="MAE probUp 14d" value={latest.rf_mae_prob_14d != null ? (latest.rf_mae_prob_14d * 100).toFixed(2) + '%' : '-'} trend={maeTrend('rf_mae_prob_14d')} />
              <MetricCard label="MAE probUp 30d" value={latest.rf_mae_prob_30d != null ? (latest.rf_mae_prob_30d * 100).toFixed(2) + '%' : '-'} trend={maeTrend('rf_mae_prob_30d')} />
              <MetricCard label="Desviación máx" value={latest.rf_max_deviation_risk_score?.toFixed(2) ?? '-'} trend="neutral" />
              <MetricCard label="Países c/desviación" value={String(latest.countries_with_large_deviation)} trend="neutral" />
              <MetricCard label="Países procesados" value={String(latest.total_countries)} trend="neutral" />
              <MetricCard label="Duración" value={latest.duration_ms ? `${(latest.duration_ms / 1000).toFixed(0)}s` : '-'} trend="neutral" />
            </div>
          </section>
        )}

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Historial de entrenamientos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Versión</th>
                  <th className="text-left py-2 pr-4">Fecha</th>
                  <th className="text-right py-2 pr-4">MAE riskScore</th>
                  <th className="text-right py-2 pr-4">MAE 7d</th>
                  <th className="text-right py-2 pr-4">MAE 14d</th>
                  <th className="text-right py-2 pr-4">MAE 30d</th>
                  <th className="text-right py-2 pr-4">Desv. máx</th>
                  <th className="text-right py-2 pr-4">Países</th>
                  <th className="text-right py-2">Duración</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={row.id} className="border-b border-slate-700/50 text-slate-300 hover:bg-slate-700/30">
                    <td className="py-2 pr-4 text-slate-500">{row.id}</td>
                    <td className="py-2 pr-4">{row.model_version}</td>
                    <td className="py-2 pr-4 text-xs">{new Date(row.trained_at).toLocaleString('es-ES')}</td>
                    <td className="py-2 pr-4 text-right font-mono">{row.rf_mae_risk_score?.toFixed(2) ?? '-'}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{row.rf_mae_prob_7d != null ? (row.rf_mae_prob_7d * 100).toFixed(2) : '-'}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{row.rf_mae_prob_14d != null ? (row.rf_mae_prob_14d * 100).toFixed(2) : '-'}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{row.rf_mae_prob_30d != null ? (row.rf_mae_prob_30d * 100).toFixed(2) : '-'}</td>
                    <td className="py-2 pr-4 text-right font-mono">{row.rf_max_deviation_risk_score?.toFixed(2) ?? '-'}</td>
                    <td className="py-2 pr-4 text-right">{row.total_countries}</td>
                    <td className="py-2 text-right text-xs text-slate-500">{row.duration_ms ? `${(row.duration_ms / 1000).toFixed(0)}s` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {latest && latest.countries_with_large_deviation > 0 && (
          <section className="bg-slate-800 rounded-xl border border-amber-500/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Países con desviación grande ({latest.countries_with_large_deviation})
            </h2>
            <p className="text-sm text-slate-400">
              Se detectaron {latest.countries_with_large_deviation} países donde la predicción RF difiere significativamente del heurístico.
              Datos disponibles en la respuesta de <code className="text-purple-400 bg-slate-700 px-1 rounded">/api/cron/compare-models</code>.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        {trend !== 'neutral' && (
          trend === 'up' ? <TrendingDown className="w-3.5 h-3.5 text-green-400" /> : <TrendingUp className="w-3.5 h-3.5 text-red-400" />
        )}
      </div>
      <p className="text-xl font-bold text-white font-mono">{value}</p>
    </div>
  );
}
