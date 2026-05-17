'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, RefreshCw, ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Signal {
  id: number;
  source: string;
  source_url: string;
  title: string;
  content: string;
  category: string;
  urgency: string;
  summary: string;
  tone_score: number | null;
  confidence: number;
  location_name: string;
  created_at: string;
  post_timestamp: string;
  sourceIcon: string;
  timeAgo: string;
}

export default function OsintSignalsWidget({ countryCode, countryName }: { countryCode: string; countryName: string }) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch(`/api/pais/${countryCode}/osint?limit=15&days=14`)
      .then(res => res.json())
      .then(data => {
        if (data.signals) setSignals(data.signals);
        if (data.error) setError(data.error);
      })
      .catch(() => setError('Error al cargar señales'))
      .finally(() => setLoading(false));
  }, [countryCode]);

  if (loading && signals.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <p className="text-slate-400 text-sm">Cargando señales OSINT para {countryName}...</p>
        </div>
      </section>
    );
  }

  if (signals.length === 0) return null;

  const urgColor: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <section className="max-w-7xl mx-auto px-6 mt-8">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-between p-5 hover:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h2 className="text-white font-bold">Señales OSINT recientes — {countryName}</h2>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{signals.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setLoading(true); fetch(`/api/pais/${countryCode}/osint?limit=15&days=14`).then(r => r.json()).then(d => { if (d.signals) setSignals(d.signals); }).finally(() => setLoading(false)); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-slate-500 text-sm">{collapsed ? 'Mostrar' : 'Ocultar'}</span>
          </div>
        </button>

        {!collapsed && (
          <div className="border-t border-slate-700">
            {loading && (
              <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
            )}
            {!loading && (
              <div className="divide-y divide-slate-700/50">
                {signals.map(s => (
                  <div key={s.id} className="px-5 py-4 hover:bg-slate-700/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{s.sourceIcon}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${urgColor[s.urgency] || urgColor.low}`}>
                            {s.urgency}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase">{s.category}</span>
                          {s.tone_score != null && (
                            <span className={`text-[10px] font-mono flex items-center gap-0.5 ${s.tone_score < -3 ? 'text-red-400' : s.tone_score > 3 ? 'text-green-400' : 'text-slate-500'}`}>
                              {s.tone_score < -3 ? <TrendingDown className="w-3 h-3" /> : s.tone_score > 3 ? <TrendingUp className="w-3 h-3" /> : null}
                              {s.tone_score > 0 ? '+' : ''}{s.tone_score}
                            </span>
                          )}
                        </div>
                        <p className="text-white text-sm leading-relaxed">{s.summary || s.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11px] text-slate-500">{s.timeAgo}</span>
                          <span className="text-[11px] text-slate-500">{s.source}</span>
                          {s.confidence && <span className="text-[11px] text-slate-500">{Math.round(s.confidence * 100)}%</span>}
                          {s.source_url && (
                            <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-500 hover:text-cyan-400 flex items-center gap-0.5">
                              Fuente <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
