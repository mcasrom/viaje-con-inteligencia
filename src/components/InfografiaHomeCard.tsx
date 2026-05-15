'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, ArrowRight } from 'lucide-react';

interface LatestInfografia {
  id: string;
  edition: number;
  title: string;
  week_start: string;
  week_end: string;
  gwi_score: number | null;
  gwi_trend: number | null;
  image_url: string | null;
  top_risk_countries: string[] | null;
}

function gwiColor(score: number): string {
  if (score < 25) return 'text-green-400';
  if (score < 45) return 'text-lime-400';
  if (score < 60) return 'text-amber-400';
  if (score < 75) return 'text-red-400';
  return 'text-red-600';
}

export default function InfografiaHomeCard() {
  const [latest, setLatest] = useState<LatestInfografia | null>(null);

  useEffect(() => {
    fetch('/api/infografias?latest=true')
      .then(r => r.json())
      .then(data => {
        if (data && data.id) setLatest(data);
      })
      .catch(() => {});
  }, []);

  if (!latest) return null;

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <Link
        href={`/infografias/${latest.id}`}
        className="group block bg-gradient-to-r from-blue-600/5 via-slate-800/50 to-blue-600/5 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 hover:from-blue-600/10 transition-all"
      >
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-mono text-blue-400 font-bold tracking-wider">INFOGRAFÍA SEMANAL</span>
          <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 text-[10px] font-bold rounded-full">NUEVO</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
              {latest.title}
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              {latest.week_start} — {latest.week_end}
            </p>

            {latest.gwi_score !== null && (
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-mono">GWI</span>
                  <div className={`text-2xl font-bold font-mono ${gwiColor(latest.gwi_score)}`}>
                    {latest.gwi_score.toFixed(1)}
                  </div>
                </div>
                {latest.gwi_trend !== null && (
                  <div className={`flex items-center gap-1 text-sm font-mono ${latest.gwi_trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    <TrendingUp className={`w-4 h-4 ${latest.gwi_trend > 0 ? '' : 'rotate-180'}`} />
                    {Math.abs(latest.gwi_trend).toFixed(1)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            {latest.top_risk_countries && latest.top_risk_countries.length > 0 && (
              <div className="text-right text-xs text-slate-500 space-y-0.5">
                <div className="font-mono text-[10px]">TOP RIESGO</div>
                {latest.top_risk_countries.slice(0, 3).map((n, i) => (
                  <div key={i} className="text-slate-400">{n}</div>
                ))}
              </div>
            )}
            <ArrowRight className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
          </div>
        </div>
      </Link>
    </div>
  );
}
