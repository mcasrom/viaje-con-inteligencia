'use client';
import { useEffect, useState } from 'react';
import { TOTAL_PAISES } from '@/lib/constants';

interface Stats {
  subscribers: number;
  alertsToday: number;
  updatedAgo: string;
}

export default function HomeStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats/home')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="w-full flex items-center justify-center gap-4 md:gap-8 py-2 px-4 text-xs text-slate-400 flex-wrap">
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-300 font-medium">{TOTAL_PAISES}</span> países monitorizados
      </span>
      <span className="hidden sm:block w-px h-3 bg-slate-700" />
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Actualizado <span className="text-slate-300 font-medium">{stats?.updatedAgo ?? '...'}</span>
      </span>
      <span className="hidden sm:block w-px h-3 bg-slate-700" />
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span className="text-slate-300 font-medium">{stats?.alertsToday ?? '...'}</span> alertas hoy
      </span>
      <span className="hidden sm:block w-px h-3 bg-slate-700" />
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="text-slate-300 font-medium">{stats ? stats.subscribers.toLocaleString('es') : '...' }</span> suscriptores
      </span>
    </div>
  );
}
