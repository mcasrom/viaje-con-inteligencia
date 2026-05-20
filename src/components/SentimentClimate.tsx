'use client';

import { useEffect, useState } from 'react';

interface Props {
  countryName: string;
  countryCode: string;
  compact?: boolean;
}

interface ClimateData {
  avgTone: number | null;
  signals: number;
  toneTrend7d: number | null;
  mood: 'positive' | 'negative' | 'neutral' | null;
}

const MOOD_CONFIG = {
  positive: { emoji: '😊', label: 'Clima positivo', color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
  neutral: { emoji: '😐', label: 'Clima neutral', color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
  negative: { emoji: '😟', label: 'Clima negativo', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
};

function TrendArrow({ trend }: { trend: number | null }) {
  if (trend == null) return null;
  if (trend > 0.5) return <span className="text-green-400 text-xs" title="Mejorando">↑</span>;
  if (trend < -0.5) return <span className="text-red-400 text-xs" title="Empeorando">↓</span>;
  return <span className="text-slate-500 text-xs" title="Estable">→</span>;
}

export default function SentimentClimate({ countryName, countryCode, compact }: Props) {
  const [data, setData] = useState<ClimateData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ country: countryName });
    if (countryCode) params.set('code', countryCode);
    fetch(`/api/osint/sentiment-climate?${params}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ avgTone: null, signals: 0, toneTrend7d: null, mood: null }));
  }, [countryName, countryCode]);

  if (!data || data.signals === 0) return null;

  const mood = data.mood ? MOOD_CONFIG[data.mood] : null;
  if (!mood) return null;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${mood.border} ${mood.bg} group relative cursor-default`}>
        <span className="text-sm">{mood.emoji}</span>
        <span className={`text-xs font-semibold ${mood.color}`}>
          {data.avgTone != null ? `${data.avgTone > 0 ? '+' : ''}${data.avgTone}` : '—'}
        </span>
        <TrendArrow trend={data.toneTrend7d} />
        <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 rounded-lg bg-slate-800 border border-slate-600 shadow-xl text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Tono mediático sobre {countryName} en los últimos 7 días.
          <br />
          {data.signals} señales OSINT analizadas.
          {data.toneTrend7d != null && (
            <> Tendencia: {data.toneTrend7d > 0 ? 'mejorando' : data.toneTrend7d < 0 ? 'empeorando' : 'estable'}.</>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-3 border ${mood.border} ${mood.bg} group relative`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{mood.emoji}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${mood.color}`}>{mood.label}</span>
            <TrendArrow trend={data.toneTrend7d} />
          </div>
          <div className="text-[11px] text-slate-500">
            {data.avgTone != null ? `Sentimiento ${data.avgTone > 0 ? '+' : ''}${data.avgTone}` : ''}
            {' · '}{data.signals} señales (7d)
          </div>
        </div>
      </div>
      <div className="absolute bottom-full left-0 mb-2 w-56 p-2.5 rounded-lg bg-slate-800 border border-slate-600 shadow-xl text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        Tono mediático de las noticias y redes sobre {countryName} en los últimos 7 días.
        Escala: +10 (muy positivo) a -10 (muy negativo).
      </div>
    </div>
  );
}
