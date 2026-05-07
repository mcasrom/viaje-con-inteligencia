'use client';

import { useEffect, useState } from 'react';
import { Plane, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface DelayData {
  code: string;
  name: string;
  status: 'on_time' | 'delayed' | 'cancelled';
  departureDelay: number;
  arrivalDelay: number;
}

interface AirportDelaysResponse {
  summary: {
    total: number;
    onTime: number;
    delayed: number;
    cancelled: number;
    avgDelay: number;
  };
  data: DelayData[];
  source: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  on_time: <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
  delayed: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  cancelled: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
};

const statusText: Record<string, string> = {
  on_time: 'En hora',
  delayed: 'Retraso',
  cancelled: 'Cancelado',
};

export default function AirportDelaysWidget() {
  const [data, setData] = useState<AirportDelaysResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/airport-delays?country=ES')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-32 mb-3" />
        <div className="h-8 bg-slate-700 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-24" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, data: airports, source } = data;
  const showList = expanded ? airports : airports.slice(0, 5);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Aeropuertos España</span>
        </div>
        <span className="text-slate-600 text-[10px]">{source}</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <div className="text-white font-bold text-lg">{summary.total}</div>
          <div className="text-slate-500 text-[10px]">Aeropuertos</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-bold text-lg">{summary.onTime}</div>
          <div className="text-slate-500 text-[10px]">En hora</div>
        </div>
        <div className="text-center">
          <div className="text-amber-400 font-bold text-lg">{summary.delayed}</div>
          <div className="text-slate-500 text-[10px]">Retrasos</div>
        </div>
        <div className="text-center">
          <div className="text-white font-bold text-lg">{summary.avgDelay}m</div>
          <div className="text-slate-500 text-[10px]">Retraso medio</div>
        </div>
      </div>

      <div className="space-y-2">
        {showList.map((a) => (
          <div key={a.code} className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-2">
            {statusIcons[a.status]}
            <div className="flex-1 min-w-0">
              <span className="text-white text-xs font-medium">{a.code}</span>
              <span className="text-slate-500 text-[10px] ml-2 truncate">{a.name}</span>
            </div>
            <span className={`text-xs font-medium ${
              a.status === 'on_time' ? 'text-green-400' :
              a.status === 'delayed' ? 'text-amber-400' : 'text-red-400'
            }`}>
              {a.status === 'delayed' ? `${a.departureDelay}min` : statusText[a.status]}
            </span>
          </div>
        ))}
      </div>

      {airports.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 text-center text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors"
        >
          {expanded ? 'Ver menos' : `Ver ${airports.length - 5} más`}
        </button>
      )}
    </div>
  );
}
