'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  countryCode: string;
}

export default function RiskTrendIndicator({ countryCode }: Props) {
  const [trend, setTrend] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/maec/trend?code=${countryCode}`)
      .then(r => r.json())
      .then(d => setTrend(d.trend))
      .catch(() => setTrend(null));
  }, [countryCode]);

  if (!trend) return null;

  if (trend === 'subiendo') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium" title="El riesgo está aumentando">
        <TrendingUp className="w-3.5 h-3.5" />
        Subiendo
      </span>
    );
  }
  if (trend === 'bajando') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-400 font-medium" title="El riesgo está disminuyendo">
        <TrendingDown className="w-3.5 h-3.5" />
        Bajando
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium" title="Riesgo estable">
      <Minus className="w-3.5 h-3.5" />
      Estable
    </span>
  );
}
