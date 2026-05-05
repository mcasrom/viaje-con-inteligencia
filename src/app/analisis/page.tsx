'use client';
import type { Metadata } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Droplet, AlertTriangle, Shield, TrendingUp, TrendingDown, Minus, Loader2, BarChart3, Globe, Plane, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';

export const metadata: Metadata = {
  title: 'Análisis de Petróleo y Vuelos | Impacto en Viajes - Viaje con Inteligencia',
  description: 'Análisis del precio del petróleo y su impacto en vuelos. Predicciones y tendencias para planificar viajes inteligentes.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/analisis',
  },
};

interface OilImpact {
  currentPrice: number;
  avgPrice: number;
  changePct: number;
  trend: 'up' | 'down' | 'stable';
  months: { month: string; price: number; tciImpact: number }[];
}

interface ConflictImpact {
  totalClosures: number;
  totalRoutesAffected: number;
  worstAffected: { country: string; flag: string; surcharge: number; reason: string }[];
  avgSurcharge: number;
}

interface DemandShift {
  conflictBeneficiaries: { country: string; flag: string; name: string; extraDemandPct: number; reason: string }[];
  oilSensitive: { country: string; flag: string; name: string; oilImpact: number }[];
  safeHavens: { country: string; flag: string; name: string; riskScore: number; tci: number }[];
}

export default function AnalisisPage() {
  const [oilImpact, setOilImpact] = useState<OilImpact | null>(null);
  const [conflictImpact, setConflictImpact] = useState<ConflictImpact | null>(null);
  const [demandShift, setDemandShift] = useState<DemandShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'oil' | 'conflicts' | 'shifts'>('oil');

  useEffect(() => {
    Promise.all([
      fetch('/api/oil-price?action=impact').then(r => r.json()),
      fetch('/api/oil-price?action=conflicts').then(r => r.json()),
      fetch('/api/oil-price?action=shifts').then(r => r.json()),
    ]).then(([oil, conflicts, shifts]) => {
      setOilImpact(oil);
      setConflictImpact(conflicts);
      setDemandShift(shifts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-slate-400 text-sm">Cargando análisis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Análisis Global ML</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Análisis de Impacto Global
          </h1>
          <p className="text-slate-400">
            Cómo afectan los conflictos, el precio del petróleo y las amenazas globales al comportamiento turístico. Datos ML y patrones de redistribución.
          </p>
        </div>

        {/* KPIs Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 text-xs font-medium">Petróleo Brent</span>
            </div>
            <div className="text-2xl font-bold text-white">${oilImpact?.currentPrice}</div>
            <div className={`text-xs flex items-center gap-1 ${oilImpact && oilImpact.changePct < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {oilImpact && oilImpact.changePct < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {oilImpact && oilImpact.changePct > 0 ? '+' : ''}{oilImpact?.changePct ?? 0}% vs media
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-slate-400 text-xs font-medium">Rutas Afectadas</span>
            </div>
            <div className="text-2xl font-bold text-white">{conflictImpact?.totalRoutesAffected}</div>
            <div className="text-xs text-slate-400">{conflictImpact?.totalClosures} espacios aéreos cerrados</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-xs font-medium">Sobrecoste Medio</span>
            </div>
            <div className="text-2xl font-bold text-white">+{conflictImpact?.avgSurcharge}%</div>
            <div className="text-xs text-slate-400">por desvío de ruta</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 text-xs font-medium">Destinos Seguros</span>
            </div>
            <div className="text-2xl font-bold text-white">{demandShift?.safeHavens.length}</div>
            <div className="text-xs text-emerald-400">beneficiarios de redirección</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700/50">
          {[
            { key: 'oil' as const, label: 'Petróleo', icon: <Droplet className="w-4 h-4" /> },
            { key: 'conflicts' as const, label: 'Conflictos', icon: <AlertTriangle className="w-4 h-4" /> },
            { key: 'shifts' as const, label: 'Redistribución', icon: <Globe className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Oil Tab */}
        {activeTab === 'oil' && oilImpact && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Histórico del Brent y su Impacto en TCI</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={oilImpact.months}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: '#f59e0b' }}
                    />
                    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="tciImpact" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }} name="Impacto TCI %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-slate-500 text-xs mt-2">* Impacto TCI: desviación del precio del barril respecto a la media histórica. Positivo = encarece viajes, negativo = abarata.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {oilImpact.months.slice(-6).map((m, i) => (
                <div key={i} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-slate-400 text-xs">{m.month}</div>
                  <div className="text-white font-bold">${m.price}</div>
                  <div className={`text-xs ${m.tciImpact < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.tciImpact > 0 ? '+' : ''}{m.tciImpact}% TCI
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conflicts Tab */}
        {activeTab === 'conflicts' && conflictImpact && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Rutas Más Afectadas por Conflictos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conflictImpact.worstAffected}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="country" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="surcharge" name="Sobrecoste %">
                      {conflictImpact.worstAffected.map((_, i) => (
                        <Cell key={i} fill={i < 2 ? '#ef4444' : i < 4 ? '#f97316' : '#eab308'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conflictImpact.worstAffected.map((r, i) => (
                <div key={i} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{r.flag}</span>
                    <div>
                      <div className="text-white font-medium">{r.country}</div>
                      <div className="text-slate-500 text-xs">{r.reason}</div>
                    </div>
                    <div className="ml-auto">
                      <span className={`text-lg font-bold ${r.surcharge > 20 ? 'text-rose-400' : r.surcharge > 10 ? 'text-amber-400' : 'text-yellow-400'}`}>
                        +{r.surcharge}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shifts Tab */}
        {activeTab === 'shifts' && demandShift && (
          <div className="space-y-6">
            {/* Conflict Beneficiaries */}
            <div className="bg-slate-800/60 rounded-xl border border-emerald-500/20 p-6">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Países Beneficiados por Conflictos
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                Destinos seguros que captan turismo redirigido de zonas en conflicto o espacio aéreo cerrado.
              </p>
              <div className="space-y-3">
                {demandShift.conflictBeneficiaries.map((b, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-700/30 rounded-lg p-3">
                    <span className="text-2xl">{b.flag}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{b.name}</div>
                      <div className="text-slate-400 text-xs">{b.reason}</div>
                    </div>
                    <div className="text-emerald-400 font-bold text-sm">+{b.extraDemandPct}% demanda</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Oil-Sensitive Destinations */}
            <div className="bg-slate-800/60 rounded-xl border border-amber-500/20 p-6">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-amber-400" />
                Destinos Más Sensibles al Petróleo
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                Destinos de largo radio cuyo TCI se ve más impactado por el precio del barril.
              </p>
              <div className="space-y-3">
                {demandShift.oilSensitive.map((o, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-700/30 rounded-lg p-3">
                    <span className="text-2xl">{o.flag}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{o.name}</div>
                      <div className="text-slate-400 text-xs">Impacto petróleo en TCI</div>
                    </div>
                    <div className={`font-bold text-sm ${o.oilImpact > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {o.oilImpact > 0 ? '+' : ''}{o.oilImpact}pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe Havens */}
            <div className="bg-slate-800/60 rounded-xl border border-cyan-500/20 p-6">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Refugios Seguros (Safe Havens)
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                Destinos con bajo riesgo MAEC y TCI asequible — ideales cuando hay inestabilidad global.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {demandShift.safeHavens.map((s, i) => (
                  <div key={i} className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <span className="text-3xl">{s.flag}</span>
                    <div className="text-white font-medium text-sm mt-1">{s.name}</div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-xs text-slate-400">Riesgo:</span>
                      <span className="text-emerald-400 font-bold text-xs">{s.riskScore}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-slate-400">TCI:</span>
                      <span className={`font-bold text-xs ${s.tci < 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.tci}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
