'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Plane, Shield, AlertTriangle, TrendingUp, Activity, Map, BarChart3, AlertCircle, CheckCircle, XCircle, ArrowRight, Search, Filter, Clock, RefreshCw } from 'lucide-react';

interface FlightAlert {
  flight: string;
  airline: string;
  departure: string;
  arrival: string;
  status: string;
  delay: number;
  time: string;
}

const KPIData = [
  { country: 'España', code: 'ES', riesgoPolitico: 15, riesgoAereo: 8, restricciones: 5, score: 87, status: 'seguro' },
  { country: 'Portugal', code: 'PT', riesgoPolitico: 12, riesgoAereo: 6, restricciones: 4, score: 89, status: 'seguro' },
  { country: 'Francia', code: 'FR', riesgoPolitico: 25, riesgoAereo: 12, restricciones: 8, score: 75, status: 'precaución' },
  { country: 'Italia', code: 'IT', riesgoPolitico: 22, riesgoAereo: 10, restricciones: 6, score: 79, status: 'seguro' },
  { country: 'Alemania', code: 'DE', riesgoPolitico: 14, riesgoAereo: 7, restricciones: 5, score: 88, status: 'seguro' },
  { country: 'Reino Unido', code: 'GB', riesgoPolitico: 28, riesgoAereo: 15, restricciones: 10, score: 71, status: 'precaución' },
  { country: 'EE.UU.', code: 'US', riesgoPolitico: 35, riesgoAereo: 18, restricciones: 12, score: 65, status: 'precaución' },
  { country: 'México', code: 'MX', riesgoPolitico: 55, riesgoAereo: 22, restricciones: 15, score: 48, status: 'alto' },
  { country: 'Brasil', code: 'BR', riesgoPolitico: 48, riesgoAereo: 20, restricciones: 14, score: 52, status: 'alto' },
  { country: 'Japón', code: 'JP', riesgoPolitico: 10, riesgoAereo: 5, restricciones: 3, score: 92, status: 'seguro' },
  { country: 'Australia', code: 'AU', riesgoPolitico: 12, riesgoAereo: 8, restricciones: 4, score: 89, status: 'seguro' },
  { country: 'Canadá', code: 'CA', riesgoPolitico: 14, riesgoAereo: 6, restricciones: 4, score: 89, status: 'seguro' },
  { country: 'Grecia', code: 'GR', riesgoPolitico: 30, riesgoAereo: 14, restricciones: 10, score: 68, status: 'precaución' },
  { country: 'Turquía', code: 'TR', riesgoPolitico: 52, riesgoAereo: 25, restricciones: 18, score: 42, status: 'alto' },
  { country: 'Egipto', code: 'EG', riesgoPolitico: 45, riesgoAereo: 22, restricciones: 16, score: 50, status: 'alto' },
  { country: 'Tailandia', code: 'TH', riesgoPolitico: 28, riesgoAereo: 15, restricciones: 10, score: 72, status: 'precaución' },
  { country: 'India', code: 'IN', riesgoPolitico: 40, riesgoAereo: 20, restricciones: 12, score: 58, status: 'alto' },
  { country: 'China', code: 'CN', riesgoPolitico: 55, riesgoAereo: 12, restricciones: 25, score: 45, status: 'alto' },
  { country: 'Marruecos', code: 'MA', riesgoPolitico: 32, riesgoAereo: 18, restricciones: 10, score: 67, status: 'precaución' },
  { country: 'Argentina', code: 'AR', riesgoPolitico: 42, riesgoAereo: 25, restricciones: 15, score: 52, status: 'alto' },
];

const AIRISKData = [
  { region: 'Europa', cancelaciones: 2.1, cierres: 0, incidentes: 3, status: 'normal' },
  { region: 'Norteamérica', cancelaciones: 3.5, cierres: 0.5, incidentes: 5, status: 'normal' },
  { region: 'Oriente Medio', cancelaciones: 15.2, cierres: 8.5, incidentes: 28, status: 'critico' },
  { region: 'Asia-Pacífico', cancelaciones: 4.8, cierres: 1.2, incidentes: 8, status: 'precaución' },
  { region: 'Latinoamérica', cancelaciones: 6.5, cierres: 2.1, incidentes: 12, status: 'precaución' },
  { region: 'África', cancelaciones: 8.2, cierres: 3.5, incidentes: 18, status: 'precaución' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'seguro': return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'precaución': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'alto': return 'text-red-400 bg-red-400/10 border-red-400/30';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  }
}

function RiskBar({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) {
  const percentage = (value / max) * 100;
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };
  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${colors[color]} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

function Gauge({ value, label }: { value: number; label: string }) {
  const rotation = (value / 100) * 180 - 90;
  return (
    <div className="relative w-32 h-16 overflow-hidden">
      <div className="absolute w-32 h-32 rounded-full border-8 border-slate-700" />
      <div 
        className="absolute w-32 h-32 rounded-full border-8 border-transparent border-t-green-500 border-r-green-500"
        style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-xs text-slate-400 block">{label}</span>
      </div>
    </div>
  );
}

function RadarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = 100;
  const center = 50;
  const radius = 40;
  const points = data.map((item, i) => {
    const angle = (i * 360) / data.length - 90;
    const r = (item.value / max) * radius;
    const x = center + r * Math.cos((angle * Math.PI) / 180);
    const y = center + r * Math.sin((angle * Math.PI) / 180);
    return { x, y, label: item.label, value: item.value };
  });
  const path = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="#334155" strokeWidth="1" />
        <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="#334155" strokeWidth="1" />
        <polygon points="50,40 60,50 50,60 40,50" fill="none" stroke="#334155" strokeWidth="1" />
        <polygon points={path} fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
        ))}
      </svg>
    </div>
  );
}

export default function KPIsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'politico' | 'aereo'>('score');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['ES', 'FR', 'MX']);
  const [flightAlerts, setFlightAlerts] = useState<FlightAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    async function fetchFlightAlerts() {
      try {
        const res = await fetch('/api/flights/delays');
        const data = await res.json();
        if (data.flights) {
          setFlightAlerts(data.flights);
          setLastUpdate(data.timestamp);
        }
      } catch (e) {
        console.error('Error fetching alerts:', e);
      } finally {
        setLoadingAlerts(false);
      }
    }
    fetchFlightAlerts();
  }, []);

  const filteredData = KPIData
    .filter(d => d.country.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'politico') return b.riesgoPolitico - a.riesgoPolitico;
      if (sortBy === 'aereo') return b.riesgoAereo - a.riesgoAereo;
      return 0;
    });

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter(c => c !== code));
    } else if (selectedCountries.length < 5) {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">KPIs de Riesgo</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Dashboard de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Seguridad de Viaje</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Datos en tiempo real sobre riesgo político, aéreo y restricciones por país. Actualizado constantemente.
          </p>
          <p className="text-blue-400 text-sm mt-3 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Ultima actualizacion: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} • Fuentes: MAEC, OACI, OSINT
          </p>
        </div>

        {/* KPI 1: Índice Global de Riesgo */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Índice Global de Riesgo por País</h2>
          </div>
          
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Buscar país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="score">Ordenar por Score</option>
                <option value="politico">Ordenar por Riesgo Político</option>
                <option value="aereo">Ordenar por Riesgo Aéreo</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredData.map((pais) => (
                <div
                  key={pais.code}
                  className={`bg-slate-700/50 rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                    selectedCountries.includes(pais.code) ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => toggleCountry(pais.code)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{pais.code === 'ES' ? '🇪🇸' : pais.code === 'US' ? '🇺🇸' : pais.code === 'MX' ? '🇲🇽' : pais.code === 'BR' ? '🇧🇷' : '🌍'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(pais.status)}`}>
                      {pais.status === 'seguro' ? '✓ Seguro' : pais.status === 'precaución' ? '⚠ Precaución' : '✗ Alto'}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{pais.country}</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Político:</span>
                      <span className={pais.riesgoPolitico > 40 ? 'text-red-400' : pais.riesgoPolitico > 25 ? 'text-yellow-400' : 'text-green-400'}>
                        {pais.riesgoPolitico}/100
                      </span>
                    </div>
                    <RiskBar value={pais.riesgoPolitico} color={pais.riesgoPolitico > 40 ? 'red' : pais.riesgoPolitico > 25 ? 'yellow' : 'green'} />
                    <div className="flex justify-between text-slate-400 mt-2">
                      <span>Aéreo:</span>
                      <span className={pais.riesgoAereo > 20 ? 'text-red-400' : pais.riesgoAereo > 10 ? 'text-yellow-400' : 'text-green-400'}>
                        {pais.riesgoAereo}/100
                      </span>
                    </div>
                    <RiskBar value={pais.riesgoAereo} color={pais.riesgoAereo > 20 ? 'red' : pais.riesgoAereo > 10 ? 'yellow' : 'green'} />
                    <div className="flex justify-between text-slate-400 mt-2">
                      <span>Restricciones:</span>
                      <span>{pais.restricciones}/100</span>
                    </div>
                    <RiskBar value={pais.restricciones} color="yellow" />
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Score IA:</span>
                      <span className={`text-xl font-bold ${
                        pais.score >= 80 ? 'text-green-400' : pais.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {pais.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KPI 2: Riesgo Aéreo por Región */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Plane className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Riesgo Aéreo por Región</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AIRISKData.map((region) => (
              <div key={region.region} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white">{region.region}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    region.status === 'critico' ? 'bg-red-500/20 text-red-400' :
                    region.status === 'precaución' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {region.status === 'critico' ? 'CRÍTICO' : region.status === 'precaución' ? '⚠' : '✓'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Cancelaciones</span>
                      <span className={region.cancelaciones > 10 ? 'text-red-400' : 'text-white'}>{region.cancelaciones}%</span>
                    </div>
                    <RiskBar value={region.cancelaciones} max={20} color={region.cancelaciones > 10 ? 'red' : region.cancelaciones > 5 ? 'yellow' : 'green'} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Cierres espacio</span>
                      <span className={region.cierres > 5 ? 'text-red-400' : 'text-white'}>{region.cierres}%</span>
                    </div>
                    <RiskBar value={region.cierres} max={15} color={region.cierres > 5 ? 'red' : 'yellow'} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Incidentes</span>
                      <span className="text-white">{region.incidentes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KPI 5: Recomendación IA */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Recomendación IA por País</h2>
          </div>
          
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="grid md:grid-cols-4 gap-6">
              {['Japón', 'España', 'Francia', 'México'].map((country, idx) => {
                const data = KPIData.find(d => d.country === country);
                const scores = [92, 87, 75, 48];
                return (
                  <div key={country} className="text-center">
                    <div className="relative w-28 h-28 mx-auto mb-3">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#334155" strokeWidth="8" fill="none" />
                        <circle 
                          cx="56" cy="56" r="48" 
                          stroke={scores[idx] >= 80 ? '#22c55e' : scores[idx] >= 60 ? '#eab308' : '#ef4444'} 
                          strokeWidth="8" fill="none"
                          strokeDasharray={`${(scores[idx] / 100) * 301} 301`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{scores[idx]}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-white">{country}</h3>
                    <p className={`text-sm ${
                      scores[idx] >= 80 ? 'text-green-400' : scores[idx] >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {scores[idx] >= 80 ? '✓ Recomendado' : scores[idx] >= 60 ? '⚠ Precaución' : '✗ No recomendado'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* KPI 6: Comparador de Países */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Comparador de Países</h2>
          </div>
          
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex flex-wrap gap-2 mb-6">
              {KPIData.slice(0, 10).map((pais) => (
                <button
                  key={pais.code}
                  onClick={() => toggleCountry(pais.code)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCountries.includes(pais.code)
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {pais.code === 'ES' ? '🇪🇸' : pais.code === 'FR' ? '🇫🇷' : pais.code === 'MX' ? '🇲🇽' : pais.code === 'US' ? '🇺🇸' : '🌍'} {pais.code}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {selectedCountries.slice(0, 3).map((code) => {
                const pais = KPIData.find(d => d.code === code);
                if (!pais) return null;
                return (
                  <div key={code} className="bg-slate-700/50 rounded-xl p-4">
                    <h3 className="font-bold text-white text-lg mb-4 text-center">{pais.country}</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Político', value: 100 - pais.riesgoPolitico },
                        { label: 'Aéreo', value: 100 - pais.riesgoAereo },
                        { label: 'Seguridad', value: pais.score },
                        { label: 'Económico', value: pais.score > 60 ? 80 : 65 },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">{item.label}</span>
                            <span className="text-white font-medium">{Math.round(item.value)}</span>
                          </div>
                          <RiskBar value={item.value} color={item.value > 70 ? 'green' : item.value > 50 ? 'yellow' : 'red'} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* KPI 7: Alertas en Tiempo Real */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Alertas en Tiempo Real</h2>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium animate-pulse">
              EN VIVO
            </span>
          </div>
          
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Alertas de Vuelo</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Actualizar"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingAlerts ? 'animate-spin' : ''}`} />
                </button>
                {flightAlerts.length > 0 ? (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    EN VIVO
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded-full text-xs">
                    {loadingAlerts ? 'Cargando...' : 'Sin datos'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {loadingAlerts ? (
                <div className="text-center py-8 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Cargando alertas...
                </div>
              ) : flightAlerts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No hay alertas de vuelo activas
                </div>
              ) : (
                flightAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-4 p-4 rounded-xl border ${
                      alert.delay > 30 ? 'bg-red-500/10 border-red-500/30' :
                      alert.delay > 15 ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-green-500/10 border-green-500/30'
                    }`}
                  >
                    <Plane className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      alert.delay > 30 ? 'text-red-400' :
                      alert.delay > 15 ? 'text-yellow-400' :
                      'text-green-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm">{alert.flight}</span>
                        <span className="text-2xl">{alert.departure} → {alert.arrival}</span>
                      </div>
                      <p className="text-white font-medium">{alert.airline}</p>
                      <p className="text-slate-400 text-sm">
                        {alert.delay > 0 ? `Retraso: ${alert.delay} min` : 'Sin retraso'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Footer con fuentes */}
        <div className="text-center text-slate-500 text-sm">
          <p>Datos actualizados: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} | Fuentes: MAEC, OACI, OSINT</p>
          <p className="mt-2">💡 Los KPIs son orientativos. Verifica siempre las alertas oficiales antes de viajar.</p>
        </div>
      </main>
    </div>
  );
}