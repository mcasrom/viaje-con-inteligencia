'use client';

import { useState, useEffect } from 'react';
import { getColoresRiesgo, getLabelRiesgo } from '@/data/paises';
import type { AdvisoryFuente } from '@/data/fuentes/types';

interface Props {
  countryCode: string;
}

export default function FuentesComparativa({ countryCode }: Props) {
  const [data, setData] = useState<{ pais: string; fuentes: AdvisoryFuente[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/advisories/${countryCode}`)
      .then(r => r.json())
      .then(d => { if (d.fuentes) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [countryCode]);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48" />
          <div className="h-20 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <p className="text-slate-400 text-sm">No hay datos comparativos disponibles.</p>
      </div>
    );
  }

  const { pais, fuentes } = data;

  const riesgoRank: Record<string, number> = {
    'sin-riesgo': 0,
    'bajo': 1,
    'medio': 2,
    'alto': 3,
    'muy-alto': 4,
  };

  const sorted = [...fuentes].sort((a, b) => {
    const ra = a.nivelRiesgo ? (riesgoRank[a.nivelRiesgo] ?? 0) : 0;
    const rb = b.nivelRiesgo ? (riesgoRank[b.nivelRiesgo] ?? 0) : 0;
    return rb - ra;
  });

  const maxRiesgo = sorted.reduce((max, f) => {
    if (!f.nivelRiesgo) return max;
    const r = riesgoRank[f.nivelRiesgo] ?? 0;
    return r > max ? r : max;
  }, 0);

  const maxLabel = maxRiesgo >= 0
    ? getLabelRiesgo((Object.entries(riesgoRank).find(([, v]) => v === maxRiesgo)?.[0] || 'sin-riesgo') as any)
    : 'Desconocido';

  const maxColor = maxRiesgo >= 0
    ? getColoresRiesgo((Object.entries(riesgoRank).find(([, v]) => v === maxRiesgo)?.[0] || 'sin-riesgo') as any)
    : null;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>⚖️</span>
          Comparativa de fuentes oficiales
        </h3>
        {maxColor && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${maxColor.bg} text-white`}>
            Consenso: {maxLabel}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-2 text-slate-400 font-medium">Fuente</th>
              <th className="text-left py-3 px-2 text-slate-400 font-medium">País</th>
              <th className="text-left py-3 px-2 text-slate-400 font-medium">Nivel de riesgo</th>
              <th className="text-left py-3 px-2 text-slate-400 font-medium">Actualizado</th>
              <th className="text-left py-3 px-2 text-slate-400 font-medium">Enlace</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f) => {
              const colores = f.nivelRiesgo ? getColoresRiesgo(f.nivelRiesgo) : null;
              const label = f.nivelRiesgo ? getLabelRiesgo(f.nivelRiesgo) : 'No disponible';
              return (
                <tr key={f.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{f.bandera}</span>
                      <span className="text-white font-medium">{f.siglas}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-slate-300">{f.pais}</td>
                  <td className="py-3 px-2">
                    {colores ? (
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${colores.bg}`} />
                        <span className={`font-medium ${colores.text}`}>{label}</span>
                        {f.nivelOriginal && (
                          <span className="text-slate-500 text-xs ml-1">({f.nivelOriginal})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">No disponible</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-slate-400 text-xs">
                    {f.actualizado || '—'}
                  </td>
                  <td className="py-3 px-2">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs underline"
                    >
                      {f.siglas === 'MAEC' ? 'Ver en MAEC' :
                       f.siglas === 'US State Dept' ? 'Ver en USDOS' :
                       f.siglas === 'UK FCDO' ? 'Ver en GOV.UK' :
                       f.siglas === 'Canadá' ? 'Ver en Canada.ca' :
                       f.siglas === 'Australia' ? 'Ver en Smartraveller' :
                       'Abrir'}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-4 leading-relaxed">
        Los datos de MAEC provienen de recomendaciones oficiales españolas.
        Los datos de US State Dept se obtienen mediante scraping automatizado.
        Los datos de UK FCDO, Canadá y Australia son aproximados y pueden no reflejar cambios recientes.
        Verifica siempre la fuente oficial antes de viajar.
      </p>
    </div>
  );
}
