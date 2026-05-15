'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Crown, Share2, FileText, Map, Brain, TrendingUp, Calendar, AlertTriangle, Shield, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import PremiumRiskMap from '@/components/PremiumRiskMap';

interface InfografiaData {
  id: string;
  week_start: string;
  week_end: string;
  edition: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  gwi_score: number | null;
  gwi_trend: number | null;
  country_count: number | null;
  top_risk_countries: string[] | null;
  data_snapshot: any;
  is_published: boolean;
  published_at: string;
  pdf_url: string | null;
  ai_analysis: string | null;
  premium_data: any;
}

function formatDate(d: string) {
  try { return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return d; }
}

function gwiColor(score: number): string {
  if (score < 25) return 'text-green-400';
  if (score < 45) return 'text-lime-400';
  if (score < 60) return 'text-amber-400';
  if (score < 75) return 'text-red-400';
  return 'text-red-600';
}

export default function InfografiaDetailClient({ infografia }: { infografia: InfografiaData | null }) {
  const [generatingPremium, setGeneratingPremium] = useState(false);
  const [premiumData, setPremiumData] = useState<{ pdf_url?: string; ai_analysis?: string }>({
    pdf_url: infografia?.pdf_url || undefined,
    ai_analysis: infografia?.ai_analysis || undefined,
  });
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: infografia?.title || 'Infografía', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  }, [infografia]);

  if (!infografia) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">Infografía no encontrada</p>
          <Link href="/infografias" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
            ← Volver al archivo
          </Link>
        </div>
      </div>
    );
  }

  const data = infografia.data_snapshot || {};
  const snapData = data as any;

  const handleGeneratePremium = async () => {
    setGeneratingPremium(true);
    try {
      const res = await fetch(`/api/infografias/${infografia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatePremium: true }),
      });
      const json = await res.json();
      if (json.success) {
        setPremiumData({ pdf_url: json.imageUrl });
        // Refetch for AI analysis
        const refetch = await fetch(`/api/infografias/${infografia.id}`);
        const updated = await refetch.json();
        setPremiumData({ pdf_url: updated.pdf_url, ai_analysis: updated.ai_analysis });
      }
    } catch {} finally {
      setGeneratingPremium(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back + navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/infografias" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Archivo de infografías
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 text-sm transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Compartir'}
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/10 via-slate-900 to-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-mono font-bold tracking-wider">EDICIÓN #{infografia.edition}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{infografia.title}</h1>
          <p className="text-slate-400">{formatDate(infografia.week_start)} — {formatDate(infografia.week_end)}</p>

          {infografia.gwi_score !== null && (
            <div className="mt-4 flex items-center gap-6">
              <div>
                <div className="text-xs text-slate-500 font-mono mb-1">GLOBAL WEEKLY INDEX</div>
                <div className={`text-5xl font-bold font-mono ${gwiColor(infografia.gwi_score)}`}>
                  {infografia.gwi_score.toFixed(1)}
                </div>
                {infografia.gwi_trend !== null && (
                  <div className={`text-sm font-mono mt-1 ${infografia.gwi_trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {infografia.gwi_trend > 0 ? '▲' : '▼'} {Math.abs(infografia.gwi_trend).toFixed(1)} vs semana anterior
                  </div>
                )}
              </div>
              {infografia.country_count && (
                <div className="text-sm text-slate-400">
                  <span className="text-slate-500">{infografia.country_count}</span> países monitoreados
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Infographic image */}
          <div>
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
              {infografia.image_url ? (
                <img
                  src={infografia.image_url}
                  alt={infografia.title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center">
                  <Shield className="w-16 h-16 text-slate-700" />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar with data */}
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-mono text-blue-400 font-bold tracking-wider mb-4">MÉTRICAS CLAVE</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Riesgo alto/muy alto</div>
                  <div className="text-2xl font-bold text-red-400">{snapData?.stats?.altoOMuyAlto || '—'}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Seguro/bajo riesgo</div>
                  <div className="text-2xl font-bold text-green-400">{snapData?.stats?.seguroOBajo || '—'}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Incidentes semanales</div>
                  <div className="text-2xl font-bold text-amber-400">{snapData?.incidentsThisWeek || 0}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Cambios de riesgo</div>
                  <div className="text-2xl font-bold text-blue-400">{snapData?.countriesChanged?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Top risk countries */}
            {infografia.top_risk_countries && infografia.top_risk_countries.length > 0 && (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-sm font-mono text-red-400 font-bold tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  TOP PAÍSES RIESGO
                </h3>
                <ol className="space-y-2">
                  {infografia.top_risk_countries.slice(0, 10).map((name, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-600 font-mono w-5">{String(i + 1).padStart(2, ' ')}</span>
                      <span className="text-slate-300">{name}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Risk distribution */}
            {snapData?.riskDistribution && (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-sm font-mono text-amber-400 font-bold tracking-wider mb-3">DISTRIBUCIÓN RIESGO</h3>
                <div className="space-y-2">
                  {Object.entries(snapData.riskDistribution).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400 w-24">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(v / snapData.stats?.totalPaises) * 100}%`, background: k === 'muyAlto' ? '#991b1b' : k === 'alto' ? '#ef4444' : k === 'medio' ? '#f59e0b' : k === 'bajo' ? '#84cc16' : '#22c55e' }}
                        />
                      </div>
                      <span className="text-white font-mono w-8 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Premium section */}
            <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-400">CONTENIDO PREMIUM</h3>
              </div>

              {premiumData.pdf_url ? (
                <div className="space-y-3">
                  <a
                    href={premiumData.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-sm text-white font-medium">PDF Descargable</div>
                      <div className="text-xs text-slate-400">Informe completo listo para imprimir</div>
                    </div>
                    <Download className="w-4 h-4 text-amber-400 ml-auto" />
                  </a>

                  {premiumData.ai_analysis && (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-mono text-purple-400 font-bold">ANÁLISIS IA</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{premiumData.ai_analysis}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <FileText className="w-4 h-4 text-amber-400/70" />
                      PDF descargable
                    </div>
                    <div className="flex items-center gap-3 text-sm text-amber-300">
                      <Map className="w-4 h-4 text-amber-400" />
                      <a href="#risk-map" className="hover:underline">Mapa interactivo de riesgos</a>
                      <span className="text-[10px] text-amber-500/70 font-mono">DISPONIBLE</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Brain className="w-4 h-4 text-amber-400/70" />
                      Análisis ampliado con IA
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <TrendingUp className="w-4 h-4 text-amber-400/70" />
                      Comparativa histórica
                    </div>
                  </div>
                  <button
                    onClick={handleGeneratePremium}
                    disabled={generatingPremium}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                  >
                    {generatingPremium ? (
                      <>Generando...</>
                    ) : (
                      <><Crown className="w-4 h-4" /> Generar contenido Premium</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive risk map - full width */}
        <div id="risk-map" className="mt-8">
          <PremiumRiskMap infografiaId={infografia.id} />
        </div>
      </div>
    </div>
  );
}
