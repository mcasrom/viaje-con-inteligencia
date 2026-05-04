'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Globe, Info } from 'lucide-react';

interface TCIData {
  country: {
    code: string;
    name: string;
    bandera: string;
    region: string;
    nivelRiesgo: string;
  };
  tci: number;
  trend: string;
  recommendation: string;
  factors: { label: string; value: number; weight: number; contribution: number }[];
  indices: {
    demand: number;
    oil: number;
    seasonality: number;
    ipc: number;
    risk: number;
  };
  monthlyPattern?: number[];
  monthlyAvg?: number;
}

export default function TravelCostIndex({ countryCode }: { countryCode?: string }) {
  const [data, setData] = useState<TCIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!countryCode) return;
    setLoading(true);
    fetch(`/api/flight-costs?country=${countryCode}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [countryCode]);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
        <div className="h-10 bg-slate-700 rounded w-1/4 mb-4" />
        <div className="h-4 bg-slate-700 rounded w-full" />
      </div>
    );
  }

  if (!data) return null;

  const { tci, trend, recommendation, factors, country, monthlyPattern } = data;

  const monthlyAvg = monthlyPattern && monthlyPattern.length > 0
    ? monthlyPattern.reduce((a: number, b: number) => a + b, 0) / monthlyPattern.length
    : 100;
  const tciDiff = Math.round((tci - monthlyAvg) * 10) / 10;
  const isPositive = tciDiff > 0;
  const isNeutral = Math.abs(tciDiff) < 5;

  const trendIcon = isNeutral ? (
    <Minus className="w-5 h-5 text-slate-400" />
  ) : isPositive ? (
    <TrendingUp className="w-5 h-5 text-rose-400" />
  ) : (
    <TrendingDown className="w-5 h-5 text-emerald-400" />
  );

  const trendColor = isNeutral
    ? 'text-slate-400'
    : isPositive
    ? 'text-rose-400'
    : 'text-emerald-400';

  const bgBadge = isNeutral
    ? 'bg-slate-500/10 border-slate-500/20 text-slate-400'
    : isPositive
    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

  const tciColor = tci < 90
    ? 'text-emerald-400'
    : tci < 100
    ? 'text-green-400'
    : tci < 110
    ? 'text-amber-400'
    : 'text-rose-400';

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Índice de Coste de Viaje</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {trendIcon}
          <span className={`text-sm font-medium ${trendColor}`}>{trend}</span>
        </div>
      </div>

      <div className="flex items-end gap-4 mb-6">
        <div>
          <span className={`text-5xl font-bold ${tciColor}`}>{tci}</span>
          <span className={`text-lg font-medium ml-2 ${trendColor}`}>
            {isPositive ? '+' : ''}{tciDiff}%
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium bg-badge">
          <span>vs media anual</span>
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-slate-300 text-sm whitespace-pre-line">{recommendation}</p>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between text-slate-400 hover:text-white text-sm font-medium transition-colors"
      >
        <span>Ver desglose de factores</span>
        {showDetails ? (
          <ArrowUpRight className="w-4 h-4" />
        ) : (
          <ArrowDownRight className="w-4 h-4" />
        )}
      </button>

      {showDetails && (
        <div className="mt-4 space-y-3">
          {factors.map((f) => {
            const factorTrend = f.value > 100 ? 'positive' : f.value < 100 ? 'negative' : 'neutral';
            const barColor = factorTrend === 'positive'
              ? 'bg-rose-500'
              : factorTrend === 'negative'
              ? 'bg-emerald-500'
              : 'bg-slate-500';

            return (
              <div key={f.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-300">{f.label}</span>
                  <span className={`font-medium ${
                    factorTrend === 'positive' ? 'text-rose-400' :
                    factorTrend === 'negative' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {f.value.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${barColor} transition-all`}
                    style={{ width: `${Math.min(f.value / 2, 100)}%` }}
                  />
                </div>
                <div className="text-slate-500 text-xs mt-0.5">Peso: {(f.weight * 100).toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
