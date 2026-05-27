'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, Search, X, Loader2, ExternalLink } from 'lucide-react';
import { paisesData, getColoresRiesgo, getLabelRiesgo } from '@/data/paises';
import type { AdvisoryFuente } from '@/data/fuentes/types';

type CountryOption = { code: string; name: string; flag: string; continent: string };

const ALL_COUNTRIES = Object.values(paisesData)
  .filter(p => p.visible !== false)
  .map(p => ({ code: p.codigo, name: p.nombre, flag: p.bandera, continent: p.continente }))
  .sort((a, b) => a.name.localeCompare(b.name));

const FUENTE_ORDER: string[] = ['maec', 'us-state-dept', 'uk-fcdo', 'canada', 'australia'];
const FUENTE_LABELS: Record<string, string> = {
  maec: 'MAEC', 'us-state-dept': 'US', 'uk-fcdo': 'UK', canada: 'CA', australia: 'AU',
};

export default function ComparadorPaises() {
  const [countryA, setCountryA] = useState<CountryOption | null>(null);
  const [countryB, setCountryB] = useState<CountryOption | null>(null);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);
  const [advisoryA, setAdvisoryA] = useState<AdvisoryFuente[] | null>(null);
  const [advisoryB, setAdvisoryB] = useState<AdvisoryFuente[] | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (refA.current && !refA.current.contains(e.target as Node)) setShowDropdownA(false);
      if (refB.current && !refB.current.contains(e.target as Node)) setShowDropdownB(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!countryA) return;
    setLoadingA(true);
    fetch(`/api/advisories/${countryA.code}`)
      .then(r => r.json())
      .then(d => setAdvisoryA(d.fuentes || null))
      .catch(() => setAdvisoryA(null))
      .finally(() => setLoadingA(false));
  }, [countryA]);

  useEffect(() => {
    if (!countryB) return;
    setLoadingB(true);
    fetch(`/api/advisories/${countryB.code}`)
      .then(r => r.json())
      .then(d => setAdvisoryB(d.fuentes || null))
      .catch(() => setAdvisoryB(null))
      .finally(() => setLoadingB(false));
  }, [countryB]);

  const filterCountries = (search: string, exclude: string | null) =>
    ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) && c.code !== exclude
    ).slice(0, 10);

  function riesgoNum(r: string | null | undefined): number {
    const map: Record<string, number> = { 'sin-riesgo': 0, bajo: 1, medio: 2, alto: 3, 'muy-alto': 4 };
    return r ? (map[r] ?? -1) : -1;
  }

  function diffSymbol(a: number, b: number): string {
    if (a < b) return '▲';
    if (a > b) return '▼';
    return '=';
  }

  function diffColor(a: number, b: number): string {
    if (a < b) return 'text-emerald-400';  // A is safer
    if (a > b) return 'text-red-400';      // B is safer
    return 'text-slate-400';
  }

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5 md:p-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowLeftRight className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-bold text-white">Comparador de Países</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
        <div ref={refA} className="relative">
          <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">País A</label>
          {countryA ? (
            <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2.5 border border-slate-600/50">
              <span className="text-2xl">{countryA.flag}</span>
              <span className="text-white font-medium flex-1">{countryA.name}</span>
              <button onClick={() => { setCountryA(null); setAdvisoryA(null); }}
                className="text-slate-400 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setShowDropdownA(!showDropdownA)}
                className="w-full flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2.5 border border-slate-600/50 text-slate-400 hover:text-white transition-colors text-sm">
                <Search className="w-4 h-4" />
                Seleccionar país...
              </button>
              {showDropdownA && (
                <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-700">
                    <input type="text" value={searchA} onChange={e => setSearchA(e.target.value)}
                      placeholder="Buscar..." autoFocus
                      className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filterCountries(searchA, countryB?.code || null).map(c => (
                      <button key={c.code} onClick={() => { setCountryA(c); setShowDropdownA(false); setSearchA(''); }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 transition-colors text-left">
                        <span className="text-lg">{c.flag}</span>
                        <div>
                          <div className="text-white text-sm">{c.name}</div>
                          <div className="text-slate-500 text-xs">{c.continent}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-center pt-6">
          <ArrowLeftRight className="w-6 h-6 text-slate-500" />
        </div>

        <div ref={refB} className="relative">
          <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">País B</label>
          {countryB ? (
            <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2.5 border border-slate-600/50">
              <span className="text-2xl">{countryB.flag}</span>
              <span className="text-white font-medium flex-1">{countryB.name}</span>
              <button onClick={() => { setCountryB(null); setAdvisoryB(null); }}
                className="text-slate-400 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setShowDropdownB(!showDropdownB)}
                className="w-full flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2.5 border border-slate-600/50 text-slate-400 hover:text-white transition-colors text-sm">
                <Search className="w-4 h-4" />
                Seleccionar país...
              </button>
              {showDropdownB && (
                <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-700">
                    <input type="text" value={searchB} onChange={e => setSearchB(e.target.value)}
                      placeholder="Buscar..." autoFocus
                      className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filterCountries(searchB, countryA?.code || null).map(c => (
                      <button key={c.code} onClick={() => { setCountryB(c); setShowDropdownB(false); setSearchB(''); }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 transition-colors text-left">
                        <span className="text-lg">{c.flag}</span>
                        <div>
                          <div className="text-white text-sm">{c.name}</div>
                          <div className="text-slate-500 text-xs">{c.continent}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {countryA && countryB && (
        <>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[countryA, countryB].map((c, i) => {
              const advisories = i === 0 ? advisoryA : advisoryB;
              const loading = i === 0 ? loadingA : loadingB;
              return (
                <div key={c.code} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{c.flag}</span>
                    <div>
                      <h3 className="text-white font-bold">{c.name}</h3>
                      <p className="text-slate-400 text-xs">{c.continent}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Nivel de riesgo por fuente</h4>
                    {loading ? (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Loader2 className="w-3 h-3 animate-spin" /> Cargando...
                      </div>
                    ) : advisories ? (
                      <div className="space-y-1.5">
                        {FUENTE_ORDER.map(fid => {
                          const f = advisories.find(a => a.id === fid);
                          if (!f) return null;
                          const colores = f.nivelRiesgo ? getColoresRiesgo(f.nivelRiesgo) : null;
                          const label = f.nivelRiesgo ? getLabelRiesgo(f.nivelRiesgo) : 'N/D';
                          const other = i === 0 ? advisoryB : advisoryA;
                          const otherF = other?.find(a => a.id === fid);
                          const otherNum = riesgoNum(otherF?.nivelRiesgo);
                          const thisNum = riesgoNum(f.nivelRiesgo);
                          return (
                            <div key={fid} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 w-6">{FUENTE_LABELS[fid]}</span>
                                <span className={`inline-block w-2 h-2 rounded-full ${colores?.bg || 'bg-slate-600'}`} />
                                <span className={`text-xs font-medium ${colores?.text || 'text-slate-400'}`}>{label}</span>
                              </div>
                              {otherF && f.nivelRiesgo && otherF.nivelRiesgo && (
                                <span className={`text-[10px] font-bold ${diffColor(thisNum, otherNum)}`}>
                                  {diffSymbol(thisNum, otherNum)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">Sin datos comparativos</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-center">
            <a href={`/comparar?p=${countryA.code},${countryB.code}`}
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors">
              <ExternalLink className="w-3 h-3" />
              Ver comparativa completa con GPI, HDI, IPC y más
            </a>
          </div>
        </>
      )}

      {(!countryA || !countryB) && (
        <p className="text-slate-500 text-sm text-center mt-6">
          Selecciona dos países para comparar sus niveles de riesgo según MAEC, US State Dept, UK FCDO, Canadá y Australia.
        </p>
      )}
    </div>
  );
}
