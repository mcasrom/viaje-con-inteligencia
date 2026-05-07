'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Shield, TrendingUp, Users, DollarSign, Award, AlertTriangle, Plane, Globe, MapPin, ChevronUp, ChevronDown, Activity, Loader2, Heart, Syringe, Stethoscope, BedDouble, Zap, Radio, Crown } from 'lucide-react';
import { useRequirePremium } from '@/hooks/useRequirePremium';

interface WHOHealthData {
  timestamp: string;
  source: string;
  totalCountries: number;
  summary: { highRisk: number; mediumRisk: number; lowRisk: number };
  countries: {
    code: string;
    code2: string;
    country: string;
    tuberculosis: number | null;
    hiv: number | null;
    vaccinationDTP3: number | null;
    healthExpenditure: number | null;
    doctors: number | null;
    beds: number | null;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  topRiskCountries: { code: string; code2: string; country: string; tuberculosis: number | null; hiv: number | null; vaccinationDTP3: number | null; riskLevel: string }[];
  safestCountries: { code: string; code2: string; country: string; tuberculosis: number | null; hiv: number | null; vaccinationDTP3: number | null; riskLevel: string }[];
}

function formatM(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString();
}

interface KPIProps {
  gpiTop5: { code: string; country: string; score: number; rank: number; bandera: string }[];
  gpiWorst5: { code: string; country: string; score: number; rank: number; bandera: string }[];
  hdiTop5: { code: string; country: string; score: number; rank: number; bandera: string }[];
  gtiWorst5: { code: string; country: string; score: number; rank: number; bandera: string }[];
  riskDistribution: Record<string, { count: number; countries: string[] }>;
  ipcExtremos: { code: string; country: string; ipc: string; nivel: string; bandera: string }[];
  topTourism: { code: string; country: string; bandera: string; arrivals: number; receipts?: number; avgStay?: number; spendPerDay?: number }[];
  tciBaratos: { code: string; name: string; bandera: string; tci: number; region: string }[];
  tciCaros: { code: string; name: string; bandera: string; tci: number; region: string }[];
  oilPrice: number;
  totalCountries: number;
  totalSafe: number;
  avgHDI: number;
  avgGPI: number;
  continentDistribution: { continent: string; count: number }[];
  ipcDistribution: { nivel: string; count: number }[];
  gpiByRegion: { region: string; avgScore: number; count: number }[];
}

const TABS = [
  { id: 'paz', label: 'Paz y Seguridad', icon: <Shield className="w-4 h-4" /> },
  { id: 'turismo', label: 'Turismo', icon: <Plane className="w-4 h-4" /> },
  { id: 'economia', label: 'Economía', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'tci', label: 'Índice TCI', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'salud', label: 'Salud OMS', icon: <Heart className="w-4 h-4" /> },
  { id: 'sismos', label: 'Sismos', icon: <Zap className="w-4 h-4" /> },
  { id: 'conflictos', label: 'Conflictos', icon: <Radio className="w-4 h-4" /> },
];

export default function KPIDashboard({
  gpiTop5, gpiWorst5, hdiTop5, gtiWorst5, riskDistribution, ipcExtremos,
  topTourism, tciBaratos, tciCaros, oilPrice, totalCountries, totalSafe,
  avgHDI, avgGPI, continentDistribution, ipcDistribution, gpiByRegion,
}: KPIProps) {
  const { isPremium, loading: premiumLoading } = useRequirePremium();
  const [activeTab, setActiveTab] = useState('paz');
  const [healthData, setHealthData] = useState<WHOHealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [sismosData, setSismosData] = useState<any[]>([]);
  const [sismosLoading, setSismosLoading] = useState(false);
  const [conflictosData, setConflictosData] = useState<any[]>([]);
  const [conflictosLoading, setConflictosLoading] = useState(false);

  useEffect(() => {
    if (!isPremium) return;
    if (activeTab === 'salud' && !healthData && !healthLoading) {
      setHealthLoading(true);
      fetch('/api/kpis/health')
        .then(r => {
          if (!r.ok) throw new Error('API error');
          return r.json();
        })
        .then(data => {
          if (data.error) throw new Error(data.error);
          setHealthData(data);
          setHealthLoading(false);
        })
        .catch(() => setHealthLoading(false));
    }
    if (activeTab === 'sismos' && sismosData.length === 0 && !sismosLoading) {
      setSismosLoading(true);
      fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson')
        .then(r => r.json())
        .then(data => {
          const quakes = data.features?.map((f: any) => ({
            mag: f.properties.mag,
            place: f.properties.place,
            time: new Date(f.properties.time).toLocaleString('es-ES'),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            depth: f.geometry.coordinates[2],
            url: f.properties.url,
          })).sort((a: any, b: any) => b.mag - a.mag).slice(0, 30) || [];
          setSismosData(quakes);
          setSismosLoading(false);
        })
        .catch(() => setSismosLoading(false));
    }
    if (activeTab === 'conflictos' && conflictosData.length === 0 && !conflictosLoading) {
      setConflictosLoading(true);
      fetch('/api/kpis/health')
        .then(r => r.json())
        .then(() => {
          const conflictos = [
            { pais: 'Ucrania', region: 'Europa del Este', tipo: 'Conflicto armado', gravedad: 'Crítico', desde: '2022' },
            { pais: 'Gaza / Palestina', region: 'Medio Oriente', tipo: 'Conflicto armado', gravedad: 'Crítico', desde: '2023' },
            { pais: 'Sudán', region: 'África', tipo: 'Guerra civil', gravedad: 'Crítico', desde: '2023' },
            { pais: 'Siria', region: 'Medio Oriente', tipo: 'Guerra civil', gravedad: 'Alto', desde: '2011' },
            { pais: 'Yemen', region: 'Medio Oriente', tipo: 'Guerra civil', gravedad: 'Alto', desde: '2014' },
            { pais: 'Myanmar', region: 'Asia', tipo: 'Golpe de estado', gravedad: 'Alto', desde: '2021' },
            { pais: 'Libia', region: 'África', tipo: 'Inestabilidad', gravedad: 'Alto', desde: '2011' },
            { pais: 'Somalia', region: 'África', tipo: 'Conflicto interno', gravedad: 'Alto', desde: '2009' },
            { pais: 'Afganistán', region: 'Asia', tipo: 'Talibán', gravedad: 'Alto', desde: '2021' },
            { pais: 'RDC (Congo)', region: 'África', tipo: 'Conflicto armado', gravedad: 'Alto', desde: '1996' },
            { pais: 'Sahel (Malí, Burkina, Níger)', region: 'África', tipo: 'Terrorismo y golpes', gravedad: 'Alto', desde: '2020' },
            { pais: 'Venezuela', region: 'América', tipo: 'Crisis política', gravedad: 'Medio', desde: '2019' },
            { pais: 'Haití', region: 'América', tipo: 'Crisis institucional', gravedad: 'Alto', desde: '2021' },
            { pais: 'Etiopía', region: 'África', tipo: 'Tigray / Oromía', gravedad: 'Medio', desde: '2020' },
            { pais: 'República Centroafricana', region: 'África', tipo: 'Inestabilidad', gravedad: 'Medio', desde: '2012' },
          ];
          setConflictosData(conflictos);
          setConflictosLoading(false);
        })
        .catch(() => setConflictosLoading(false));
    }
  }, [activeTab, healthData, isPremium, sismosLoading, conflictosLoading]);

  if (premiumLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Premium</h2>
          <p className="text-slate-400 mb-6">El Dashboard de KPIs es exclusivo para usuarios Premium. Activa tu prueba gratuita de 7 días.</p>
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            Empezar prueba gratuita
          </Link>
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Dashboard KPIs</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Indicadores Globales</h1>
        <p className="text-slate-400 mb-8">Datos consolidados de GPI, GTI, HDI, IPC, TCI y turismo mundial.</p>

        {/* Hero KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-xs font-medium">Países analizados</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalCountries}</div>
            <div className="text-slate-500 text-xs mt-1">{totalSafe} sin riesgo</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 text-xs font-medium">HDI medio</span>
            </div>
            <div className="text-3xl font-bold text-white">{avgHDI}</div>
            <div className="text-slate-500 text-xs mt-1">Desarrollo humano</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-xs font-medium">GPI medio</span>
            </div>
            <div className="text-3xl font-bold text-white">{avgGPI}</div>
            <div className="text-slate-500 text-xs mt-1">Índice de paz</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 text-xs font-medium">Petróleo Brent</span>
            </div>
            <div className="text-3xl font-bold text-white">${oilPrice}</div>
            <div className="text-slate-500 text-xs mt-1">USD/barril</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Paz y Seguridad */}
        {activeTab === 'paz' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top 5 más pacíficos */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Top 5 más pacíficos (GPI)
              </h3>
              <div className="space-y-2">
                {gpiTop5.map((c, i) => (
                  <div key={c.code} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                    <span className="text-lg">{c.bandera}</span>
                    <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                    <span className="text-emerald-400 font-bold text-sm">{c.score}</span>
                    <span className="text-slate-500 text-xs">#{c.rank}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 menos pacíficos */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Top 5 menos pacíficos (GPI)
              </h3>
              <div className="space-y-2">
                {gpiWorst5.map((c, i) => (
                  <div key={c.code} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                    <span className="text-lg">{c.bandera}</span>
                    <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                    <span className="text-rose-400 font-bold text-sm">{c.score}</span>
                    <span className="text-slate-500 text-xs">#{c.rank}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GTI Terrorismo */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Mayor impacto terrorismo (GTI)
              </h3>
              <div className="space-y-2">
                {gtiWorst5.map((c, i) => (
                  <div key={c.code} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                    <span className="text-lg">{c.bandera}</span>
                    <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                    <span className="text-orange-400 font-bold text-sm">{c.score}</span>
                    <span className="text-slate-500 text-xs">#{c.rank}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribución riesgo MAEC */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Distribución riesgo MAEC
              </h3>
              <div className="space-y-3">
                {Object.entries(riskDistribution).map(([level, data]) => {
                  const colors: Record<string, string> = {
                    'sin-riesgo': 'bg-emerald-500',
                    'bajo': 'bg-green-500',
                    'medio': 'bg-amber-500',
                    'alto': 'bg-orange-500',
                    'muy-alto': 'bg-red-500',
                  };
                  const labels: Record<string, string> = {
                    'sin-riesgo': 'Sin riesgo',
                    'bajo': 'Bajo',
                    'medio': 'Medio',
                    'alto': 'Alto',
                    'muy-alto': 'Muy alto',
                  };
                  return (
                    <div key={level}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{labels[level]}</span>
                        <span className="text-white font-bold">{data.count}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[level]} rounded-full`} style={{ width: `${(data.count / totalCountries) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GPI por región */}
            <div className="md:col-span-2 bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                GPI medio por región
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gpiByRegion.map(r => (
                  <div key={r.region} className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-slate-400 text-xs mb-1">{r.region}</div>
                    <div className="text-2xl font-bold text-white">{r.avgScore}</div>
                    <div className="text-slate-500 text-xs">{r.count} países</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Turismo */}
        {activeTab === 'turismo' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-5 border-b border-slate-700/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plane className="w-5 h-5 text-cyan-400" />
                  Top destinos por llegadas turísticas
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/30">
                      <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase">#</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase">País</th>
                      <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden sm:table-cell">Llegadas</th>
                      <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden md:table-cell">Ingresos</th>
                      <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden lg:table-cell">Gasto/día</th>
                      <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden lg:table-cell">Estancia media</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTourism.map((t, i) => (
                      <tr key={t.code} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className="text-lg mr-2">{t.bandera}</span>
                          <span className="text-white font-medium">{t.country}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-white font-medium hidden sm:table-cell">{formatM(t.arrivals)}</td>
                        <td className="px-4 py-3 text-right text-slate-300 hidden md:table-cell">{t.receipts ? formatM(t.receipts) : '—'}</td>
                        <td className="px-4 py-3 text-right text-slate-300 hidden lg:table-cell">${t.spendPerDay}</td>
                        <td className="px-4 py-3 text-right text-slate-300 hidden lg:table-cell">{t.avgStay} noches</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Distribución por continente */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Países por continente
                </h3>
                <div className="space-y-3">
                  {continentDistribution.map(c => (
                    <div key={c.continent} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">{c.continent}</span>
                      <span className="text-white font-bold">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Economía */}
        {activeTab === 'economia' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* HDI Top */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Top 5 desarrollo humano (HDI)
              </h3>
              <div className="space-y-2">
                {hdiTop5.map((c, i) => (
                  <div key={c.code} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                    <span className="text-lg">{c.bandera}</span>
                    <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                    <span className="text-emerald-400 font-bold text-sm">{c.score}</span>
                    <span className="text-slate-500 text-xs">#{c.rank}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* IPC extremos */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-400" />
                IPC más altos
              </h3>
              <div className="space-y-2">
                {ipcExtremos.map((c, i) => (
                  <div key={c.code} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                    <span className="text-lg">{c.bandera}</span>
                    <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                    <span className="text-rose-400 font-bold text-sm">{c.ipc}</span>
                    <span className="text-slate-500 text-xs">{c.nivel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* IPC Distribution */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                Distribución IPC
              </h3>
              <div className="space-y-3">
                {ipcDistribution.map(d => {
                  const colors: Record<string, string> = {
                    'Muy Bajo': 'bg-emerald-500',
                    'Bajo': 'bg-green-500',
                    'Medio': 'bg-amber-500',
                    'Alto': 'bg-orange-500',
                    'Muy Alto': 'bg-red-500',
                    'Extremo': 'bg-rose-600',
                  };
                  return (
                    <div key={d.nivel}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{d.nivel}</span>
                        <span className="text-white font-bold">{d.count}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[d.nivel] || 'bg-slate-500'} rounded-full`} style={{ width: `${(d.count / 49) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: TCI */}
        {activeTab === 'tci' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ChevronDown className="w-5 h-5 text-emerald-400" />
                5 destinos más baratos (TCI)
              </h3>
              <div className="space-y-2">
                {tciBaratos.map((c, i) => (
                  <Link key={c.code} href={`/coste/${c.code}`} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <span className="text-lg">{c.bandera}</span>
                    <span className="text-white text-sm font-medium flex-1">{c.name}</span>
                    <span className="text-emerald-400 font-bold text-sm">{c.tci}</span>
                    <span className="text-slate-500 text-xs">{c.region}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ChevronUp className="w-5 h-5 text-rose-400" />
                5 destinos más caros (TCI)
              </h3>
              <div className="space-y-2">
                {tciCaros.map((c, i) => (
                  <Link key={c.code} href={`/coste/${c.code}`} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <span className="text-lg">{c.bandera}</span>
                    <span className="text-white text-sm font-medium flex-1">{c.name}</span>
                    <span className="text-rose-400 font-bold text-sm">{c.tci}</span>
                    <span className="text-slate-500 text-xs">{c.region}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Tab: Salud OMS */}
        {activeTab === 'salud' && (
          healthLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <span>Cargando datos de la OMS...</span>
              <span className="text-xs mt-2">Fuente: WHO Global Health Observatory</span>
            </div>
          ) : healthData ? (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-400 text-xs">Países con datos</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{healthData.totalCountries}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-400 text-xs">Riesgo bajo</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{healthData.summary.lowRisk}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400 text-xs">Riesgo medio</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-400">{healthData.summary.mediumRisk}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-slate-400 text-xs">Riesgo alto</span>
                  </div>
                  <div className="text-2xl font-bold text-rose-400">{healthData.summary.highRisk}</div>
                </div>
              </div>

              {/* Risk distribution bar */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Distribución de riesgo sanitario
                </h3>
                <div className="flex h-4 rounded-full overflow-hidden">
                  {healthData.summary.lowRisk > 0 && (
                    <div className="bg-emerald-500 transition-all" style={{ width: `${(healthData.summary.lowRisk / healthData.totalCountries) * 100}%` }} title={`Bajo: ${healthData.summary.lowRisk}`} />
                  )}
                  {healthData.summary.mediumRisk > 0 && (
                    <div className="bg-amber-500 transition-all" style={{ width: `${(healthData.summary.mediumRisk / healthData.totalCountries) * 100}%` }} title={`Medio: ${healthData.summary.mediumRisk}`} />
                  )}
                  {healthData.summary.highRisk > 0 && (
                    <div className="bg-rose-500 transition-all" style={{ width: `${(healthData.summary.highRisk / healthData.totalCountries) * 100}%` }} title={`Alto: ${healthData.summary.highRisk}`} />
                  )}
                </div>
                <div className="flex gap-6 mt-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bajo ({healthData.summary.lowRisk})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medio ({healthData.summary.mediumRisk})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Alto ({healthData.summary.highRisk})</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Safest countries */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Países más seguros (OMS)
                  </h3>
                  <div className="space-y-2">
                    {healthData.safestCountries.map((c, i) => (
                      <div key={c.code2} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                        <span className="text-sm text-slate-500 font-mono w-6">{i + 1}</span>
                        <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                        <span className="text-emerald-400 text-xs font-medium">Bajo</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highest risk countries */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    Mayor riesgo sanitario
                  </h3>
                  <div className="space-y-2">
                    {healthData.topRiskCountries.map((c, i) => (
                      <div key={c.code2} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                        <span className="text-sm text-slate-500 font-mono w-6">{i + 1}</span>
                        <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                        <span className="text-rose-400 text-xs font-medium">Alto</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top vaccination coverage */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Syringe className="w-5 h-5 text-blue-400" />
                    Mejor vacunación DTP3
                  </h3>
                  <div className="space-y-2">
                    {healthData.countries
                      .filter(c => c.vaccinationDTP3 !== null)
                      .sort((a, b) => (b.vaccinationDTP3 || 0) - (a.vaccinationDTP3 || 0))
                      .slice(0, 8)
                      .map(c => (
                        <div key={c.code2} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                          <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${c.vaccinationDTP3}%` }} />
                            </div>
                            <span className="text-blue-400 text-xs font-bold w-10 text-right">{c.vaccinationDTP3}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Doctors per capita */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-green-400" />
                    Más médicos per cápita
                  </h3>
                  <div className="space-y-2">
                    {healthData.countries
                      .filter(c => c.doctors !== null)
                      .sort((a, b) => (b.doctors || 0) - (a.doctors || 0))
                      .slice(0, 8)
                      .map(c => (
                        <div key={c.code2} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                          <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                          <span className="text-green-400 text-xs font-bold">{c.doctors?.toFixed(1)}</span>
                          <span className="text-slate-500 text-xs">/1000</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Beds per capita */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-orange-400" />
                    Más camas hospitalarias
                  </h3>
                  <div className="space-y-2">
                    {healthData.countries
                      .filter(c => c.beds !== null)
                      .sort((a, b) => (b.beds || 0) - (a.beds || 0))
                      .slice(0, 8)
                      .map(c => (
                        <div key={c.code2} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                          <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                          <span className="text-orange-400 text-xs font-bold">{c.beds?.toFixed(1)}</span>
                          <span className="text-slate-500 text-xs">/1000</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Lowest health expenditure */}
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    Menor gasto sanitario per cápita
                  </h3>
                  <div className="space-y-2">
                    {healthData.countries
                      .filter(c => c.healthExpenditure !== null)
                      .sort((a, b) => (a.healthExpenditure || 0) - (b.healthExpenditure || 0))
                      .slice(0, 8)
                      .map(c => (
                        <div key={c.code2} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                          <span className="text-white text-sm font-medium flex-1">{c.country}</span>
                          <span className="text-amber-400 text-xs font-bold">${c.healthExpenditure?.toFixed(0)}</span>
                          <span className="text-slate-500 text-xs">USD/año</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500">
                Fuente: {healthData.source} · {new Date(healthData.timestamp).toLocaleDateString('es-ES')}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No se pudieron cargar los datos de la OMS.</p>
              <button onClick={() => { setHealthData(null); setHealthLoading(true); fetch('/api/kpis/health').then(r => r.json()).then(setHealthData).finally(() => setHealthLoading(false)); }} className="mt-3 text-blue-400 text-sm hover:underline">
                Reintentar
              </button>
            </div>
          )
        )}

        {/* Tab: Sismos */}
        {activeTab === 'sismos' && (
          sismosLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <span>Cargando datos sísmicos...</span>
              <span className="text-xs mt-2">Fuente: USGS Earthquake Hazards Program</span>
            </div>
          ) : sismosData.length > 0 ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400 text-xs">Sismos hoy (M{'>'}4.5)</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{sismosData.length}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span className="text-slate-400 text-xs">Magnitud 7+</span>
                  </div>
                  <div className="text-2xl font-bold text-red-400">{sismosData.filter(s => s.mag >= 7).length}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-400 text-xs">Magnitud 6-7</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">{sismosData.filter(s => s.mag >= 6 && s.mag < 7).length}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-400 text-xs">Mayor magnitud</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">M{sismosData[0]?.mag.toFixed(1)}</div>
                </div>
              </div>

              {/* Seismic feed */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-5 border-b border-slate-700/50">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Últimos sismos (últimas 24h, M≥4.5)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/30">
                        <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase">Magnitud</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase">Ubicación</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden md:table-cell">Profundidad</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden lg:table-cell">Fecha/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sismosData.map((s, i) => (
                        <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              s.mag >= 7 ? 'bg-red-500/20 text-red-400' :
                              s.mag >= 6 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              M{s.mag.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white font-medium text-sm">{s.place}</td>
                          <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{s.depth.toFixed(0)} km</td>
                          <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{s.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500">
                Fuente: USGS Earthquake Hazards Program · Actualización en tiempo real
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No se pudieron cargar los datos sísmicos.</p>
              <button onClick={() => { setSismosData([]); setSismosLoading(true); }} className="mt-3 text-blue-400 text-sm hover:underline">
                Reintentar
              </button>
            </div>
          )
        )}

        {/* Tab: Conflictos */}
        {activeTab === 'conflictos' && (
          conflictosLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <span>Cargando datos de conflictos...</span>
              <span className="text-xs mt-2">Fuentes: ACLED, MAEC, IEP</span>
            </div>
          ) : conflictosData.length > 0 ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-red-400" />
                    <span className="text-slate-400 text-xs">Conflictos activos</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{conflictosData.length}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-rose-400" />
                    <span className="text-slate-400 text-xs">Nivel Crítico</span>
                  </div>
                  <div className="text-2xl font-bold text-rose-400">{conflictosData.filter(c => c.gravedad === 'Crítico').length}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-400 text-xs">Nivel Alto</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">{conflictosData.filter(c => c.gravedad === 'Alto').length}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400 text-xs">Nivel Medio</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-400">{conflictosData.filter(c => c.gravedad === 'Medio').length}</div>
                </div>
              </div>

              {/* Conflict feed */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-5 border-b border-slate-700/50">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-400" />
                    Monitor de conflictos activos
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/30">
                        <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase">País / Región</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden md:table-cell">Tipo</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase">Gravedad</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden lg:table-cell">Desde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conflictosData.map((c, i) => (
                        <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                          <td className="px-4 py-3 text-white font-medium text-sm">{c.pais}</td>
                          <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{c.tipo}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              c.gravedad === 'Crítico' ? 'bg-red-500/20 text-red-400' :
                              c.gravedad === 'Alto' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {c.gravedad}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{c.desde}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500">
                Fuentes: ACLED, MAEC, IEP · Actualizado Mayo 2026
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Radio className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No se pudieron cargar los datos de conflictos.</p>
              <button onClick={() => { setConflictosData([]); setConflictosLoading(true); }} className="mt-3 text-blue-400 text-sm hover:underline">
                Reintentar
              </button>
            </div>
          )
        )}
      </main>
    </div>
  );
}
