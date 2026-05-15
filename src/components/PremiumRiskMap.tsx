'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Layers, TrendingUp, Calendar, ChevronDown, AlertTriangle, Shield } from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
  'sin-riesgo': '#22c55e',
  'bajo': '#84cc16',
  'medio': '#f59e0b',
  'alto': '#ef4444',
  'muy-alto': '#991b1b',
};

const RISK_ORDER = ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'];

function riskScore(level: string): number {
  return RISK_ORDER.indexOf(level) + 1;
}

interface CountryRisk {
  code: string;
  name: string;
  flag: string;
  region: string;
  riskLevel: string;
  riskScore: number;
  lat: number;
  lng: number;
  color: string;
}

interface EditionInfo {
  id: string;
  edition: number;
  week_start: string;
  title: string;
}

interface RiskMapResponse {
  countries: CountryRisk[];
  compareCountries: CountryRisk[] | null;
  weekStart: string;
  mode: string;
}

function getRiskRadius(score: number): number {
  return 4 + score * 2;
}

function riskLabel(level: string): string {
  const map: Record<string, string> = {
    'sin-riesgo': 'Sin riesgo',
    'bajo': 'Bajo',
    'medio': 'Medio',
    'alto': 'Alto',
    'muy-alto': 'Crítico',
  };
  return map[level] || level;
}

const MapContent = dynamic(
  () => import('./PremiumRiskMapInner'),
  { ssr: false, loading: () => (
    <div className="h-[500px] bg-slate-900 rounded-xl flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <GlobeIcon className="w-8 h-8 text-slate-700" />
        <p className="text-slate-600 text-sm">Cargando mapa interactivo...</p>
      </div>
    </div>
  )}
);

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function PremiumRiskMap({ infografiaId }: { infografiaId: string }) {
  const [editions, setEditions] = useState<EditionInfo[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<string>(infografiaId);
  const [compareEdition, setCompareEdition] = useState<string | null>(null);
  const [enableCompare, setEnableCompare] = useState(false);
  const [mapData, setMapData] = useState<RiskMapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditionPicker, setShowEditionPicker] = useState(false);
  const [showComparePicker, setShowComparePicker] = useState(false);

  // Fetch available editions
  useEffect(() => {
    fetch('/api/infografias?perPage=50')
      .then(r => r.json())
      .then(data => {
        if (data.data) setEditions(data.data);
      })
      .catch(() => {});
  }, []);

  // Fetch risk map data
  const fetchMapData = useCallback(async (edition: string, compare: string | null) => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/infografias/risk-map?edition=${edition}`;
      if (compare) url += `&compare=${compare}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar datos del mapa');
      const data = await res.json();
      setMapData(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData(selectedEdition, enableCompare ? compareEdition : null);
  }, [selectedEdition, compareEdition, enableCompare, fetchMapData]);

  const selectedEd = editions.find(e => e.id === selectedEdition);
  const compareEd = editions.find(e => e.id === compareEdition);

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-400">MAPA INTERACTIVO DE RIESGOS</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">PREMIUM</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Edition selector */}
          <div className="relative">
            <button
              onClick={() => { setShowEditionPicker(!showEditionPicker); setShowComparePicker(false); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors border border-slate-600/50"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{selectedEd ? `#${selectedEd.edition}` : 'Seleccionar'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            {showEditionPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowEditionPicker(false)} />
                <div className="absolute top-full left-0 mt-1 z-20 bg-slate-800 border border-slate-600 rounded-lg max-h-48 overflow-y-auto min-w-[200px] shadow-xl">
                  {editions.map(ed => (
                    <button
                      key={ed.id}
                      onClick={() => { setSelectedEdition(ed.id); setShowEditionPicker(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors ${
                        ed.id === selectedEdition ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span className="font-mono">#{ed.edition}</span>
                      <span className="text-slate-500 ml-2">{ed.week_start}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Compare toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableCompare}
              onChange={(e) => {
                setEnableCompare(e.target.checked);
                if (!e.target.checked) setCompareEdition(null);
              }}
              className="rounded border-slate-600 bg-slate-800 text-amber-400 focus:ring-amber-400/30"
            />
            <span className="text-xs text-slate-400">Comparar</span>
          </label>

          {/* Compare edition selector */}
          {enableCompare && (
            <div className="relative">
              <button
                onClick={() => { setShowComparePicker(!showComparePicker); setShowEditionPicker(false); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors border border-amber-500/30"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>{compareEd ? `#${compareEd.edition}` : 'vs...'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              {showComparePicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowComparePicker(false)} />
                  <div className="absolute top-full left-0 mt-1 z-20 bg-slate-800 border border-slate-600 rounded-lg max-h-48 overflow-y-auto min-w-[200px] shadow-xl">
                    {editions.filter(e => e.id !== selectedEdition).map(ed => (
                      <button
                        key={ed.id}
                        onClick={() => { setCompareEdition(ed.id); setShowComparePicker(false); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors ${
                          ed.id === compareEdition ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300'
                        }`}
                      >
                        <span className="font-mono">#{ed.edition}</span>
                        <span className="text-slate-500 ml-2">{ed.week_start}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Summary info */}
          {mapData && !loading && (
            <div className="ml-auto text-right">
              {mapData.countries && (
                <div className="text-[10px] text-slate-500 font-mono">
                  {mapData.mode === 'current'
                    ? 'Datos actuales'
                    : `${mapData.weekStart}`}
                  {mapData.compareCountries && ` vs ${selectedEd?.week_start}`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        {error && (
          <div className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        )}

        {!error && (
          <MapContent
            countries={mapData?.countries || []}
            compareCountries={enableCompare ? mapData?.compareCountries || null : null}
            loading={loading}
          />
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-800/30 border-t border-slate-700/50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Riesgo</span>
          {RISK_ORDER.map(level => (
            <div key={level} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: RISK_COLORS[level] }}
              />
              <span className="text-[11px] text-slate-400">{riskLabel(level)}</span>
            </div>
          ))}
          {enableCompare && mapData?.compareCountries && (
            <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-700">
              <div className="w-3 h-3 rounded-sm bg-purple-400" />
              <span className="text-[11px] text-purple-400">Diferencia</span>
            </div>
          )}
        </div>
        {enableCompare && mapData?.compareCountries && (
          <p className="text-[10px] text-slate-600 mt-2">
            Las líneas concéntricas indican cambio de riesgo respecto a la edición comparada.
          </p>
        )}
      </div>
    </div>
  );
}
