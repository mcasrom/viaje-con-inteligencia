'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2,
  Clock, BarChart3, CheckCircle, Info, Zap, Database, Calendar,
  AlertCircle, Eye, Activity, Shield, Target, ChevronDown, ChevronUp,
} from 'lucide-react';

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

interface MLObservation {
  type: 'ok' | 'warning' | 'info' | 'critical';
  title: string;
  detail: string;
  action?: string;
}

export default function AdminMLPage() {
  const [history, setHistory] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>('status');

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
  const firstLog = history[history.length - 1];

  const daysOfData = firstLog
    ? Math.max(1, Math.ceil((Date.now() - new Date(firstLog.trained_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const maeTrend = (key: keyof TrainingLog) => {
    if (!latest || !prev) return 'neutral';
    const v = latest[key] as number;
    const p = prev[key] as number;
    if (v === null || p === null || v === undefined || p === undefined) return 'neutral';
    if (v < p) return 'up';
    if (v > p) return 'down';
    return 'neutral';
  };

  const observations: MLObservation[] = [];

  // Status observations
  if (latest) {
    if (latest.features_errors === 0 && latest.predictions_errors === 0) {
      observations.push({
        type: 'ok',
        title: 'Pipeline operativo',
        detail: `${latest.total_countries} países procesados sin errores. Features y predictions al 100%.`,
      });
    } else {
      observations.push({
        type: 'critical',
        title: 'Errores en pipeline',
        detail: `${latest.features_errors} errores en features, ${latest.predictions_errors} en predictions.`,
        action: 'Revisar logs del master cron para identificar países fallidos.',
      });
    }

    if (latest.rf_models > 0) {
      observations.push({
        type: 'ok',
        title: 'RandomForest entrenado',
        detail: `${latest.rf_models} modelos entrenados con ${latest.rf_samples} samples. Duración: ${(latest.duration_ms / 1000).toFixed(0)}s.`,
      });
    }

    // MAE riskScore trend
    const maeRS = latest.rf_mae_risk_score;
    if (maeRS !== null) {
      if (maeRS > 2) {
        observations.push({
          type: 'warning',
          title: 'MAE riskScore elevado',
          detail: `MAE actual: ${maeRS.toFixed(2)}. El modelo se desvía ~${maeRS.toFixed(1)} puntos del heurístico en promedio.`,
          action: 'Normal en las primeras semanas. Mejora con más datos históricos de MAEC.',
        });
      } else if (maeRS > 1) {
        observations.push({
          type: 'info',
          title: 'MAE riskScore en rango aceptable',
          detail: `MAE actual: ${maeRS.toFixed(2)}. Dentro de rango esperado para datos jóvenes.`,
        });
      } else {
        observations.push({
          type: 'ok',
          title: 'MAE riskScore óptimo',
          detail: `MAE actual: ${maeRS.toFixed(2)}. El modelo se alinea bien con el heurístico.`,
        });
      }
    }

    // MAE trend analysis
    if (prev && latest.rf_mae_risk_score !== null && prev.rf_mae_risk_score !== null) {
      const diff = latest.rf_mae_risk_score - prev.rf_mae_risk_score;
      if (diff > 0.3) {
        observations.push({
          type: 'warning',
          title: 'MAE riskScore subiendo',
          detail: `Incremento de +${diff.toFixed(2)} vs entrenamiento anterior (${prev.rf_mae_risk_score.toFixed(2)} → ${latest.rf_mae_risk_score.toFixed(2)}).`,
          action: 'Puede indicar mayor volatilidad en datos o necesidad de más muestras.',
        });
      } else if (diff < -0.1) {
        observations.push({
          type: 'ok',
          title: 'MAE riskScore mejorando',
          detail: `Reducción de ${diff.toFixed(2)} vs entrenamiento anterior. El modelo converge.`,
        });
      }
    }

    // Max deviation
    const maxDev = latest.rf_max_deviation_risk_score;
    if (maxDev !== null && maxDev > 10) {
      observations.push({
        type: 'warning',
        title: 'Desviación máxima alta',
        detail: `Desviación máx: ${maxDev.toFixed(2)} puntos. ${latest.countries_with_large_deviation} países con desviación significativa.`,
        action: 'Revisar países con mayor desviación en la tabla de abajo. Pueden indicar patrones que el RF captura pero el heurístico no.',
      });
    }

    // Data maturity
    if (daysOfData < 7) {
      observations.push({
        type: 'info',
        title: 'Datos muy jóvenes',
        detail: `Solo ${daysOfData} días de datos históricos. El modelo está en fase de calentamiento.`,
        action: 'Esperar al menos 25-30 días para validación temporal significativa.',
      });
    } else if (daysOfData < 30) {
      observations.push({
        type: 'info',
        title: 'Datos en acumulación',
        detail: `${daysOfData} días de datos. Fase intermedia — las predicciones mejoran gradualmente.`,
        action: 'Objetivo: alcanzar 30 días para activar validación temporal CV.',
      });
    } else {
      observations.push({
        type: 'ok',
        title: 'Datos suficientes para validación',
        detail: `${daysOfData} días de datos. Ya es posible validar predicciones vs cambios reales de riesgo.`,
      });
    }

    // Probability MAE
    const maeP7 = latest.rf_mae_prob_7d;
    if (maeP7 !== null && maeP7 < 0.001) {
      observations.push({
        type: 'ok',
        title: 'Probabilidades estables',
        detail: `MAE probUp 7d: ${(maeP7 * 100).toFixed(3)}%. El modelo es consistente en probabilidades de subida.`,
      });
    }

    // Confidence observation
    observations.push({
      type: 'info',
      title: 'Confianza de predicciones: baja',
      detail: 'Las predicciones individuales muestran "confianza baja" porque hay pocos datos OSINT por país. Mejorará con señales acumuladas.',
    });
  }

  const statusObservations = observations.filter(o => o.type === 'ok');
  const warningObservations = observations.filter(o => o.type === 'warning' || o.type === 'critical');
  const infoObservations = observations.filter(o => o.type === 'info');

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingDown className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const SectionToggle = ({ id, title, icon: Icon, count }: { id: string; title: string; icon: any; count?: number }) => (
    <button
      onClick={() => setExpanded(expanded === id ? null : id)}
      className="w-full flex items-center justify-between text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {count !== undefined && (
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      {expanded === id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Brain className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold text-white">IA — Estado y Observaciones</h1>
          <span className="ml-auto text-xs text-slate-500">
            {latest && `v${latest.model_version} · ${new Date(latest.trained_at).toLocaleString('es-ES')}`}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Status Panel */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <SectionToggle id="status" title="Estado del Sistema" icon={Activity} count={observations.length} />
          </div>
          {expanded === 'status' && (
            <div className="p-6 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-400">Datos históricos</span>
                  </div>
                  <p className="text-2xl font-bold text-white font-mono">{daysOfData} días</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400">Países</span>
                  </div>
                  <p className="text-2xl font-bold text-white font-mono">{latest?.total_countries ?? '-'}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-400">Modelos RF</span>
                  </div>
                  <p className="text-2xl font-bold text-white font-mono">{latest?.rf_models ?? '-'}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-400">Último train</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {latest ? `${(latest.duration_ms / 1000).toFixed(0)}s` : '-'}
                  </p>
                </div>
              </div>

              {/* Warnings first */}
              {warningObservations.length > 0 && (
                <div className="space-y-3">
                  {warningObservations.map((o, i) => (
                    <div key={i} className={`rounded-lg p-4 border ${o.type === 'critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${o.type === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                        <div>
                          <p className={`font-semibold text-sm ${o.type === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>{o.title}</p>
                          <p className="text-slate-300 text-sm mt-1">{o.detail}</p>
                          {o.action && <p className="text-slate-400 text-xs mt-2 italic">→ {o.action}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* OK items */}
              {statusObservations.length > 0 && (
                <div className="space-y-2">
                  {statusObservations.map((o, i) => (
                    <div key={i} className="flex items-start gap-3 bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-green-300">{o.title}</p>
                        <p className="text-slate-400 text-sm">{o.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info items */}
              {infoObservations.length > 0 && (
                <div className="space-y-2">
                  {infoObservations.map((o, i) => (
                    <div key={i} className="flex items-start gap-3 bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-blue-300">{o.title}</p>
                        <p className="text-slate-400 text-sm">{o.detail}</p>
                        {o.action && <p className="text-slate-500 text-xs mt-1 italic">→ {o.action}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Maturity Progress */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <SectionToggle id="maturity" title="Madurez de Datos" icon={Calendar} />
          </div>
          {expanded === 'maturity' && (
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progreso hacia validación temporal (30 días)</span>
                  <span className="text-white font-mono">{Math.min(daysOfData, 30)}/30 días</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${daysOfData >= 30 ? 'bg-green-500' : daysOfData >= 15 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((daysOfData / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Fase actual</p>
                  <p className="text-sm font-semibold text-white">
                    {daysOfData < 7 ? '🔵 Calentamiento' : daysOfData < 15 ? '🟡 Acumulación' : daysOfData < 30 ? '🟠 Maduración' : '🟢 Validación'}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Entrenamientos</p>
                  <p className="text-sm font-semibold text-white">{history.length}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Primer log</p>
                  <p className="text-sm font-semibold text-white">{firstLog ? new Date(firstLog.trained_at).toLocaleDateString('es-ES') : '-'}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  Roadmap de madurez ML
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={daysOfData >= 7 ? 'text-green-400' : 'text-slate-600'}>{daysOfData >= 7 ? '✅' : '⬜'}</span>
                    <span className={daysOfData >= 7 ? 'text-slate-300' : 'text-slate-500'}>7 días — Mínimo para detectar patrones semanales</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={daysOfData >= 15 ? 'text-green-400' : 'text-slate-600'}>{daysOfData >= 15 ? '✅' : '⬜'}</span>
                    <span className={daysOfData >= 15 ? 'text-slate-300' : 'text-slate-500'}>15 días — Features de sentimiento con 7d/30d window operativos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={daysOfData >= 25 ? 'text-green-400' : 'text-slate-600'}>{daysOfData >= 25 ? '✅' : '⬜'}</span>
                    <span className={daysOfData >= 25 ? 'text-slate-300' : 'text-slate-500'}>25 días — Validación temporal CV posible</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={daysOfData >= 30 ? 'text-green-400' : 'text-slate-600'}>{daysOfData >= 30 ? '✅' : '⬜'}</span>
                    <span className={daysOfData >= 30 ? 'text-slate-300' : 'text-slate-500'}>30 días — Validación completa: predicciones vs cambios reales</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={daysOfData >= 60 ? 'text-green-400' : 'text-slate-600'}>{daysOfData >= 60 ? '✅' : '⬜'}</span>
                    <span className={daysOfData >= 60 ? 'text-slate-300' : 'text-slate-500'}>60 días — Modelos estables, desviaciones significativas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Metrics */}
        {latest && (
          <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <SectionToggle id="metrics" title="Métricas Último Entrenamiento" icon={BarChart3} />
            </div>
            {expanded === 'metrics' && (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="MAE riskScore" value={latest.rf_mae_risk_score?.toFixed(2) ?? '-'} trend={maeTrend('rf_mae_risk_score')} />
                  <MetricCard label="MAE probUp 7d" value={latest.rf_mae_prob_7d != null ? (latest.rf_mae_prob_7d * 100).toFixed(3) + '%' : '-'} trend={maeTrend('rf_mae_prob_7d')} />
                  <MetricCard label="MAE probUp 14d" value={latest.rf_mae_prob_14d != null ? (latest.rf_mae_prob_14d * 100).toFixed(3) + '%' : '-'} trend={maeTrend('rf_mae_prob_14d')} />
                  <MetricCard label="MAE probUp 30d" value={latest.rf_mae_prob_30d != null ? (latest.rf_mae_prob_30d * 100).toFixed(3) + '%' : '-'} trend={maeTrend('rf_mae_prob_30d')} />
                  <MetricCard label="Desviación máx" value={latest.rf_max_deviation_risk_score?.toFixed(2) ?? '-'} trend="neutral" />
                  <MetricCard label="Países c/desviación" value={String(latest.countries_with_large_deviation)} trend="neutral" />
                  <MetricCard label="Features OK" value={`${latest.features_computed}/${latest.total_countries}`} trend="neutral" />
                  <MetricCard label="Predictions OK" value={`${latest.predictions_made}/${latest.total_countries}`} trend="neutral" />
                </div>

                <div className="mt-6 bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-2">Cómo interpretar estas métricas</h3>
                  <div className="space-y-2 text-xs text-slate-400">
                    <p><strong className="text-slate-300">MAE (Mean Absolute Error):</strong> Diferencia media entre la predicción RF y el valor heurístico. <strong className="text-slate-300">A menor MAE, mejor.</strong></p>
                    <p><strong className="text-slate-300">probUp 7d/14d/30d:</strong> Probabilidad de que el riesgo suba. MAE en porcentaje — error medio en puntos porcentuales.</p>
                    <p><strong className="text-slate-300">Desviación máxima:</strong> País donde RF y heurístico más difieren. &gt;5 indica que el modelo ve algo distinto al heurístico.</p>
                    <p><strong className="text-slate-300">Nota:</strong> Los RF se entrenan contra heurísticos, no contra datos reales. La validación real requiere ≥30 días de <em>maec_risk_history</em>.</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Deviation countries */}
        {latest && latest.countries_with_large_deviation > 0 && (
          <section className="bg-slate-800 rounded-xl border border-amber-500/20 overflow-hidden">
            <div className="p-6 border-b border-amber-500/20">
              <SectionToggle id="deviations" title="Países con Desviación" icon={Shield} count={latest.countries_with_large_deviation} />
            </div>
            {expanded === 'deviations' && (
              <div className="p-6">
                <p className="text-sm text-slate-400 mb-4">
                  {latest.countries_with_large_deviation} países donde la predicción RF difiere significativamente del heurístico.
                  Datos completos en <code className="text-purple-400 bg-slate-700 px-1 rounded">/api/cron/compare-models</code>.
                </p>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-500">
                    💡 Estos países merecen atención manual — el modelo puede estar detectando patrones que el heurístico no captura, o viceversa.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* History table */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <SectionToggle id="history" title="Historial de Entrenamientos" icon={Database} count={history.length} />
          </div>
          {expanded === 'history' && (
            <div className="p-6">
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
                    {history.map((row) => (
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
            </div>
          )}
        </section>

        {/* Architecture summary */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <SectionToggle id="architecture" title="Arquitectura ML" icon={Brain} />
          </div>
          {expanded === 'architecture' && (
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-2">Heurístico (ml-risk-predictor.ts)</h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• riskNum base (MAEC + US State Dept)</li>
                    <li>• OSINT signals (critical/high/medium count)</li>
                    <li>• Incidentes activos</li>
                    <li>• Matriz de transición histórica</li>
                    <li>• Estacionalidad turística</li>
                    <li>• Sentimiento GDELT (tone_score)</li>
                    <li>• Índices: GPI, GTI, HDI, IPC, TCI</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-2">RandomForest (ml-trainer-rf.ts)</h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• 50 estimadores, max_depth 8</li>
                    <li>• 25 features de entrada</li>
                    <li>• Entrena contra predicciones heurísticas</li>
                    <li>• 4 modelos: riskScore, probUp7d/14d/30d</li>
                    <li>• Comparación automática RF vs heurístico</li>
                    <li>• MAE tracking por métrica</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-2">Trend Predictor (trend-predictor.ts)</h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Probabilidad de subida/bajada 7d</li>
                    <li>• Ajuste por presión OSINT + incidentes</li>
                    <li>• Confianza basada en datos disponibles</li>
                    <li>• Factores explicativos por país</li>
                    <li>• Logging diario en trend_predictions</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-2">Endpoints Públicos</h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• <code className="text-purple-400">/api/ml/predict/[country]</code> — Tendencia</li>
                    <li>• <code className="text-purple-400">/api/ml/score</code> — Score por perfil</li>
                    <li>• <code className="text-purple-400">/api/ml/features</code> — Features raw</li>
                    <li>• <code className="text-purple-400">/api/ml/cost-estimate</code> — Coste vuelo</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-white mb-2">Cron Jobs ML</h3>
                <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">🟢</span>
                    <div>
                      <strong className="text-slate-300">Model Training</strong> (6/8)
                      <p>Entrena RF + compara vs heurístico. Timeout 5s (fire-and-forget a /api/cron/train-models).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">🟢</span>
                    <div>
                      <strong className="text-slate-300">Trend Predictions</strong> (8h/8)
                      <p>Predice tendencia para 136 países. Timeout 120s. Log en trend_predictions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

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
