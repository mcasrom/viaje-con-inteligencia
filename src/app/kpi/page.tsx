'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, TrendingUp, TrendingDown, Minus, Globe, Shield, Plane, Award, Map, Info, Lock } from 'lucide-react';
import { GPI_DATA } from '@/data/indices';

const REGIONS = ['Todas', 'Europa', 'Asia', 'Norteamérica', 'Latinoamérica', 'África', 'Oceanía', 'Oriente Medio'];

function getPeaceLevel(score: number): { level: string; color: string; bg: string } {
  if (score < 1.5) return { level: 'Muy Alto', color: 'text-green-400', bg: 'bg-green-500' };
  if (score < 2.0) return { level: 'Alto', color: 'text-green-300', bg: 'bg-green-400' };
  if (score < 2.5) return { level: 'Medio', color: 'text-yellow-400', bg: 'bg-yellow-500' };
  if (score < 3.0) return { level: 'Bajo', color: 'text-orange-400', bg: 'bg-orange-500' };
  return { level: 'Muy Bajo', color: 'text-red-400', bg: 'bg-red-500' };
}

function getChangeIcon(change: number) {
  if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

function PeaceBar({ score }: { score: number }) {
  const maxScore = 3.5;
  const percentage = ((maxScore - score) / maxScore) * 100;
  const { bg } = getPeaceLevel(score);
  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${bg} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default function KPIPage() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('Todas');
  const [filteredData, setFilteredData] = useState(GPI_DATA);

  useEffect(() => {
    let data = GPI_DATA;
    if (search) {
      data = data.filter(p => 
        p.country.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (region !== 'Todas') {
      data = data.filter(p => p.region === region);
    }
    setFilteredData(data);
  }, [search, region]);

  const top5 = GPI_DATA.slice(0, 5);
  const bottom5 = GPI_DATA.slice(-5);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold">Índice de Paz Global</h1>
          </div>
          <p className="text-slate-400">Global Peace Index 2025 • Institute for Economics & Peace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">País más seguro</div>
            <div className="text-2xl font-bold text-green-400">{top5[0].country}</div>
            <div className="text-sm text-slate-500">#1 del ranking</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Mejor de Europa</div>
            <div className="text-2xl font-bold text-green-400">{top5[1].country}</div>
            <div className="text-sm text-slate-500">#2 del ranking</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">España</div>
            <div className="text-2xl font-bold text-green-300">#{GPI_DATA.find(p => p.code === 'ES')?.rank}</div>
            <div className="text-sm text-slate-500">Score: {GPI_DATA.find(p => p.code === 'ES')?.score}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Países GPI</div>
            <div className="text-2xl font-bold text-blue-400">{GPI_DATA.length}</div>
            <div className="text-sm text-slate-500">Global Peace Index 2025</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 mb-8 border border-green-500/30">
          <div className="flex items-start gap-4">
            <Award className="w-12 h-12 text-green-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold mb-2">🏆 Top 5 Países más Seguros</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {top5.map((pais, i) => (
                  <div key={pais.code} className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold mb-1">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
                    <div className="font-medium">{pais.country}</div>
                    <div className="text-sm text-slate-400">{pais.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {REGIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    region === r 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">País</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Región</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Nivel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Cambio</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((pais) => {
                  const { level, color, bg } = getPeaceLevel(pais.score);
                  return (
                    <tr key={pais.code} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium">{pais.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/pais/${pais.code.toLowerCase()}`} className="hover:text-blue-400">
                            {pais.country}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{pais.region}</td>
                      <td className="px-4 py-3 font-mono">{pais.score}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${bg} ${color}`}>
                          {level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getChangeIcon(pais.change)}
                          <span className={`text-sm ${pais.change > 0 ? 'text-green-400' : pais.change < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                            {pais.change > 0 ? `+${pais.change}` : pais.change}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/30 mb-8">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-2">⚠️ Países con menor puntuación</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {bottom5.map(pais => (
                  <div key={pais.code} className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="font-medium">{pais.country}</div>
                    <div className="text-sm text-red-400">#{pais.rank} • {pais.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Acerca del Índice de Paz Global
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            El Global Peace Index (GPI) es un informe anual que mide la paz en 163 países. 
            Elaborado por el Institute for Economics & Peace (IEP), analiza 23 indicadores 
            organizados en tres dominios: Seguridad y Sociedad, Conflicto Interno y Militarización.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>Fuente: IEP 2025</span>
            <span>•</span>
            <span>publicado.economicsandpeace.org</span>
          </div>
        </div>
      </div>
    </div>
  );
}