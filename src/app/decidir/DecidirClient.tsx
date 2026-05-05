'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Plane, Sun, Mountain, Landmark, UtensilsCrossed, Waves, Tent, Music, Loader2, ExternalLink, MapPin, Shield } from 'lucide-react';
import { getTodosLosPaises } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';

const INTERESES = [
  { id: 'playa', label: 'Playa', icon: <Waves className="w-6 h-6" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20' },
  { id: 'montaña', label: 'Montaña', icon: <Mountain className="w-6 h-6" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' },
  { id: 'cultura', label: 'Cultura', icon: <Landmark className="w-6 h-6" />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20' },
  { id: 'gastronomia', label: 'Gastronomía', icon: <UtensilsCrossed className="w-6 h-6" />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' },
  { id: 'aventura', label: 'Aventura', icon: <Tent className="w-6 h-6" />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20' },
  { id: 'fiesta', label: 'Fiesta', icon: <Music className="w-6 h-6" />, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20' },
];

const PAISES_INTERESES: Record<string, string[]> = {
  playa: ['es', 'pt', 'gr', 'it', 'hr', 'th', 'mx', 'co', 'cr', 'do', 'mv', 'fj', 'jp', 'br', 'ma', 'eg', 'tn'],
  montaña: ['ch', 'at', 'np', 'pe', 'co', 'ar', 'cl', 'fr', 'it', 'es', 'no', 'is', 'ge', 'uz', 'kg'],
  cultura: ['es', 'it', 'fr', 'gr', 'jp', 'in', 'eg', 'mx', 'pe', 'bo', 'ir', 'tr', 'ma', 'th', 'kh', 'mm'],
  gastronomia: ['es', 'it', 'fr', 'jp', 'th', 'mx', 'pe', 'co', 'in', 'vn', 'kr', 'tw', 'pt', 'gr', 'tr', 'ma'],
  aventura: ['np', 'pe', 'cl', 'ar', 'co', 'cr', 'tz', 'ke', 'na', 'is', 'no', 'nz', 'fj', 'bo', 'ec', 'et'],
  fiesta: ['es', 'br', 'mx', 'co', 'ar', 'th', 'de', 'nl', 'gb', 'us', 'do', 'pr', 'hr', 'pt', 'gr'],
};

const PAISES_SEGUROS: string[] = ['es', 'pt', 'fr', 'it', 'de', 'at', 'nl', 'be', 'dk', 'fi', 'no', 'se', 'ie', 'ch', 'jp', 'sg', 'au', 'nz', 'cr', 'cl', 'ur', 'ar', 'hr', 'si', 'cz', 'is'];

export default function DecidirClient() {
  const [selectedIntereses, setSelectedIntereses] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [animating, setAnimating] = useState(false);

  const toggleInteres = (id: string) => {
    setSelectedIntereses(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const results = useMemo(() => {
    if (selectedIntereses.length === 0) return [];

    const allPaises = getTodosLosPaises().filter(p => p.visible !== false && p.codigo !== 'cu');

    const scored = allPaises.map(pais => {
      let score = 0;
      const code = pais.codigo;

      if (PAISES_SEGUROS.includes(code)) score += 20;

      if (pais.nivelRiesgo === 'alto') score -= 30;
      else if (pais.nivelRiesgo === 'muy-alto') score -= 50;
      else if (pais.nivelRiesgo === 'medio') score -= 10;

      selectedIntereses.forEach(interes => {
        const matchingPaises = PAISES_INTERESES[interes] || [];
        if (matchingPaises.includes(code)) score += 25;
      });

      const tci = calculateTCI(code);
      if (tci.tci < 90) score += 10;
      else if (tci.tci > 120) score -= 5;

      return { ...pais, score: Math.max(0, score), tci: tci.tci };
    });

    return scored
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [selectedIntereses]);

  const handleDecidir = () => {
    if (selectedIntereses.length === 0) return;
    setAnimating(true);
    setShowResults(false);
    setTimeout(() => {
      setShowResults(true);
      setAnimating(false);
    }, 1200);
  };

  const handleReset = () => {
    setSelectedIntereses([]);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Decide en 30 seg</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {!showResults ? (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-3">
                ¿A dónde viajas?
              </h1>
              <p className="text-slate-400 text-lg">
                Elige qué te apetece y te sugerimos los mejores destinos seguros
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {INTERESES.map(interes => {
                const isActive = selectedIntereses.includes(interes.id);
                return (
                  <button
                    key={interes.id}
                    onClick={() => toggleInteres(interes.id)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      isActive
                        ? `${interes.bg} border-current scale-105 shadow-lg`
                        : 'border-slate-700/50 bg-slate-800/30 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className={isActive ? interes.color : ''}>{interes.icon}</span>
                    <span className="text-sm font-medium">{interes.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleDecidir}
              disabled={selectedIntereses.length === 0 || animating}
              className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all ${
                selectedIntereses.length === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : animating
                  ? 'bg-purple-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/25'
              }`}
            >
              {animating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analizando destinos...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Decidir destino
                </span>
              )}
            </button>

            {selectedIntereses.length > 0 && !animating && (
              <p className="text-slate-500 text-sm mt-4">
                {selectedIntereses.length} {selectedIntereses.length === 1 ? 'interés seleccionado' : 'intereses seleccionados'}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Tu destino ideal
              </h2>
              <p className="text-slate-400">
                Basado en: {selectedIntereses.map(i => INTERESES.find(e => e.id === i)?.label).join(', ')}
              </p>
              <button onClick={handleReset} className="mt-3 text-purple-400 text-sm hover:underline">
                Cambiar preferencias →
              </button>
            </div>

            <div className="grid gap-4">
              {results.map((pais, i) => (
                <Link
                  key={pais.codigo}
                  href={`/pais/${pais.codigo}`}
                  className="group flex items-center gap-4 p-5 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all"
                >
                  <div className={`text-2xl font-bold w-10 h-10 rounded-xl flex items-center justify-center ${
                    i === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white' :
                    i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white' :
                    i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-3xl">{pais.bandera}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">{pais.nombre}</h3>
                    <p className="text-slate-400 text-sm">{pais.capital}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Shield className="w-3 h-3" />
                        <span>{pais.nivelRiesgo === 'sin-riesgo' ? 'Sin riesgo' : pais.nivelRiesgo === 'bajo' ? 'Bajo' : pais.nivelRiesgo === 'medio' ? 'Medio' : 'Alto'}</span>
                      </div>
                      <div className="text-xs text-slate-500">TCI: {pais.tci}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
