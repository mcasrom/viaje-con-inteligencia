import Link from 'next/link';
import { getTodosLosPaises } from '@/data/paises';
import { calculateTCI, getTCIForAllCountries } from '@/data/tci-engine';
import { ArrowLeft, Search, Shield, TrendingDown, TrendingUp, Minus, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Todos los Países — Riesgo MAEC, Coste TCI y Consejos de Viaje',
  description: 'Directorio completo de 108+ países con nivel de riesgo, índice de coste y recomendaciones de viaje.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/paises',
  },
};

function getRiesgoBadge(nivel: string) {
  const map: Record<string, { bg: string; label: string; emoji: string }> = {
    'sin-riesgo': { bg: 'bg-green-500/15 text-green-400 border-green-500/30', label: 'Sin riesgo', emoji: '🟢' },
    'bajo': { bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', label: 'Riesgo bajo', emoji: '🟡' },
    'medio': { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', label: 'Riesgo medio', emoji: '🟠' },
    'alto': { bg: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'Riesgo alto', emoji: '🔴' },
    'muy-alto': { bg: 'bg-red-900/30 text-red-400 border-red-800', label: 'Riesgo muy alto', emoji: '⛔' },
  };
  return map[nivel] || { bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30', label: nivel, emoji: '⚪' };
}

function getTCIColor(tci: number) {
  if (tci < 85) return 'text-emerald-400';
  if (tci < 95) return 'text-green-400';
  if (tci < 105) return 'text-amber-400';
  if (tci < 115) return 'text-orange-400';
  return 'text-rose-400';
}

function getTrendIcon(trend: string) {
  const t = trend.toLowerCase();
  if (t.includes('baj')) return <TrendingDown className="w-3 h-3 text-emerald-400" />;
  if (t.includes('alc') || t.includes('sub')) return <TrendingUp className="w-3 h-3 text-rose-400" />;
  return <Minus className="w-3 h-3 text-slate-400" />;
}

export default function PaisesPage() {
  const paises = getTodosLosPaises().filter(p => p.visible !== false && p.codigo !== 'cu');
  const tciMap: Record<string, number> = {};
  const trendMap: Record<string, string> = {};
  paises.forEach(p => {
    const tci = calculateTCI(p.codigo);
    tciMap[p.codigo] = tci.tci;
    trendMap[p.codigo] = tci.trend;
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">{paises.length} países</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Todos los Países
          </h1>
          <p className="text-slate-400">
            Directorio con nivel de riesgo MAEC, índice de coste TCI y recomendaciones de viaje
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paises.map(pais => {
            const riesgo = getRiesgoBadge(pais.nivelRiesgo);
            const tci = tciMap[pais.codigo];
            const trend = trendMap[pais.codigo];
            return (
              <Link
                key={pais.codigo}
                href={`/pais/${pais.codigo}`}
                className="group bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 hover:border-slate-600 hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{pais.bandera}</span>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">{pais.nombre}</h3>
                    <p className="text-slate-500 text-xs">{pais.capital}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${riesgo.bg}`}>
                    {riesgo.emoji} {riesgo.label}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className={`font-semibold ${getTCIColor(tci)}`}>{tci}</span>
                    {getTrendIcon(trend)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
