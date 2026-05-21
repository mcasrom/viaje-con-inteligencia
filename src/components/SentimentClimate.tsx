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

const EMPTY_CONFIG = {
  emoji: '🌀', label: 'Sin datos', color: 'text-slate-500', border: 'border-slate-600/30', bg: 'bg-slate-800/30',
};

function TrendArrow({ trend }: { trend: number | null }) {
  if (trend == null) return null;
  if (trend > 0.5) return <span className="text-green-400 text-xs" title="Mejorando">↑</span>;
  if (trend < -0.5) return <span className="text-red-400 text-xs" title="Empeorando">↓</span>;
  return <span className="text-slate-500 text-xs" title="Estable">→</span>;
}

function Tooltip({ countryName, signals, toneTrend7d, children }: { countryName: string; signals: number; toneTrend7d: number | null; children: React.ReactNode }) {
  return (
    <div className="group relative cursor-default">
      {children}
      <div className="absolute bottom-full right-0 mb-2 w-60 p-2.5 rounded-lg bg-slate-800 border border-slate-600 shadow-xl text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {signals === 0 ? (
          <>Todavía no hay suficientes señales OSINT para calcular el clima mediático de {countryName}. Los datos se actualizan diariamente con nuevas fuentes.</>
        ) : (
          <>Tono mediático sobre {countryName} en los últimos 14 días.<br />{signals} señales OSINT analizadas.{toneTrend7d != null && <> Tendencia: {toneTrend7d > 0 ? 'mejorando' : toneTrend7d < 0 ? 'empeorando' : 'estable'}.</>}</>
        )}
      </div>
    </div>
  );
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

  const mood = data && data.mood ? MOOD_CONFIG[data.mood] : EMPTY_CONFIG;
  const hasData = data && data.signals > 0;

  if (compact) {
    return (
      <Tooltip countryName={countryName} signals={data?.signals ?? 0} toneTrend7d={data?.toneTrend7d ?? null}>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${mood.border} ${mood.bg}`}>
          <span className="text-sm">{mood.emoji}</span>
          <span className={`text-xs font-semibold ${mood.color}`}>
            {hasData && data.avgTone != null ? `${data.avgTone > 0 ? '+' : ''}${data.avgTone}` : '—'}
          </span>
          {hasData && <TrendArrow trend={data.toneTrend7d} />}
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip countryName={countryName} signals={data?.signals ?? 0} toneTrend7d={data?.toneTrend7d ?? null}>
      <div className={`rounded-lg p-3 border ${mood.border} ${mood.bg}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{mood.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-semibold ${mood.color}`}>{mood.label}</span>
              {hasData && <TrendArrow trend={data.toneTrend7d} />}
            </div>
            <div className="text-[11px] text-slate-500">
              {hasData
                ? `${data.avgTone != null ? `Sentimiento ${data.avgTone > 0 ? '+' : ''}${data.avgTone}` : ''} · ${data.signals} señales (14d)`
                : 'Esperando datos OSINT...'}
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
