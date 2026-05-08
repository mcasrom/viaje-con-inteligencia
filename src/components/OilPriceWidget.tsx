'use client';

import { useEffect, useState } from 'react';
import { Fuel, TrendingUp, TrendingDown } from 'lucide-react';

interface OilData {
  price: number;
  avg: number;
  changePct: number;
  trend: string;
  eurUsd: number;
  history: { month: string; price: number }[];
  avgSurcharge: number;
  tciImpact: number;
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 72;
  const h = 20;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x},${y}`;
  });
  const d = `M${pts.join(' L')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-[72px] h-5 ${className || ''}`}>
      <path d={d} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OilPriceWidget() {
  const [oil, setOil] = useState<OilData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/oil-price')
      .then(res => res.json())
      .then(data => setOil(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-24 mb-3" />
        <div className="h-8 bg-slate-700 rounded w-32 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-20" />
      </div>
    );
  }

  if (!oil) return null;

  const isUp = oil.trend === 'up' || oil.changePct > 0;
  const sparkData = oil.history.map(h => h.price);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Petróleo Brent</span>
        </div>
        <Sparkline data={sparkData} />
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-white">${oil.price.toFixed(2)}</span>
        <span className={`flex items-center gap-0.5 text-sm font-medium ${isUp ? 'text-red-400' : 'text-green-400'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{oil.changePct.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-500 text-xs">
        <span>Media ${oil.avg.toFixed(1)}</span>
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span>Recargo combustible <strong className={oil.avgSurcharge > 3 ? 'text-red-400' : 'text-slate-400'}>{oil.avgSurcharge.toFixed(1)}%</strong></span>
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span className="text-cyan-400"><strong>EUR/USD</strong> {(1 / oil.eurUsd).toFixed(4)}</span>
      </div>
    </div>
  );
}
