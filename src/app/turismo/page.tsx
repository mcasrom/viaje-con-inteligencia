'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Globe, TrendingUp, Calendar, DollarSign, Clock, ArrowLeft, Eye, Filter } from 'lucide-react';
import { tourismData, getTourismStats } from '@/data/tourism';

const countries = Object.entries(tourismData).sort((a, b) => b[1].arrivals - a[1].arrivals);

export default function TurismoPage() {
  const [sortBy, setSortBy] = useState<'arrivals' | 'spend' | 'stay'>('arrivals');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const sorted = [...countries].sort((a, b) => {
    if (sortBy === 'arrivals') return b[1].arrivals - a[1].arrivals;
    if (sortBy === 'spend') return (b[1].spendPerDay || 0) - (a[1].spendPerDay || 0);
    if (sortBy === 'stay') return (b[1].avgStay || 0) - (a[1].avgStay || 0);
    return 0;
  });

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  const formatMoney = (n?: number): string => {
    if (!n) return 'N/A';
    if (n >= 1000000000) return `$${(n / 1000000000).toFixed(1)}B`;
    if (n >= 1000000) return `$${(n / 1000000).toFixed(0)}M`;
    return `$${n}`;
  };

  const getFlag = (code: string): string => {
    const flags: Record<string, string> = {
      FR: '🇫🇷', ES: '🇪🇸', US: '🇺🇸', TR: '🇹🇷', IT: '🇮🇹',
      MX: '🇲🇽', GB: '🇬🇧', JP: '🇯🇵', DE: '🇩🇪', GR: '🇬🇷',
      TH: '🇹🇭', CN: '🇨🇳', AT: '🇦🇹', PT: '🇵🇹', NL: '🇳🇱',
      CA: '🇨🇦', PL: '🇵🇱', HR: '🇭🇷', SE: '🇸🇪', CH: '🇨🇭',
    };
    return flags[code] || '🌍';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Turismo UNWTO</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Top 20 Destinos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Turísticos</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Datos de la Organización Mundial del Turismo (OMT/UNWTO). Comparativa de llegadas, gasto diario, estancia media y temporada.
          </p>
          <p className="text-cyan-400 text-sm mt-3 flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Datos 2024 • Fuente: UNWTO
          </p>
        </div>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Ordenar:</span>
            {[
              { key: 'arrivals', label: 'Llegadas' },
              { key: 'spend', label: 'Gasto/día' },
              { key: 'stay', label: 'Estancia' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key as typeof sortBy)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  sortBy === opt.key
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{countries.length} países</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">País</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">
                  <TrendingUp className="w-4 h-4 inline" /> Llegadas
                </th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">
                  <DollarSign className="w-4 h-4 inline" /> Ingresos
                </th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">
                  <DollarSign className="w-4 h-4 inline" /> Gasto/día
                </th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">
                  <Clock className="w-4 h-4 inline" /> Estancia
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  <Calendar className="w-4 h-4 inline" /> Temporada
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(([code, data], idx) => (
                <tr key={code} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <Link href={`/pais/${code}`} className="flex items-center gap-2 text-white hover:text-cyan-400">
                      <span className="text-2xl">{getFlag(code)}</span>
                      <span>{code}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right text-white font-medium">
                    {formatNumber(data.arrivals)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400">
                    {formatMoney(data.receipts)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded ${
                      (data.spendPerDay || 0) > 100 ? 'bg-purple-500/20 text-purple-400' :
                      (data.spendPerDay || 0) > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      ${data.spendPerDay || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    {data.avgStay ? `${data.avgStay} noches` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {data.season || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-slate-500 text-xs mt-8 text-center">
          Fuente: UNWTO World Tourism Barometer 2024 • Datos aproximados para fines informativos
        </p>
      </main>
    </div>
  );
}