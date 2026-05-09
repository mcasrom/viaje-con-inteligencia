'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, RefreshCw, ArrowRight, User, Wallet, Shield, ChevronDown } from 'lucide-react';

interface Recommendation {
  code: string; name: string; flag: string; risk: string;
  capital: string; score: number; reasons: string[];
}

type TravelerType = 'mochilero' | 'lujo' | 'familiar' | 'aventura' | 'negocios';
type BudgetRange = 'bajo' | 'medio' | 'alto';
type RiskTolerance = 'baja' | 'media' | 'alta';

interface UserPrefs {
  traveler_type: TravelerType;
  budget_range: BudgetRange;
  risk_tolerance: RiskTolerance;
}

const TRAVELER_LABELS: Record<TravelerType, string> = {
  mochilero: 'Mochilero', lujo: 'Lujo', familiar: 'Familiar',
  aventura: 'Aventura', negocios: 'Negocios',
};

const BUDGET_LABELS: Record<BudgetRange, string> = {
  bajo: '~30€/día', medio: '~60€/día', alto: '~120€/día',
};

const RISK_LABELS: Record<RiskTolerance, string> = {
  baja: 'Solo seguro', media: 'Riesgo medio', alta: 'Cualquier destino',
};

const TRAVELER_TO_PREF: Record<TravelerType, string> = {
  mochilero: 'aventura', lujo: 'cultural', familiar: 'relax',
  aventura: 'aventura', negocios: 'cultural',
};

const riesgoColors: Record<string, string> = {
  'sin-riesgo': 'bg-green-500', 'bajo': 'bg-yellow-500',
  'medio': 'bg-orange-500', 'alto': 'bg-red-500', 'muy-alto': 'bg-red-800',
};

export default function OneClickRecommendations({ favorites = [] }: { favorites: string[] }) {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch('/api/user/preferences')
      .then(r => r.json())
      .then(data => {
        if (data.preferences) {
          setPrefs({
            traveler_type: data.preferences.traveler_type || 'mochilero',
            budget_range: data.preferences.budget_range || 'medio',
            risk_tolerance: data.preferences.risk_tolerance || 'media',
          });
        }
      })
      .catch(() => {});
  }, []);

  const fetchRecommendations = async () => {
    if (!prefs) return;
    setLoading(true);
    setLoaded(true);
    try {
      const params = new URLSearchParams();
      params.set('preferencia', TRAVELER_TO_PREF[prefs.traveler_type]);
      params.set('budget', prefs.budget_range);
      params.set('duracion', '7');
      if (favorites.length > 0) params.set('favorites', favorites.join(','));

      const res = await fetch(`/api/recommendations?${params}`);
      const data = await res.json();
      let recs: Recommendation[] = data.recommendations || [];

      if (prefs.risk_tolerance === 'baja') {
        recs = recs.filter(r => r.risk === 'sin-riesgo' || r.risk === 'bajo');
      } else if (prefs.risk_tolerance === 'media') {
        recs = recs.filter(r => r.risk !== 'muy-alto');
      }

      setRecommendations(recs.slice(0, 8));
    } catch { setRecommendations([]); }
    finally { setLoading(false); }
  };

  const saveAndRefresh = async (update: Partial<UserPrefs>) => {
    const updated = { ...prefs!, ...update };
    setPrefs(updated);
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viajero_tipo: updated.traveler_type,
          presupuesto: updated.budget_range,
          tolerancia_riesgo: updated.risk_tolerance,
        }),
      });
    } catch {}
  };

  if (!prefs) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Recomendaciones 1 click</h3>
          </div>
          <button onClick={() => setEditing(!editing)} className="text-xs text-slate-400 hover:text-white transition-colors">
            {editing ? 'Cerrar' : 'Editar perfil'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-1.5 bg-slate-700/50 rounded-lg px-2.5 py-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-slate-300">{TRAVELER_LABELS[prefs.traveler_type]}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-700/50 rounded-lg px-2.5 py-1.5">
            <Wallet className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-slate-300">{BUDGET_LABELS[prefs.budget_range]}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-700/50 rounded-lg px-2.5 py-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-300">{RISK_LABELS[prefs.risk_tolerance]}</span>
          </div>
        </div>

        {editing && (
          <div className="mt-4 space-y-3 border-t border-slate-700/50 pt-4">
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase mb-2">Tipo de viajero</p>
              <div className="flex flex-wrap gap-1.5">
                {(['mochilero', 'lujo', 'familiar', 'aventura', 'negocios'] as TravelerType[]).map(t => (
                  <button key={t} onClick={() => saveAndRefresh({ traveler_type: t })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      prefs.traveler_type === t ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}>{TRAVELER_LABELS[t]}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase mb-2">Presupuesto</p>
              <div className="flex gap-1.5">
                {(['bajo', 'medio', 'alto'] as BudgetRange[]).map(b => (
                  <button key={b} onClick={() => saveAndRefresh({ budget_range: b })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      prefs.budget_range === b ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}>{BUDGET_LABELS[b]}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase mb-2">Tolerancia al riesgo</p>
              <div className="flex gap-1.5">
                {(['baja', 'media', 'alta'] as RiskTolerance[]).map(r => (
                  <button key={r} onClick={() => saveAndRefresh({ risk_tolerance: r })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      prefs.risk_tolerance === r ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}>{RISK_LABELS[r]}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        {!loaded ? (
          <button onClick={fetchRecommendations} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Buscando...' : 'Recomiéndame destinos'}
          </button>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
            <span className="ml-2 text-slate-400 text-sm">Generando recomendaciones...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-400 text-sm">No encontramos destinos con esos criterios</p>
            <button onClick={fetchRecommendations} className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto">
              <RefreshCw className="w-3 h-3" /> Intentar de nuevo
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recommendations.map(rec => (
                <Link key={rec.code} href={`/pais/${rec.code}`}
                  className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700 rounded-xl p-3 transition-colors group">
                  <span className="text-2xl">{rec.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium text-sm group-hover:text-yellow-400 transition-colors truncate">{rec.name}</h4>
                      <span className={`w-2 h-2 rounded-full ${riesgoColors[rec.risk] || 'bg-slate-500'}`} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{rec.capital}</span>
                      <span className="text-[10px] font-bold text-yellow-400">{rec.score}%</span>
                    </div>
                    {rec.reasons.length > 0 && (
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">{rec.reasons.slice(0, 2).join(' · ')}</p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-yellow-400 shrink-0" />
                </Link>
              ))}
            </div>
            {recommendations.length > 0 && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-slate-500">{recommendations.length} destinos encontrados</span>
                <button onClick={fetchRecommendations} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Actualizar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
