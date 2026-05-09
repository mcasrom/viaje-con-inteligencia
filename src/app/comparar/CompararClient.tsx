'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, Search, TrendingUp, TrendingDown, Minus, Shield, Globe, DollarSign, Activity, Award, AlertTriangle } from 'lucide-react';
import { paisesData, getLabelRiesgo, NivelRiesgo } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';

interface IndexEntry {
  codigo_pais: string;
  nombre_pais: string;
  valor: number;
  rank: number;
  cambio?: number;
  nivel?: string;
  region: string;
}

interface CountryData {
  code: string;
  name: string;
  flag: string;
  capital: string;
  continent: string;
  language: string;
  currency: string;
  population: string;
  riesgo: NivelRiesgo;
  riesgoLabel: string;
  gpi: { score: number; rank: number } | null;
  gti: { score: number; rank: number } | null;
  hdi: { score: number; rank: number } | null;
  ipc: { value: string; level: string } | null;
  tci: number | null;
}

function getAllCountries() {
  return Object.values(paisesData)
    .filter(p => p.codigo !== 'cu' && p.visible !== false)
    .map(p => ({ code: p.codigo, name: p.nombre, flag: p.bandera, continent: p.continente }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const RIESGO_COLORS: Record<string, string> = {
  'sin-riesgo': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bajo': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'medio': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'alto': 'bg-red-500/20 text-red-400 border-red-500/30',
  'muy-alto': 'bg-red-900/40 text-red-300 border-red-800/50',
};

const IPC_COLORS: Record<string, string> = {
  'Muy Bajo': 'text-emerald-400',
  'Bajo': 'text-green-400',
  'Medio': 'text-yellow-400',
  'Alto': 'text-orange-400',
  'Muy Alto': 'text-red-400',
  'Extremo': 'text-red-300',
};

function ValueIndicator({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) return <Minus className="w-4 h-4 text-slate-600" />;
  return invert ? <TrendingDown className="w-4 h-4 text-emerald-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />;
}

export default function CompararClient() {
  const [gpiData, setGpiData] = useState<IndexEntry[]>([]);
  const [gtiData, setGtiData] = useState<IndexEntry[]>([]);
  const [hdiData, setHdiData] = useState<IndexEntry[]>([]);
  const [ipcData, setIpcData] = useState<IndexEntry[]>([]);
  const allCountries = getAllCountries();
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['es', 'fr', 'de']);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [gpi, gti, hdi, ipc] = await Promise.all([
        fetch('/api/indices?tipo=gpi').then(r => r.json()),
        fetch('/api/indices?tipo=gti').then(r => r.json()),
        fetch('/api/indices?tipo=hdi').then(r => r.json()),
        fetch('/api/indices?tipo=ipc').then(r => r.json()),
      ]);
      setGpiData(gpi);
      setGtiData(gti);
      setHdiData(hdi);
      setIpcData(ipc);
    };
    fetchData();
  }, []);

  function getCountryData(code: string): CountryData | null {
    const pais = paisesData[code];
    if (!pais) return null;

    const gpi = gpiData.find(d => d.codigo_pais === code.toLowerCase()) || null;
    const gti = gtiData.find(d => d.codigo_pais === code.toLowerCase()) || null;
    const hdi = hdiData.find(d => d.codigo_pais === code.toLowerCase()) || null;
    const ipc = ipcData.find(d => d.codigo_pais === code.toLowerCase()) || null;

    const tciData = calculateTCI(code);

    return {
      code,
      name: pais.nombre,
      flag: pais.bandera,
      capital: pais.capital,
      continent: pais.continente,
      language: pais.idioma,
      currency: pais.moneda,
      population: pais.poblacion,
      riesgo: pais.nivelRiesgo,
      riesgoLabel: getLabelRiesgo(pais.nivelRiesgo),
      gpi: gpi ? { score: gpi.valor, rank: gpi.rank } : null,
      gti: gti ? { score: gti.valor, rank: gti.rank } : null,
      hdi: hdi ? { score: hdi.valor, rank: hdi.rank } : null,
      ipc: ipc ? { value: ipc.valor.toString(), level: ipc.nivel || '' } : null,
      tci: tciData ? Math.round(tciData.tci * 10) / 10 : null,
    };
  }

  const selectedCountries = selectedCodes.map(getCountryData).filter(Boolean) as CountryData[];

  const filteredCountries = search
    ? allCountries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !selectedCodes.includes(c.code)
      ).slice(0, 15)
    : [];

  const addCountry = (code: string) => {
    if (selectedCodes.length < 4 && !selectedCodes.includes(code)) {
      setSelectedCodes([...selectedCodes, code]);
    }
    setSearch('');
    setShowDropdown(false);
  };

  const removeCountry = (code: string) => {
    setSelectedCodes(selectedCodes.filter(c => c !== code));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Comparador de Países</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Compara hasta 4 países lado a lado: riesgo MAEC, paz, terrorismo, desarrollo humano, inflación y coste de viaje.
          </p>
        </div>

        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5 mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedCountries.map(c => (
              <div key={c.code} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-600/50">
                <span className="text-xl">{c.flag}</span>
                <span className="text-white text-sm font-medium">{c.name}</span>
                <button onClick={() => removeCountry(c.code)} className="text-slate-400 hover:text-red-400 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {selectedCodes.length < 4 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-blue-600/20 text-blue-400 rounded-lg px-4 py-2 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Añadir país
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-700">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar país..."
                          className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredCountries.length === 0 ? (
                        <div className="p-4 text-slate-500 text-sm text-center">No se encontraron países</div>
                      ) : (
                        filteredCountries.map(c => (
                          <button
                            key={c.code}
                            onClick={() => addCountry(c.code)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left"
                          >
                            <span className="text-lg">{c.flag}</span>
                            <div>
                              <div className="text-white text-sm">{c.name}</div>
                              <div className="text-slate-500 text-xs">{c.continent}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedCountries.length > 0 && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 bg-slate-700/30 border-b border-slate-700/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />Información Básica
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
                {selectedCountries.map(c => (
                  <div key={c.code} className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{c.flag}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{c.name}</h3>
                        <p className="text-slate-400 text-sm">{c.capital}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Continente</span>
                        <span className="text-white">{c.continent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Idioma</span>
                        <span className="text-white">{c.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Moneda</span>
                        <span className="text-white">{c.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Población</span>
                        <span className="text-white">{c.population}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 bg-slate-700/30 border-b border-slate-700/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />Seguridad y Riesgo
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
                {selectedCountries.map(c => (
                  <div key={c.code} className="p-5 space-y-4">
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Riesgo MAEC</div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${RIESGO_COLORS[c.riesgo]}`}>
                        {c.riesgoLabel}
                      </span>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Índice Paz (GPI)</div>
                      {c.gpi ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">{c.gpi.score}</span>
                          <span className="text-slate-500 text-xs">#{c.gpi.rank}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">Sin datos</span>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Terrorismo (GTI)</div>
                      {c.gti ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">{c.gti.score}</span>
                          <span className="text-slate-500 text-xs">#{c.gti.rank}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">Sin datos</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 bg-slate-700/30 border-b border-slate-700/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />Desarrollo y Economía
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
                {selectedCountries.map(c => (
                  <div key={c.code} className="p-5 space-y-4">
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Desarrollo Humano (HDI)</div>
                      {c.hdi ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">{c.hdi.score}</span>
                          <span className="text-slate-500 text-xs">#{c.hdi.rank}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">Sin datos</span>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Inflación (IPC)</div>
                      {c.ipc ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${IPC_COLORS[c.ipc.level] || 'text-white'}`}>{c.ipc.value}</span>
                          <span className="text-slate-500 text-xs">{c.ipc.level}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">Sin datos</span>
                      )}
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Coste de Viaje (TCI)</div>
                      {c.tci !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">{c.tci}</span>
                          <span className="text-slate-500 text-xs">/100</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">Sin datos</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Leyenda</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500">
                <div><span className="text-emerald-400">●</span> GPI/GTI/HDI: menor es mejor (GPI, GTI), mayor es mejor (HDI)</div>
                <div><span className="text-amber-400">●</span> IPC: inflación anual (menor = mejor)</div>
                <div><span className="text-blue-400">●</span> TCI: índice de coste de viaje (menor = más barato)</div>
                <div><span className="text-red-400">●</span> MAEC: riesgo oficial del gobierno español</div>
              </div>
            </div>
          </div>
        )}

        {selectedCountries.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Selecciona al menos un país para comparar</p>
          </div>
        )}
      </div>
    </div>
  );
}
