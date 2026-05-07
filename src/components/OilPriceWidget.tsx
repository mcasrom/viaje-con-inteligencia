'use client';

import { useEffect, useState } from 'react';
import { Fuel, TrendingUp, TrendingDown } from 'lucide-react';

export default function OilPriceWidget() {
  const [oil, setOil] = useState<{ price: number; avg: number; changePct: number; trend: string } | null>(null);
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

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Fuel className="w-4 h-4 text-amber-400" />
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Petróleo Brent</span>
      </div>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-2xl font-bold text-white">${oil.price.toFixed(2)}</span>
        <span className={`flex items-center gap-0.5 text-sm font-medium ${isUp ? 'text-red-400' : 'text-green-400'}`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isUp ? '+' : ''}{oil.changePct.toFixed(1)}%
        </span>
      </div>
      <p className="text-slate-500 text-xs">Media: ${oil.avg.toFixed(2)}/barril</p>
    </div>
  );
}
