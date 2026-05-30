'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Thermometer, TrendingUp, MapPin, Cloud, Bell, Loader2, ExternalLink } from 'lucide-react';

interface ItineraryRiskCardProps {
  countryCode: string;
  profile?: string;
  budget?: string;
}

interface RiskData {
  nombre: string;
  nivelRiesgo: string;
  riesgoSanitario: string;
  queNoHacer: string[];
  usRisk: { level: number; label: string } | null;
  mlScore: { score: number; label: string; breakdown: Record<string, number> } | null;
  indices: { gpi: number | null; gti: number | null; hdi: number | null };
  weather: { icon: string; desc: string; temp: number } | null;
  alerts: { title: string; severity: string; type: string }[];
}

const riesgoColors: Record<string, { bg: string; text: string; border: string }> = {
  'sin-riesgo': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  'bajo': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'medio': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  'alto': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  'muy-alto': { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-700/50' },
};

const usRiskColors = ['text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];

export default function ItineraryRiskCard({ countryCode, profile = 'mochilero', budget = 'moderate' }: ItineraryRiskCardProps) {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = countryCode.toLowerCase();
    const budgetMap: Record<string, string> = { low: 'bajo', moderate: 'medio', high: 'alto' };

    Promise.all([
      fetch(`/api/itinerary-risk/${code}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/ml/score?country=${code}&profile=${profile}&budget=${budgetMap[budget] || 'medio'}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/indices?pais=${code}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/weather?code=${code}&days=1`).then(r => r.ok ? r.json() : null),
    ]).then(([riskData, ml, indices, weather]) => {
      if (!riskData) { setLoading(false); return; }

      const idx = indices || [];
      const gpi = idx.find((i: any) => i.tipo === 'gpi')?.valor || null;
      const gti = idx.find((i: any) => i.tipo === 'gti')?.valor || null;
      const hdi = idx.find((i: any) => i.tipo === 'hdi')?.valor || null;

      setData({
        nombre: riskData.nombre,
        nivelRiesgo: riskData.nivelRiesgo,
        riesgoSanitario: riskData.riesgoSanitario,
        queNoHacer: riskData.queNoHacer,
        usRisk: riskData.usRisk,
        mlScore: ml ? { score: ml.score, label: ml.label, breakdown: ml.breakdown || {} } : null,
        indices: { gpi, gti, hdi },
        weather: weather?.current ? { icon: weather.current.icon, desc: weather.current.desc, temp: Math.round(weather.current.temp) } : null,
        alerts: (riskData.incidents || []).slice(0, 3),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [countryCode, profile, budget]);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-slate-400 text-sm">Analizando riesgos del destino...</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maecColors = riesgoColors[data.nivelRiesgo] || riesgoColors['medio'];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Análisis de Riesgo — {data.nombre}</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-xl p-4 border ${maecColors.bg} ${maecColors.border}`}>
            <div className="flex items-center gap-2 mb-1">
              <Shield className={`w-4 h-4 ${maecColors.text}`} />
              <span className="text-slate-400 text-xs">MAEC</span>
            </div>
            <p className={`text-xl font-bold ${maecColors.text}`}>
              {data.nivelRiesgo.replace('-', ' ')}
            </p>
          </div>

          <div className="rounded-xl p-4 border bg-slate-700/30 border-slate-600/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-xs">US State Dept</span>
            </div>
            <p className={`text-xl font-bold ${data.usRisk ? usRiskColors[(data.usRisk.level || 1) - 1] : 'text-slate-500'}`}>
              {data.usRisk ? `Nivel ${data.usRisk.level}` : 'N/A'}
            </p>
          </div>

          <div className="rounded-xl p-4 border bg-slate-700/30 border-slate-600/30">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-red-400" />
              <span className="text-slate-400 text-xs">Sanitario</span>
            </div>
            <p className={`text-xl font-bold ${
              data.riesgoSanitario === 'alto' ? 'text-red-400' :
              data.riesgoSanitario === 'medio' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {data.riesgoSanitario}
            </p>
          </div>

          <div className="rounded-xl p-4 border bg-slate-700/30 border-slate-600/30">
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-xs">Clima ahora</span>
            </div>
            {data.weather ? (
              <p className="text-xl font-bold text-white">
                {data.weather.icon} {data.weather.temp}°C
              </p>
            ) : (
              <p className="text-slate-500 text-sm">Sin datos</p>
            )}
          </div>
        </div>

        {data.mlScore && (
          <div className="mb-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-slate-300 text-sm font-medium">Score personalizado ({profile})</span>
              <span className={`ml-auto text-lg font-bold ${
                data.mlScore.score >= 80 ? 'text-green-400' :
                data.mlScore.score >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {data.mlScore.score}/100
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {Object.entries(data.mlScore.breakdown).map(([key, val]) => (
                <div key={key} className="bg-slate-800/50 rounded-lg p-2">
                  <span className="text-slate-500">{key}</span>
                  <span className="text-white font-medium ml-1">{typeof val === 'number' ? Math.round(val) : val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span className="text-slate-300 text-sm font-medium">Índices globales</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-500 text-xs mb-1">Paz (GPI)</p>
              <p className="text-white font-bold text-lg">{data.indices.gpi ?? '—'}</p>
              <p className="text-slate-600 text-xs">menor = más seguro</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Terrorismo (GTI)</p>
              <p className="text-white font-bold text-lg">{data.indices.gti ?? '—'}</p>
              <p className="text-slate-600 text-xs">menor = menos riesgo</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Desarrollo (HDI)</p>
              <p className="text-white font-bold text-lg">{data.indices.hdi ?? '—'}</p>
              <p className="text-slate-600 text-xs">mayor = mejor infraestructura</p>
            </div>
          </div>
        </div>

        {data.alerts.length > 0 && (
          <div className="mb-6 bg-red-500/5 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm font-medium">Alertas activas ({data.alerts.length})</span>
            </div>
            <div className="space-y-2">
              {data.alerts.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    a.severity === 'high' ? 'bg-red-500' :
                    a.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-slate-300">{a.title}</p>
                    <p className="text-slate-500 text-xs">{a.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.queNoHacer.length > 0 && (
          <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Precauciones clave</span>
            </div>
            <ul className="space-y-1.5">
              {data.queNoHacer.map((item: string, i: number) => (
                <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-700 text-center">
          <a
            href={`/pais/${countryCode.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Ver ficha completa del país <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
