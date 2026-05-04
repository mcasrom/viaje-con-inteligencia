'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plane, RefreshCw, AlertTriangle, TrendingUp, MapPin, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface RouteData {
  origin_iata: string;
  destination_iata: string;
  destination_country: string;
  closed_airspace: string;
  detour_km: number;
  fuel_surcharge_pct: number;
  time_extra_hours: number;
  alternative_route: string;
  is_active: boolean;
}

interface ClosureData {
  country_code: string;
  country_name: string;
  closure_date: string;
  reason: string;
  severity: string;
  is_active: boolean;
}

interface ImpactCountry {
  country: string;
  routes: number;
  avgSurcharge: number;
  totalTimeExtra: number;
}

export default function AdminAirspaceImpact() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [closures, setClosures] = useState<ClosureData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [impactByCountry, setImpactByCountry] = useState<ImpactCountry[]>([]);
  const [conflictTCITrend, setConflictTCITrend] = useState<any[]>([]);
  const [activeClosures, setActiveClosures] = useState(0);
  const [maxSurcharge, setMaxSurcharge] = useState(0);
  const [avgSurcharge, setAvgSurcharge] = useState(0);

  useEffect(() => {
    fetch('/api/admin/airspace-impact')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setClosures(data.closures || []);
          setRoutes(data.routes || []);
          setImpactByCountry(data.impactByCountry || []);
          setConflictTCITrend(data.conflictTCITrend || []);
          setActiveClosures(data.activeClosures || 0);
          setMaxSurcharge(data.maxSurcharge || 0);
          setAvgSurcharge(data.avgSurcharge || 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" /></div>;
  }

  const routeImpactData = routes
    .filter((r: RouteData) => r.is_active)
    .map((r: RouteData) => ({
      route: `${r.origin_iata}→${r.destination_iata}`,
      sobrecoste: r.fuel_surcharge_pct,
      horasExtra: r.time_extra_hours,
      desvio: r.detour_km,
      country: r.destination_country,
      espacio: r.closed_airspace,
    }));

  const closureSeverityData = closures
    .filter((c: ClosureData) => c.is_active)
    .reduce((acc: Record<string, number>, c: ClosureData) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const severityPieData = Object.entries(closureSeverityData).map(([name, value]) => ({ name, value }));
  const severityColors: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

  const tciTrendData = conflictTCITrend
    .slice(-12)
    .map((t: any) => ({
      date: new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      TCI: t.tci_value,
      Conflicto: t.conflict_surcharge,
    }));

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al dashboard</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Plane className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Impacto Espacio Aéreo</h1>
        </div>
        <p className="text-slate-400 mb-8">Datos OSINT automáticos - cierres y desviaciones detectados por scraping</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Cierres activos
            </div>
            <div className="text-3xl font-bold text-rose-400">{activeClosures}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <MapPin className="w-4 h-4 text-amber-400" />
              Rutas afectadas
            </div>
            <div className="text-3xl font-bold text-amber-400">{routes.filter(r => r.is_active).length}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Sobrecoste máx
            </div>
            <div className="text-3xl font-bold text-cyan-400">+{maxSurcharge}%</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Globe className="w-4 h-4 text-emerald-400" />
              Sobrecoste medio
            </div>
            <div className="text-3xl font-bold text-emerald-400">+{avgSurcharge}%</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Sobrecoste por ruta (desde MAD)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={routeImpactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="route" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" label={{ value: '% sobrecoste', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="sobrecoste" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Horas extra por ruta</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={routeImpactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="route" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" label={{ value: 'horas', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="horasExtra" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Severidad de cierres</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColors[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Impacto en países</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={impactByCountry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="country" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="avgSurcharge" name="Sobrecoste %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="routes" name="Rutas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Evolución TCI vs sobrecoste conflicto</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tciTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="TCI" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Conflicto" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Cierres activos
            </h2>
            <div className="space-y-2">
              {closures
                .filter(c => c.is_active)
                .sort((a, b) => {
                  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                  return (order[a.severity] || 99) - (order[b.severity] || 99);
                })
                .map((c) => (
                  <div key={c.country_code} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        c.severity === 'critical' ? 'bg-rose-400' :
                        c.severity === 'high' ? 'bg-orange-400' :
                        c.severity === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                      }`} />
                      <div>
                        <span className="text-white font-medium">{c.country_name}</span>
                        <span className="text-slate-500 text-sm ml-2">({c.country_code})</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                      c.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      c.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {c.severity}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-cyan-400" />
              Rutas alternativas
            </h2>
            <div className="space-y-2">
              {routes
                .filter(r => r.is_active)
                .map((r) => (
                  <div key={`${r.origin_iata}-${r.destination_iata}`} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">MAD → {r.destination_iata}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-rose-400 text-sm font-medium">+{r.fuel_surcharge_pct}%</span>
                        <span className="text-slate-400 text-sm">+{r.time_extra_hours}h</span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      Cierre: {r.closed_airspace} → {r.alternative_route}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
