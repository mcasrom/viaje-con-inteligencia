'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  countryCode: string;
}

interface TrendData {
  trend: 'subiendo' | 'bajando' | 'estable';
  trendLabel: string;
  trendIcon: string;
  trendColor: string;
  probabilityUp7d: number;
  confidence: 'alta' | 'media' | 'baja';
  factors: string[];
}

export default function RiskTrendIndicator({ countryCode }: Props) {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/ml/predict/${countryCode}`)
      .then(r => r.json())
      .then(d => {
        if (d.trend) {
          setData({
            trend: d.trend,
            trendLabel: d.trendLabel,
            trendIcon: d.trendIcon,
            trendColor: d.trendColor,
            probabilityUp7d: d.probabilityUp7d,
            confidence: d.confidence,
            factors: d.factors || [],
          });
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [countryCode]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Analizando tendencia...</span>
      </div>
    );
  }

  if (!data) return null;

  const bgMap = {
    subiendo: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
    bajando: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
    estable: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
  };

  const textMap = {
    subiendo: 'text-red-400',
    bajando: 'text-green-400',
    estable: 'text-blue-400',
  };

  const iconMap = {
    subiendo: <TrendingUp className="w-3.5 h-3.5" />,
    bajando: <TrendingDown className="w-3.5 h-3.5" />,
    estable: <Minus className="w-3.5 h-3.5" />,
  };

  const confidenceBadge = {
    alta: 'bg-green-500/20 text-green-400',
    media: 'bg-amber-500/20 text-amber-400',
    baja: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className={`rounded-lg border ${bgMap[data.trend]} transition-colors`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className={textMap[data.trend]}>{iconMap[data.trend]}</span>
          <span className={`text-xs font-medium ${textMap[data.trend]}`}>
            {data.trendLabel}
          </span>
          <span className="text-xs text-slate-500">
            · {(data.probabilityUp7d)}% prob. subida 7d
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${confidenceBadge[data.confidence]}`}>
            {data.confidence}
          </span>
        </div>
      </button>

      {expanded && data.factors.length > 0 && (
        <div className="px-3 pb-2.5 border-t border-white/5 pt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1.5">
            <AlertTriangle className="w-3 h-3" />
            <span>Factores detectados:</span>
          </div>
          <ul className="space-y-1">
            {data.factors.map((f, i) => (
              <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                <span className="text-slate-600 mt-0.5">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
