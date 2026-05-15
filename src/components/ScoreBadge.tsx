'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Info } from 'lucide-react';

const SCORE_COLORS: Record<string, string> = {
  excelente: 'bg-green-500/20 text-green-400 border-green-500/30',
  bueno: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  moderado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  desfavorable: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'no recomendado': 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface ScoreData {
  score: number;
  label: string;
  breakdown: { riesgo: number; season: number; coste: number; perfil: number };
  labels: { riesgo: string; season: string; coste: string; perfil: string };
  profile: string;
  budget: string;
}

const PROFILE_LABELS: Record<string, string> = {
  mochilero: 'Mochilero', lujo: 'Lujo', familiar: 'Familiar', aventura: 'Aventura', negocios: 'Negocios',
};

interface ScoreBadgeProps {
  countryCode: string;
  profile?: string;
  budget?: string;
}

export default function ScoreBadge({ countryCode, profile: propProfile, budget: propBudget }: ScoreBadgeProps) {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData(null);
    let profile = propProfile;
    let budget = propBudget;
    if (!profile || !budget) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('viajeia_preferences') : null;
      if (saved) {
        try {
          const prefs = JSON.parse(saved);
          if (!profile && prefs.profile) profile = prefs.profile;
          if (!budget && prefs.budget) budget = prefs.budget;
        } catch {}
      }
    }
    const profileVal = profile || 'mochilero';
    const budgetVal = budget || 'medio';
    const month = new Date().getMonth() + 1;
    fetch(`/api/ml/score?country=${countryCode}&profile=${profileVal}&budget=${budgetVal}&month=${month}`)
      .then(r => r.json())
      .then(d => { if (d.score !== undefined) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [countryCode, propProfile, propBudget]);

  if (loading) return null;
  if (!data) return null;

  const colorClass = SCORE_COLORS[data.label] || SCORE_COLORS.moderado;

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-default ${colorClass}`}
      >
        <Sparkles className="w-3 h-3" />
        Score: {data.score}/100
        <Info className="w-3 h-3 opacity-60" />
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl text-xs space-y-3">
          <p className="text-slate-400 font-medium mb-2">
            {PROFILE_LABELS[data.profile] || data.profile} · {data.budget}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Riesgo</span>
              <span className="text-slate-200 font-medium" style={{ color: data.breakdown.riesgo > 50 ? '#4ade80' : '#f87171' }}>{data.breakdown.riesgo}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Temporada</span>
              <span className="text-slate-200 font-medium">{data.breakdown.season}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Coste</span>
              <span className="text-slate-200 font-medium">{data.breakdown.coste}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Afinidad perfil</span>
              <span className="text-slate-200 font-medium">{data.breakdown.perfil}/100</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700 text-center">
            <span className="text-slate-500 text-[10px]">Score ML personalizado según tu perfil y presupuesto</span>
          </div>
        </div>
      )}
    </div>
  );
}
