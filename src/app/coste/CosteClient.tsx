'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, BarChart3, ChevronDown, ChevronUp, Filter, ExternalLink, Calculator, Plane, Calendar, User, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getTodosLosPaises } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';

interface TCIResult {
  code: string;
  name: string;
  bandera: string;
  tci: number;
  trend: string;
  region: string;
}

type TravelProfile = 'mochilero' | 'medio' | 'lujo';

interface BudgetEstimate {
  perDay: number;
  total: number;
  flight: number;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
}

interface OilData {
  price: number;
  avg: number;
  changePct: number;
}

const TCI_LEVELS = [
  { key: 'Muy barato', min: 0, max: 84, color: '#22c55e', bg: 'from-green-500/20 to-green-600/10 border-green-500/30' },
  { key: 'Económico', min: 85, max: 94, color: '#86efac', bg: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
  { key: 'Medio', min: 95, max: 104, color: '#eab308', bg: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30' },
  { key: 'Caro', min: 105, max: 114, color: '#f97316', bg: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' },
  { key: 'Muy caro', min: 115, max: 999, color: '#dc2626', bg: 'from-red-500/20 to-red-600/10 border-red-500/30' },
];

function getTCIColor(tci: number): string {
  if (tci < 85) return '#22c55e';
  if (tci < 95) return '#86efac';
  if (tci < 105) return '#eab308';
  if (tci < 115) return '#f97316';
  return '#dc2626';
}

function getTCILabel(tci: number): string {
  if (tci < 85) return 'Muy barato';
  if (tci < 95) return 'Económico';
  if (tci < 105) return 'Medio';
  if (tci < 115) return 'Caro';
  return 'Muy caro';
}

function getTrendIcon(trend: string) {
  const t = trend.toLowerCase();
  if (t.includes('baj')) return <TrendingDown className="w-4 h-4 text-emerald-400" />;
  if (t.includes('alc') || t.includes('sub')) return <TrendingUp className="w-4 h-4 text-rose-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

function estimateBudget(countryCode: string, days: number, profile: TravelProfile): BudgetEstimate | null {
  const pais = getTodosLosPaises().find(p => p.codigo === countryCode);
  if (!pais) return null;

  const tci = calculateTCI(countryCode);
  const factor = tci.tci / 100;
  const region = pais.continente;

  let base: Record<TravelProfile, number>;
  switch (region) {
    case 'Europa': base = { mochilero: 35, medio: 70, lujo: 180 }; break;
    case 'América del Norte': base = { mochilero: 40, medio: 80, lujo: 200 }; break;
    case 'América del Sur': base = { mochilero: 20, medio: 45, lujo: 120 }; break;
    case 'América Central': case 'Caribe': base = { mochilero: 25, medio: 50, lujo: 130 }; break;
    case 'Asia': base = { mochilero: 15, medio: 35, lujo: 90 }; break;
    case 'África': base = { mochilero: 20, medio: 40, lujo: 100 }; break;
    case 'Oceanía': base = { mochilero: 35, medio: 70, lujo: 160 }; break;
    case 'Oriente Medio': base = { mochilero: 25, medio: 50, lujo: 130 }; break;
    default: base = { mochilero: 25, medio: 50, lujo: 120 };
  }

  const perDay = Math.round(base[profile] * factor);
  const accommodation = profile === 'mochilero' ? perDay * 0.3 : profile === 'medio' ? perDay * 0.4 : perDay * 0.5;
  const food = profile === 'mochilero' ? perDay * 0.25 : profile === 'medio' ? perDay * 0.25 : perDay * 0.2;
  const transport = profile === 'mochilero' ? perDay * 0.15 : profile === 'medio' ? perDay * 0.15 : perDay * 0.1;
  const activities = profile === 'mochilero' ? perDay * 0.1 : profile === 'medio' ? perDay * 0.1 : perDay * 0.15;
  const flight = profile === 'mochilero' ? 300 : profile === 'medio' ? 500 : 1200;

  return {
    perDay,
    total: Math.round(perDay * days + flight),
    flight,
    accommodation: Math.round(accommodation * days),
    food: Math.round(food * days),
    transport: Math.round(transport * days),
    activities: Math.round(activities * days),
  };
}

interface CosteClientProps {
  initialCountries: TCIResult[];
  initialOilData: OilData;
  regions: string[];
}

export default function CosteClient({ initialCountries, initialOilData, regions }: CosteClientProps) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);
  const [oilData] = useState<OilData>(initialOilData);
  const [tciLevelFilter, setTciLevelFilter] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [days, setDays] = useState(7);
  const [profile, setProfile] = useState<TravelProfile>('medio');
  const [showEstimator, setShowEstimator] = useState(false);
  const [budget, setBudget] = useState<BudgetEstimate | null>(null);

  const handleEstimate = () => {
    if (selectedCountry && days > 0) {
      setBudget(estimateBudget(selectedCountry, days, profile));
    }
  };

  const filtered = useMemo(() => {
    let result = [...initialCountries];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    if (regionFilter !== 'all') {
      result = result.filter(c => c.region === regionFilter);
    }
    if (tciLevelFilter) {
      const level = TCI_LEVELS.find(l => l.key === tciLevelFilter);
      if (level) result = result.filter(c => c.tci >= level.min && c.tci <= level.max);
    }
    result.sort((a, b) => sortAsc ? a.tci - b.tci : b.tci - a.tci);
    return result;
  }, [initialCountries, search, regionFilter, sortAsc, tciLevelFilter]);

  const levelDistribution = useMemo(() => {
    return TCI_LEVELS.map(l => ({
      ...l,
      count: initialCountries.filter(c => c.tci >= l.min && c.tci <= l.max).length,
    }));
  }, [initialCountries]);

  const hasActiveFilter = !!search || regionFilter !== 'all' || !!tciLevelFilter;
  const showTable = showAll || hasActiveFilter;

  const paises = getTodosLosPaises();

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">TCI · Índice de Coste de Viaje</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Estimador de Coste con ML
          </h1>
          <p className="text-slate-400">
            Calcula tu presupuesto estimado y consulta el índice TCI de cada país. Datos actualizados con demanda turística, petróleo Brent, estacionalidad, IPC y riesgo MAEC.
          </p>
        </div>

        {/* Trip Estimator Form */}
        <div className="mb-8 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Estimador de Presupuesto
            </h2>
            <button
              onClick={() => setShowEstimator(!showEstimator)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              {showEstimator ? 'Ocultar' : 'Abrir'}
            </button>
          </div>

          {showEstimator && (
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Destino</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={selectedCountry}
                    onChange={e => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">Selecciona país</option>
                    {paises.filter(p => p.visible !== false && p.codigo !== 'cu')
                      .sort((a, b) => a.nombre.localeCompare(b.nombre))
                      .map(p => (
                        <option key={p.codigo} value={p.codigo}>{p.bandera} {p.nombre}</option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Días</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={days}
                    onChange={e => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Perfil</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={profile}
                    onChange={e => setProfile(e.target.value as TravelProfile)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="mochilero">🎒 Mochilero</option>
                    <option value="medio">🧳 Viajero medio</option>
                    <option value="lujo">✨ Lujo</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleEstimate}
                  disabled={!selectedCountry}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Calcular presupuesto
                </button>
              </div>
            </div>
          )}

          {budget && selectedCountry && (
            <div className="mt-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-slate-400 text-xs">Presupuesto total estimado</div>
                  <div className="text-3xl font-bold text-white">{budget.total}€</div>
                  <div className="text-slate-500 text-xs">{budget.perDay}€/día · {days} días</div>
                </div>
                <div className="h-8 w-px bg-slate-700 hidden sm:block" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  <div>
                    <div className="text-slate-500 text-xs">✈️ Vuelo</div>
                    <div className="text-white font-medium text-sm">{budget.flight}€</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">🏨 Alojamiento</div>
                    <div className="text-white font-medium text-sm">{budget.accommodation}€</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">🍽️ Comida</div>
                    <div className="text-white font-medium text-sm">{budget.food}€</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">🚕 Transporte</div>
                    <div className="text-white font-medium text-sm">{budget.transport}€</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TCI Methodology */}
        <div className="mb-8 bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            ¿Qué es el Índice TCI?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            El <strong className="text-cyan-400">Travel Cost Index (TCI)</strong> es un índice propio desarrollado por Viaje Inteligencia que mide el coste relativo de viajar a cada país.
            Base <strong>100 = media global</strong>. Si un país tiene TCI 85, cuesta un 15% menos que la media. Si tiene TCI 120, un 20% más.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            {[
              { label: 'Demanda turística', weight: '30%', icon: '✈️', desc: 'Llegadas internacionales vs media global' },
              { label: 'Petróleo Brent', weight: '25%', icon: '🛢️', desc: 'Precio del barril vs histórico 2024-2026' },
              { label: 'Estacionalidad', weight: '25%', icon: '📅', desc: 'Patrones estacionales por país' },
              { label: 'IPC país', weight: '10%', icon: '📈', desc: 'Inflación local impacta precios' },
              { label: 'Riesgo MAEC', weight: '10%', icon: '🛡️', desc: 'Nivel riesgo del Ministerio de Exteriores' },
            ].map(f => (
              <div key={f.label} className="bg-slate-700/40 rounded-lg p-3">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-white text-sm font-medium">{f.label}</div>
                <div className="text-cyan-400 text-xs font-bold">{f.weight}</div>
                <div className="text-slate-500 text-xs mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-slate-700/30 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">Petróleo Brent:</span>
              <span className="text-white font-bold">${oilData.price}</span>
              <span className="text-amber-400">/barril</span>
            </div>
            <div className="h-3 w-px bg-slate-600" />
            <span className="text-slate-500">vs media histórica (2024-2026): <strong className="text-slate-300">${oilData.avg}</strong></span>
            <div className="h-3 w-px bg-slate-600" />
            <span className={oilData.changePct < 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {oilData.changePct < 0 ? '↓' : '↑'} {oilData.changePct > 0 ? '+' : ''}{oilData.changePct}% vs media — impacto {oilData.changePct < 0 ? 'bajista' : 'alcista'} en TCI
            </span>
          </div>
        </div>

        {/* TCI Level Distribution — Pie + Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🥧</span>
            Distribución por nivel de coste
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={levelDistribution}
                    dataKey="count"
                    nameKey="key"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    cursor="pointer"
                    onClick={(_: any, index: number) => setTciLevelFilter(prev => prev === levelDistribution[index].key ? null : levelDistribution[index].key)}
                  >
                    {levelDistribution.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={entry.color}
                        stroke={tciLevelFilter === entry.key ? '#fff' : 'transparent'}
                        strokeWidth={tciLevelFilter === entry.key ? 3 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Level Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {levelDistribution.map(l => (
                <button
                  key={l.key}
                  onClick={() => setTciLevelFilter(prev => prev === l.key ? null : prev)}
                  className={`bg-gradient-to-br ${l.bg} rounded-xl border p-4 text-left hover:scale-[1.02] transition-all duration-200 ${
                    tciLevelFilter === l.key ? 'ring-2 ring-white shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-lg">{l.key}</span>
                    <span className="text-3xl font-bold" style={{ color: l.color }}>{l.count}</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(l.count / initialCountries.length) * 100}%`, backgroundColor: l.color }}
                    />
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    {Math.round((l.count / initialCountries.length) * 100)}% de países
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filters — hidden until expanded */}
        {showTable && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar país..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-8 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-blue-500/50"
              >
                {regions.map(r => (
                  <option key={r} value={r}>{r === 'all' ? 'Todas las regiones' : r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm hover:bg-slate-700 transition-colors"
            >
              {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {sortAsc ? 'Más baratos' : 'Más caros'}
            </button>
          </div>
        )}

        {/* Table — collapsed by default */}
        {showTable ? (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">País</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Región</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">TCI</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Nivel</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Tendencia</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={c.code}
                      className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/coste/${c.code}`} className="flex items-center gap-2 group">
                          <span className="text-lg">{c.bandera}</span>
                          <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{c.name}</span>
                          <span className="text-slate-500 text-xs hidden sm:inline">({c.code})</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{c.region}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-lg" style={{ color: getTCIColor(c.tci) }}>{c.tci}</span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: getTCIColor(c.tci) + '20', color: getTCIColor(c.tci) }}
                        >
                          {getTCILabel(c.tci)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(c.trend)}
                          <span className="text-slate-300 text-xs">{c.trend}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/coste/${c.code}`}
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                        >
                          Ver análisis
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
              Mostrar todos ({initialCountries.length} países)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
