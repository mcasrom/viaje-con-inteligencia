'use client';
import type { Metadata } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Droplet, TrendingUp, TrendingDown, BarChart3, Shield, AlertTriangle, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const metadata: Metadata = {
  title: 'Análisis Petróleo ML | Predicciones de Crudo - Viaje con Inteligencia',
  description: 'Predicciones del precio del petróleo con machine learning. Impacto en vuelos y costes de viaje. Análisis de conflictos.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/petroleo',
  },
};

interface OilMLData {
  timestamp: string;
  past: {
    period: string;
    startPrice: number;
    currentPrice: number;
    change: number;
    changePct: number;
    trend: string;
    volatility: number;
    maxPrice: number;
    minPrice: number;
  };
  present: {
    currentPrice: number;
    ma7: number;
    ma30: number;
    ema: number;
    momentum7d: number;
    momentum30d: number;
    rsi: number;
    aboveMA7: boolean;
    aboveMA30: boolean;
  };
  future: {
    prediction7d: number;
    prediction14d: number;
    prediction30d: number;
    confidence: number;
    scenarios: {
      bullish: { price: number; probability: number; reason: string };
      base: { price: number; probability: number; reason: string };
      bearish: { price: number; probability: number; reason: string };
    };
    riskFactors: { date: string; event: string; impactUSD: string }[];
  };
  conflictEvents: { date: string; event: string; impact: number }[];
}

export default function PetroleoPage() {
  const [data, setData] = useState<OilMLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'past' | 'present' | 'future'>('present');

  useEffect(() => {
    fetch('/api/oil-ml-analysis')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-slate-400 text-sm">Analizando datos OSINT + ML...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400">Error al cargar datos.</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-blue-400 text-sm hover:underline">Reintentar</button>
        </div>
      </div>
    );
  }

  const { past, present, future } = data;

  const chartData = [
    { label: 'Inicio', price: past.startPrice },
    { label: 'Mes 1', price: past.startPrice + (past.currentPrice - past.startPrice) * 0.25 },
    { label: 'Mes 2', price: past.startPrice + (past.currentPrice - past.startPrice) * 0.5 },
    { label: 'Mes 3', price: past.startPrice + (past.currentPrice - past.startPrice) * 0.75 },
    { label: 'Actual', price: past.currentPrice },
    { label: '+7d (ML)', price: future.prediction7d },
    { label: '+14d (ML)', price: future.prediction14d },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Droplet className="w-8 h-8 text-amber-400" />Petróleo Brent — Análisis OSINT + ML
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Datos scraping en tiempo real · Predicción ML · Impacto geopolítico
            </p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-5 py-3 text-center">
            <div className="text-slate-400 text-xs">Precio actual</div>
            <div className={`text-3xl font-bold ${present.momentum7d > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              ${present.currentPrice}
            </div>
            <div className={`flex items-center gap-1 text-xs ${present.momentum7d > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {present.momentum7d > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {present.momentum7d > 0 ? '+' : ''}{present.momentum7d}% (7d)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/60 rounded-lg p-1.5 border border-slate-700/50">
          {[
            { id: 'past' as const, label: 'Pasado', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'present' as const, label: 'Presente', icon: <Droplet className="w-4 h-4" /> },
            { id: 'future' as const, label: 'Futuro (ML)', icon: <TrendingUp className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                activeTab === tab.id ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Evolución + Proyección ML</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} fill="url(#priceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'past' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">Inicio periodo</div>
                <div className="text-2xl font-bold text-white">${past.startPrice}</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">Máximo</div>
                <div className="text-2xl font-bold text-red-400">${past.maxPrice}</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">Mínimo</div>
                <div className="text-2xl font-bold text-emerald-400">${past.minPrice}</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">Variación</div>
                <div className={`text-2xl font-bold ${past.changePct > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {past.changePct > 0 ? '+' : ''}{past.changePct}%
                </div>
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-3">Eventos Geopolíticos que Impactaron</h3>
              <div className="space-y-3">
                {data.conflictEvents.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{e.event}</div>
                      <div className="text-slate-500 text-xs">{e.date}</div>
                    </div>
                    <span className="text-red-400 text-xs font-bold">+${e.impact}/barril</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'present' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">Media Móvil 7d</div>
                <div className="text-2xl font-bold text-white">${present.ma7}</div>
                <div className={`text-xs flex items-center gap-1 ${present.aboveMA7 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {present.aboveMA7 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Precio {present.aboveMA7 ? 'sobre' : 'bajo'} MA7
                </div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">Media Móvil 30d</div>
                <div className="text-2xl font-bold text-white">${present.ma30}</div>
                <div className={`text-xs flex items-center gap-1 ${present.aboveMA30 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {present.aboveMA30 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Precio {present.aboveMA30 ? 'sobre' : 'bajo'} MA30
                </div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">RSI (Fuerza)</div>
                <div className={`text-2xl font-bold ${present.rsi > 70 ? 'text-red-400' : present.rsi < 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {present.rsi}
                </div>
                <div className="text-xs text-slate-500">
                  {present.rsi > 70 ? 'Sobrecompra' : present.rsi < 30 ? 'Sobreventa' : 'Neutral'}
                </div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">EMA (Exponencial)</div>
                <div className="text-2xl font-bold text-white">${present.ema}</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">Momentum 30d</div>
                <div className={`text-2xl font-bold ${present.momentum30d > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {present.momentum30d > 0 ? '+' : ''}{present.momentum30d}%
                </div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-slate-400 text-xs mb-1">Volatilidad</div>
                <div className="text-2xl font-bold text-amber-400">{past.volatility}</div>
                <div className="text-xs text-slate-500">Desviación estándar</div>
              </div>
            </div>
            <div className="bg-slate-800/60 border border-red-500/20 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Prima de Riesgo Geopolítico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold text-red-400">${data.conflictEvents.reduce((s, e) => s + e.impact, 0)}</div>
                  <div className="text-slate-400 text-sm">USD/barril en primas de conflicto acumuladas</div>
                </div>
                <div className="space-y-2">
                  {data.conflictEvents.slice(0, 4).map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-slate-300">{e.event}</span>
                      <span className="text-red-400 font-bold text-xs">+${e.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'future' && (
          <div className="space-y-6">
            {/* Predictions */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center">
                <div className="text-slate-400 text-xs mb-2">Predicción 7 días</div>
                <div className="text-3xl font-bold text-white">${future.prediction7d}</div>
                <div className={`text-xs mt-1 ${(future.prediction7d - present.currentPrice) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {(future.prediction7d - present.currentPrice) > 0 ? '+' : ''}{Math.round((future.prediction7d - present.currentPrice) * 100) / 100} USD
                </div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center">
                <div className="text-slate-400 text-xs mb-2">Predicción 14 días</div>
                <div className="text-3xl font-bold text-white">${future.prediction14d}</div>
                <div className={`text-xs mt-1 ${(future.prediction14d - present.currentPrice) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {(future.prediction14d - present.currentPrice) > 0 ? '+' : ''}{Math.round((future.prediction14d - present.currentPrice) * 100) / 100} USD
                </div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center">
                <div className="text-slate-400 text-xs mb-2">Confianza ML</div>
                <div className="text-3xl font-bold text-amber-400">{future.confidence}%</div>
                <div className="text-xs text-slate-500 mt-1">Regresión + EMA</div>
              </div>
            </div>

            {/* Scenarios */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">Escenarios Probables</h3>
              <div className="space-y-4">
                {[
                  { key: 'bullish' as const, color: 'red', label: 'Alcista', data: future.scenarios.bullish },
                  { key: 'base' as const, color: 'amber', label: 'Base', data: future.scenarios.base },
                  { key: 'bearish' as const, color: 'emerald', label: 'Bajista', data: future.scenarios.bearish },
                ].map(s => (
                  <div key={s.key} className="flex items-center gap-4 bg-slate-700/30 rounded-lg p-4">
                    <div className={`w-12 h-12 rounded-full bg-${s.color}-500/20 flex items-center justify-center`}>
                      <span className={`text-${s.color}-400 font-bold text-sm`}>{s.data.probability}%</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-${s.color}-400 font-bold`}>{s.label}</span>
                        <span className="text-white font-bold text-lg">${s.data.price}</span>
                      </div>
                      <div className="text-slate-400 text-xs">{s.data.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Factores de Riesgo que Mueven el Precio
              </h3>
              <div className="space-y-3">
                {future.riskFactors.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{r.event}</div>
                      <div className="text-slate-500 text-xs">{r.date}</div>
                    </div>
                    <span className="text-red-400 text-xs font-bold">{r.impactUSD}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-xs text-slate-500">
              Método: Regresión lineal + Suavizado exponencial + Análisis de sentimiento geopolítico
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
