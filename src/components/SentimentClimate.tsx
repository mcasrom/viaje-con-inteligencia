'use client';

import { useEffect, useState } from 'react';

interface Props {
  countryName: string;
  countryCode: string;
}

interface ClimateData {
  avgTone: number | null;
  signals: number;
  mood: 'positive' | 'negative' | 'neutral' | null;
}

const MOOD_CONFIG = {
  positive: { emoji: '😊', label: 'Clima positivo', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  neutral: { emoji: '😐', label: 'Clima neutral', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  negative: { emoji: '😟', label: 'Clima negativo', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

export default function SentimentClimate({ countryName, countryCode }: Props) {
  const [data, setData] = useState<ClimateData | null>(null);

  useEffect(() => {
    fetch(`/api/osint/sentiment-climate?country=${encodeURIComponent(countryName)}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ avgTone: null, signals: 0, mood: null }));
  }, [countryName]);

  if (!data || data.signals === 0) return null;

  const mood = data.mood ? MOOD_CONFIG[data.mood] : null;
  if (!mood) return null;

  return (
    <div className={`rounded-lg p-3 border ${mood.bg}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{mood.emoji}</span>
        <div className="min-w-0">
          <div className={`text-sm font-semibold ${mood.color}`}>{mood.label}</div>
          <div className="text-[11px] text-slate-500">
            {data.avgTone != null ? `Sentimiento ${data.avgTone > 0 ? '+' : ''}${data.avgTone}` : ''}
            {' · '}{data.signals} señales (7d)
          </div>
        </div>
      </div>
    </div>
  );
}
