'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DatoPais } from '@/data/paises';
import {
  ArrowLeft, Plane, TrendingUp, TrendingDown, Minus,
  Wallet, Calendar, MapPin, ChevronDown, ChevronUp,
  DollarSign, Shield, Thermometer, Info, Globe,
  ArrowUpRight, ArrowDownRight, ExternalLink, AlertTriangle,
  Target, Activity, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export interface TCIResult {
  tci: number;
  trend: string;
  recommendation: string;
  factors: { label: string; value: number; weight: number; contribution: number }[];
}

export interface MLAnalysis {
  weeklyData: { week: string; value: number }[];
  trend4Weeks: { direction: 'up' | 'down' | 'stable'; change: number };
  trend12Weeks: { direction: 'up' | 'down' | 'stable'; change: number };
  prediction: { nextWeek: number; nextMonth: number; confidence: number };
  bestWeekToBook: { week: number; month: string; savingsPct: number };
  volatility: 'low' | 'medium' | 'high';
}

export interface ConflictImpact {
  isAffected: boolean;
  surchargePct: number;
  timeExtraHours: number;
  closedAirspace: string;
  reason: string;
  alternativeRoute: string;
}

export interface BudgetResult {
  mochilero: { min: number; max: number };
  medio: { min: number; max: number };
  lujo: { min: number; max: number };
  notas: string[];
}

interface Props {
  pais: DatoPais;
  tci: TCIResult;
  mlAnalysis: MLAnalysis;
  conflict: ConflictImpact;
  budget: BudgetResult;
  mesIdeal: { mejor: string; evitar: string };
  alternativas: { code: string; name: string; bandera: string; tci: number; trend: string; region: string }[];
  masCaros: { code: string; name: string; bandera: string; tci: number; trend: string; region: string }[];
  mesActual: string;
}

interface Props {
  pais: DatoPais;
  tci: TCIResult;
  mlAnalysis: MLAnalysis;
  conflict: ConflictImpact;
  budget: BudgetResult;
  mesIdeal: { mejor: string; evitar: string };
  alternativas: { code: string; name: string; bandera: string; tci: number; trend: string; region: string }[];
  masCaros: { code: string; name: string; bandera: string; tci: number; trend: string; region: string }[];
  mesActual: string;
}

export default function ViajeCosteClient({
  pais, tci, mlAnalysis, conflict, budget, mesIdeal, alternativas, masCaros, mesActual
}: Props) {
  const [showFactors, setShowFactors] = useState(false);

  const tciDiff = Math.round((tci.tci - 100) * 10) / 10;
  const isAbove = tciDiff > 0;
  const isNeutral = Math.abs(tciDiff) < 5;

  const tciColor = tci.tci < 90
    ? 'text-emerald-400'
    : tci.tci < 100
    ? 'text-green-400'
    : tci.tci < 110
    ? 'text-amber-400'
    : 'text-rose-400';

  const trendIcon = isNeutral ? (
    <Minus className="w-5 h-5 text-slate-400" />
  ) : isAbove ? (
    <TrendingUp className="w-5 h-5 text-rose-400" />
  ) : (
    <TrendingDown className="w-5 h-5 text-emerald-400" />
  );

  const trendBg = isNeutral
    ? 'bg-slate-500/10 border-slate-500/20 text-slate-400'
    : isAbove
    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

  let costLabel: string;
  if (tci.tci < 85) costLabel = 'Económico';
  else if (tci.tci < 95) costLabel = 'Favorable';
  else if (tci.tci < 105) costLabel = 'Medio';
  else if (tci.tci < 115) costLabel = 'Elevado';
  else costLabel = 'Muy elevado';

  const predDirection = mlAnalysis.prediction.nextMonth > mlAnalysis.prediction.nextWeek
    ? 'up' : mlAnalysis.prediction.nextMonth < mlAnalysis.prediction.nextWeek ? 'down' : 'stable';

  const predIcon = predDirection === 'up'
    ? <TrendingUp className="w-4 h-4 text-rose-400" />
    : predDirection === 'down'
    ? <TrendingDown className="w-4 h-4 text-emerald-400" />
    : <Minus className="w-4 h-4 text-slate-400" />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/coste"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a coste de viaje</span>
        </Link>

        {/* Hero: TCI Value + Chart + ML — ABOVE THE FOLD */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{pais.bandera}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Cuánto cuesta viajar a {pais.nombre}
              </h1>
              <p className="text-slate-400">Índice de coste con predicción ML · {mesActual}</p>
            </div>
          </div>
        </header>

        {conflict.isAffected && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-rose-400 font-semibold text-sm mb-1">
                  ⚠️ Ruta afectada por conflicto aéreo
                </h3>
                <p className="text-slate-300 text-sm">
                  Sobrecoste estimado: <strong>+{conflict.surchargePct}%</strong> por desvío de espacio aéreo ({conflict.closedAirspace})
                  · +{conflict.timeExtraHours}h de vuelo
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Ruta alternativa: {conflict.alternativeRoute}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TCI Methodology Callout */}
        <div className="mb-6 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl border border-cyan-500/20 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">📊</span>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">¿Qué es el TCI?</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                El <strong className="text-cyan-400">Travel Cost Index</strong> mide el coste relativo de viajar a cada país. Base 100 = media global. 
                Se calcula con 5 factores: demanda turística (30%), petróleo Brent (25%), estacionalidad (25%), IPC (10%) y riesgo MAEC (10%).
                Las predicciones usan regresión lineal + media móvil sobre 12 semanas.
              </p>
            </div>
          </div>
        </div>

        {/* Charts + ML Prediction — FIRST VISIBLE CONTENT */}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Evolución TCI · 12 semanas</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  mlAnalysis.volatility === 'low' ? 'bg-emerald-500/10 text-emerald-400' :
                  mlAnalysis.volatility === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  Volatilidad: {mlAnalysis.volatility === 'low' ? 'baja' : mlAnalysis.volatility === 'medium' ? 'media' : 'alta'}
                </span>
              </div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mlAnalysis.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <ReferenceLine y={100} stroke="#64748b" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={{ fill: '#22d3ee', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">4 sem:</span>
                <span className={`text-sm font-medium ${
                  mlAnalysis.trend4Weeks.direction === 'up' ? 'text-rose-400' :
                  mlAnalysis.trend4Weeks.direction === 'down' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {mlAnalysis.trend4Weeks.direction === 'up' ? '↑' : mlAnalysis.trend4Weeks.direction === 'down' ? '↓' : '→'}
                  {mlAnalysis.trend4Weeks.change > 0 ? '+' : ''}{mlAnalysis.trend4Weeks.change}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">12 sem:</span>
                <span className={`text-sm font-medium ${
                  mlAnalysis.trend12Weeks.direction === 'up' ? 'text-rose-400' :
                  mlAnalysis.trend12Weeks.direction === 'down' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {mlAnalysis.trend12Weeks.direction === 'up' ? '↑' : mlAnalysis.trend12Weeks.direction === 'down' ? '↓' : '→'}
                  {mlAnalysis.trend12Weeks.change > 0 ? '+' : ''}{mlAnalysis.trend12Weeks.change}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Predicción ML</h2>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Próxima semana</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${
                      mlAnalysis.prediction.nextWeek > tci.tci ? 'text-rose-400' :
                      mlAnalysis.prediction.nextWeek < tci.tci ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {mlAnalysis.prediction.nextWeek}
                    </span>
                    {predIcon}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Próximo mes</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${
                      mlAnalysis.prediction.nextMonth > tci.tci ? 'text-rose-400' :
                      mlAnalysis.prediction.nextMonth < tci.tci ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {mlAnalysis.prediction.nextMonth}
                    </span>
                    {predIcon}
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                    Confianza: {mlAnalysis.prediction.confidence}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-900/30 to-slate-800 rounded-xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Mejor momento</h2>
              </div>
              <p className="text-2xl font-bold text-emerald-400 mb-1">
                {mlAnalysis.bestWeekToBook.month}
              </p>
              <p className="text-sm text-slate-300">
                Ahorro estimado: <strong>-{mlAnalysis.bestWeekToBook.savingsPct}%</strong> vs media anual
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Índice TCI</h2>
              </div>
              <div className="flex items-center gap-1.5">
                {trendIcon}
                <span className={`text-sm font-medium ${
                  isNeutral ? 'text-slate-400' : isAbove ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {tci.trend}
                </span>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-2">
              <span className={`text-5xl font-bold ${tciColor}`}>{tci.tci}</span>
              <span className={`text-lg font-medium ${
                isNeutral ? 'text-slate-400' : isAbove ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isAbove ? '+' : ''}{tciDiff}%
              </span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${trendBg} mb-4`}>
              <span>{costLabel} · vs media anual</span>
            </div>

            <button
              onClick={() => setShowFactors(!showFactors)}
              className="w-full flex items-center justify-between text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <span>Ver desglose de factores</span>
              {showFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFactors && (
              <div className="mt-4 space-y-3">
                {tci.factors.map((f) => {
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
                          className={`h-2 rounded-full ${barColor}`}
                          style={{ width: `${Math.min(f.value / 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-slate-500 text-xs mt-2">
                  Fórmula: demanda (30%) + petróleo (25%) + estacionalidad (25%) + IPC (10%) + riesgo (10%)
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Presupuesto diario estimado</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🎒</span>
                  <span className="text-slate-300 font-medium">Mochilero</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {budget.mochilero.min} - {budget.mochilero.max}€
                  <span className="text-sm font-normal text-slate-400"> /día</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Hostel, transporte público, comida local</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🏨</span>
                  <span className="text-slate-300 font-medium">Viajero medio</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {budget.medio.min} - {budget.medio.max}€
                  <span className="text-sm font-normal text-slate-400"> /día</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Hotel 3-4★, restaurantes, alguna actividad</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">✨</span>
                  <span className="text-slate-300 font-medium">Lujo</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {budget.lujo.min} - {budget.lujo.max}€
                  <span className="text-sm font-normal text-slate-400"> /día</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Hotel premium, restaurantes selectos, tours privados</p>
              </div>
            </div>

            {budget.notas.length > 0 && (
              <div className="mt-4 space-y-2">
                {budget.notas.map((nota, i) => (
                  <div key={i} className="text-sm text-slate-300 bg-slate-700/30 rounded-lg p-3">
                    {nota}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-slate-300 text-sm whitespace-pre-line">{tci.recommendation}</p>
          </div>
        </div>

        {alternativas.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
              Alternativas más baratas en {pais.continente}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {alternativas.map((alt) => (
                <Link
                  key={alt.code}
                  href={`/viaje-coste/${alt.code}`}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-emerald-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>{alt.bandera}</span>
                    <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                      {alt.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-lg">{alt.tci}</span>
                    <span className="text-slate-500 text-xs">TCI</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {masCaros.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
              Destinos más caros en {pais.continente}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {masCaros.map((alt) => (
                <Link
                  key={alt.code}
                  href={`/viaje-coste/${alt.code}`}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-rose-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>{alt.bandera}</span>
                    <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                      {alt.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold text-lg">{alt.tci}</span>
                    <span className="text-slate-500 text-xs">TCI</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {[
              {
                q: `¿Cuánto cuesta viajar a ${pais.nombre}?`,
                a: `El índice de coste de viaje (TCI) para ${pais.nombre} es ${tci.tci}. El presupuesto diario estimado va desde ${budget.mochilero.min}-${budget.mochilero.max}€ (mochilero) hasta ${budget.medio.min}-${budget.medio.max}€ (viajero medio).`
              },
              {
                q: `¿Cuál es el mejor mes para viajar a ${pais.nombre}?`,
                a: `El mejor momento para visitar ${pais.nombre} es ${mesIdeal.mejor}. La predicción ML indica que el TCI ${mlAnalysis.prediction.nextMonth > tci.tci ? 'subirá' : mlAnalysis.prediction.nextMonth < tci.tci ? 'bajará' : 'se mantendrá estable'} el próximo mes.`
              },
              {
                q: `¿Cuánto dinero necesito por día en ${pais.nombre}?`,
                a: `Para un viaje económico, calcula ${budget.mochilero.min}-${budget.mochilero.max}€/día. Para un viaje cómodo, ${budget.medio.min}-${budget.medio.max}€/día.`
              },
              {
                q: `¿Es ${pais.nombre} un destino caro para españoles?`,
                a: `${pais.nombre} tiene un TCI de ${tci.tci} (base 100 = media). ${tci.tci < 100 ? 'Es más barato que la media.' : tci.tci < 115 ? 'Está en línea con la media.' : 'Está por encima de la media.'}`
              },
              {
                q: `¿Qué moneda se usa en ${pais.nombre}?`,
                a: `La moneda oficial es ${pais.moneda}. ${pais.tipoCambio ? `Tipo de cambio: ${pais.tipoCambio}.` : ''}`
              },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </section>

        <div className="flex justify-center gap-4 mb-12">
          <Link
          href="/coste"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a coste de viaje</span>
        </Link>
          <Link
            href={`/pais/${pais.codigo}`}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors font-medium flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Guía completa de {pais.nombre}
          </Link>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-slate-300 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
