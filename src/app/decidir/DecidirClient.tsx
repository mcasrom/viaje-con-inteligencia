'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Plane, Sun, Mountain, Landmark, UtensilsCrossed, Waves, Tent, Music, Loader2, ExternalLink, MapPin, Shield, ChevronRight, Star, DollarSign, Calendar, Target, Filter, Zap, Check, X } from 'lucide-react';
import { getTodosLosPaises, paisesData } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';

// ============================================================
// STEP 1: CONTEXT CHIPS — interests + budget + safety + season
// ============================================================
const INTERESES = [
  { id: 'playa', label: 'Playa', icon: <Waves className="w-5 h-5" /> },
  { id: 'montaña', label: 'Montaña', icon: <Mountain className="w-5 h-5" /> },
  { id: 'cultura', label: 'Cultura', icon: <Landmark className="w-5 h-5" /> },
  { id: 'gastronomia', label: 'Gastronomía', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { id: 'aventura', label: 'Aventura', icon: <Tent className="w-5 h-5" /> },
  { id: 'fiesta', label: 'Fiesta', icon: <Music className="w-5 h-5" /> },
  { id: 'relax', label: 'Relax', icon: <Sun className="w-5 h-5" /> },
  { id: 'naturaleza', label: 'Naturaleza', icon: <Target className="w-5 h-5" /> },
];

const PAISES_INTERESES: Record<string, string[]> = {
  playa: ['es', 'pt', 'gr', 'it', 'hr', 'th', 'mx', 'co', 'cr', 'do', 'mv', 'fj', 'jp', 'br', 'ma', 'eg', 'tn', 'cy', 'mt', 'al'],
  montaña: ['ch', 'at', 'np', 'pe', 'co', 'ar', 'cl', 'fr', 'it', 'es', 'no', 'is', 'ge', 'uz', 'kg', 'ro', 'bg'],
  cultura: ['es', 'it', 'fr', 'gr', 'jp', 'in', 'eg', 'mx', 'pe', 'bo', 'ir', 'tr', 'ma', 'th', 'kh', 'mm', 'uz', 'uz'],
  gastronomia: ['es', 'it', 'fr', 'jp', 'th', 'mx', 'pe', 'co', 'in', 'vn', 'kr', 'tw', 'pt', 'gr', 'tr', 'ma', 'ar', 'br'],
  aventura: ['np', 'pe', 'cl', 'ar', 'co', 'cr', 'tz', 'ke', 'na', 'is', 'no', 'nz', 'fj', 'bo', 'ec', 'et', 'za'],
  fiesta: ['es', 'br', 'mx', 'co', 'ar', 'th', 'de', 'nl', 'gb', 'us', 'do', 'pr', 'hr', 'pt', 'gr', 'ie'],
  relax: ['mv', 'fj', 'mu', 'sc', 'cr', 'bali', 'th', 'gr', 'pt', 'es', 'cy', 'mt'],
  naturaleza: ['cr', 'nz', 'is', 'no', 'ke', 'tz', 'ec', 'cl', 'pe', 'au', 'ca', 'jp', 'za', 'bw'],
};

const PAISES_SEGUROS: string[] = ['es', 'pt', 'fr', 'it', 'de', 'at', 'nl', 'be', 'dk', 'fi', 'no', 'se', 'ie', 'ch', 'jp', 'sg', 'au', 'nz', 'cr', 'cl', 'ur', 'ar', 'hr', 'si', 'cz', 'is'];

interface Destination {
  codigo: string;
  nombre: string;
  bandera: string;
  capital: string;
  nivelRiesgo: string;
  score: number;
  tci: number;
  irv: string;
  matchReasons: string[];
  dailyCost: string;
  visa: string;
}

// Quick prompt chips for semantic-like search
const QUICK_PROMPTS = [
  { label: '🏖️ Playa barata sin visa', filters: { intereses: ['playa'], budget: 'economico', visa: 'no' } },
  { label: '🏔️ Aventura en Europa', filters: { intereses: ['aventura'], region: 'europa', budget: 'medio' } },
  { label: '🍜 Gastronomía y cultura', filters: { intereses: ['gastronomia', 'cultura'], budget: 'medio' } },
  { label: '🌴 Relax todo incluido', filters: { intereses: ['relax', 'playa'], budget: 'premium' } },
  { label: '🎉 Fiesta y vida nocturna', filters: { intereses: ['fiesta'], budget: 'economico' } },
  { label: '🦁 Safari y naturaleza', filters: { intereses: ['naturaleza', 'aventura'], region: 'africa' } },
];

const REGION_MAP: Record<string, string> = {
  es: 'europa', pt: 'europa', fr: 'europa', it: 'europa', de: 'europa', at: 'europa', nl: 'europa', be: 'europa',
  dk: 'europa', fi: 'europa', no: 'europa', se: 'europa', ie: 'europa', ch: 'europa', gr: 'europa', hr: 'europa',
  si: 'europa', cz: 'europa', is: 'europa', cy: 'europa', mt: 'europa', al: 'europa', ro: 'europa', bg: 'europa',
  jp: 'asia', th: 'asia', in: 'asia', kh: 'asia', kr: 'asia', tw: 'asia', vn: 'asia', mm: 'asia', sg: 'asia',
  mx: 'latam', co: 'latam', pe: 'latam', bo: 'latam', cr: 'latam', ar: 'latam', cl: 'latam', br: 'latam', ec: 'latam', do: 'latam',
  ma: 'africa', eg: 'africa', tn: 'africa', ke: 'africa', tz: 'africa', na: 'africa', et: 'africa', za: 'africa', bw: 'africa',
  au: 'oceania', nz: 'oceania', fj: 'oceania', mu: 'oceania', sc: 'oceania',
  us: 'norteamerica', ca: 'norteamerica', gb: 'europa', tr: 'asia', ir: 'asia', ge: 'asia', uz: 'asia', kg: 'asia', np: 'asia',
};

const VISA_MAP: Record<string, string> = {
  es: 'no', pt: 'no', fr: 'no', it: 'no', de: 'no', at: 'no', nl: 'no', be: 'no', dk: 'no', fi: 'no',
  no: 'no', se: 'no', ie: 'no', ch: 'no', gr: 'no', hr: 'no', si: 'no', cz: 'no', is: 'no', cy: 'no', mt: 'no',
  al: 'no', ro: 'no', bg: 'no', mx: 'no', co: 'no', pe: 'no', bo: 'no', ar: 'no', cl: 'no', br: 'no', ec: 'no',
  do: 'no', cr: 'no', jp: 'no', kr: 'no', th: 'no', ma: 'no', tn: 'no',
  us: 'si', in: 'si', eg: 'si', vn: 'si', kh: 'si', et: 'si', ke: 'si', tz: 'si', na: 'si', za: 'si', bw: 'si',
  au: 'si', nz: 'si', cn: 'si', tr: 'si', ru: 'si', ir: 'si', mm: 'si',
  sg: 'no', tw: 'si', ge: 'no', uz: 'si', kg: 'no',
};

const COST_MAP: Record<string, string> = {
  es: 'medio', pt: 'economico', fr: 'alto', it: 'medio', de: 'alto', at: 'alto', nl: 'alto', be: 'alto',
  dk: 'alto', fi: 'alto', no: 'alto', se: 'alto', ie: 'alto', ch: 'alto', gr: 'medio', hr: 'medio',
  si: 'medio', cz: 'economico', is: 'alto', cy: 'medio', mt: 'medio', al: 'economico', ro: 'economico', bg: 'economico',
  jp: 'alto', th: 'economico', in: 'economico', kh: 'economico', kr: 'medio', tw: 'medio', vn: 'economico',
  mx: 'economico', co: 'economico', pe: 'economico', bo: 'economico', ar: 'economico', cl: 'medio', br: 'economico',
  ec: 'economico', do: 'economico', cr: 'medio', ma: 'economico', eg: 'economico', tn: 'economico',
  us: 'alto', ca: 'alto', gb: 'alto', tr: 'economico', ge: 'economico', uz: 'economico',
  ke: 'medio', tz: 'medio', na: 'medio', et: 'economico', za: 'medio', bw: 'medio',
  au: 'alto', nz: 'medio', fj: 'alto', mu: 'medio', sc: 'alto', np: 'economico', mm: 'economico',
  sg: 'alto', ir: 'economico',
};

export default function DecidirClient() {
  const [step, setStep] = useState<'chips' | 'results' | 'compare'>('chips');
  const [selectedIntereses, setSelectedIntereses] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>('');
  const [visaOnly, setVisaOnly] = useState(false);
  const [region, setRegion] = useState<string>('');
  const [compare, setCompare] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedPrompt, setAppliedPrompt] = useState<string | null>(null);

  const toggleInteres = (id: string) => {
    setSelectedIntereses(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const applyPrompt = (prompt: typeof QUICK_PROMPTS[0]) => {
    setAppliedPrompt(prompt.label);
    setSelectedIntereses(prompt.filters.intereses || []);
    setBudget(prompt.filters.budget || '');
    setVisaOnly(prompt.filters.visa === 'no');
    setRegion(prompt.filters.region || '');
  };

  const results: Destination[] = useMemo(() => {
    const hasFilters = selectedIntereses.length > 0 || budget || visaOnly || region;
    if (!hasFilters) return [];

    const allPaises = getTodosLosPaises().filter(p => p.visible !== false && p.codigo !== 'cu');

    const scored = allPaises.map(pais => {
      let score = 0;
      const code = pais.codigo;
      const reasons: string[] = [];

      // Interest matching
      if (selectedIntereses.length > 0) {
        selectedIntereses.forEach(interes => {
          const matching = PAISES_INTERESES[interes] || [];
          if (matching.includes(code)) {
            score += 25;
            reasons.push(interes);
          }
        });
      } else {
        score += 10; // no filter = baseline
      }

      // Budget filter
      if (budget) {
        const cost = COST_MAP[code];
        if (budget === 'economico') {
          if (cost === 'economico') score += 20;
          else if (cost === 'alto') score -= 30;
          else score += 5;
        } else if (budget === 'medio') {
          if (cost === 'economico' || cost === 'medio') score += 15;
          else if (cost === 'alto') score -= 10;
        } else if (budget === 'premium') {
          if (cost === 'alto') score += 20;
          else score -= 5;
        }
      }

      // Visa filter
      if (visaOnly) {
        const visa = VISA_MAP[code];
        if (visa === 'no') score += 25;
        else score -= 40;
      }

      // Region filter
      if (region) {
        const paisRegion = REGION_MAP[code];
        if (paisRegion === region) score += 20;
        else score -= 30;
      }

      // Risk penalty
      if (PAISES_SEGUROS.includes(code)) score += 15;
      if (pais.nivelRiesgo === 'alto') score -= 25;
      else if (pais.nivelRiesgo === 'muy-alto') score -= 50;
      else if (pais.nivelRiesgo === 'medio') score -= 5;

      // TCI bonus
      const tci = calculateTCI(code);
      if (tci.tci < 90) score += 8;
      else if (tci.tci > 120) score -= 5;

      const finalScore = Math.max(0, score);
      const irvLabel = finalScore >= 80 ? 'Excelente' : finalScore >= 60 ? 'Muy bueno' : finalScore >= 40 ? 'Bueno' : finalScore >= 20 ? 'Regular' : 'Bajo';

      const costLabel = COST_MAP[code] === 'economico' ? '~30€/día' : COST_MAP[code] === 'medio' ? '~60€/día' : COST_MAP[code] === 'alto' ? '~120€/día' : '';
      const visaLabel = VISA_MAP[code] === 'no' ? 'Sin visa' : 'Visa requerida';

      return {
        ...pais,
        score: finalScore,
        tci: tci.tci,
        irv: irvLabel,
        matchReasons: reasons,
        dailyCost: costLabel,
        visa: visaLabel,
      };
    });

    return scored
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [selectedIntereses, budget, visaOnly, region]);

  const handleBuscar = () => {
    if (selectedIntereses.length === 0 && !budget && !visaOnly && !region) return;
    setLoading(true);
    setTimeout(() => {
      setStep('results');
      setLoading(false);
    }, 800);
  };

  const toggleCompare = (d: Destination) => {
    setCompare(prev => {
      const exists = prev.find(p => p.codigo === d.codigo);
      if (exists) return prev.filter(p => p.codigo !== d.codigo);
      if (prev.length >= 3) return [...prev.slice(1), d];
      return [...prev, d];
    });
  };

  const handleReset = () => {
    setSelectedIntereses([]);
    setBudget('');
    setVisaOnly(false);
    setRegion('');
    setAppliedPrompt(null);
    setCompare([]);
    setStep('chips');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-400 text-xs font-medium">Decide en 30s</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {step === 'chips' && (
          <div>
            {/* Hero */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Encuentra tu destino ideal
              </h1>
              <p className="text-slate-400">Combina filtros o elige un atajo. Sin registro, sin spam.</p>
            </div>

            {/* Quick prompts */}
            <div className="mb-8">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Atajos rápidos</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => applyPrompt(prompt)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                      appliedPrompt === prompt.label
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Interests */}
            <div className="mb-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">¿Qué te apetece?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {INTERESES.map(interes => {
                  const isActive = selectedIntereses.includes(interes.id);
                  return (
                    <button
                      key={interes.id}
                      onClick={() => toggleInteres(interes.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm ${
                        isActive
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      {interes.icon}
                      <span>{interes.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Budget */}
            <div className="mb-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Presupuesto diario</p>
              <div className="flex gap-2">
                {[
                  { id: 'economico', label: '~30€/día', icon: <DollarSign className="w-4 h-4" /> },
                  { id: 'medio', label: '~60€/día', icon: <DollarSign className="w-4 h-4" /> },
                  { id: 'premium', label: '~120€/día', icon: <DollarSign className="w-4 h-4" /> },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setBudget(budget === opt.id ? '' : opt.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm ${
                      budget === opt.id
                        ? 'bg-green-500/15 text-green-300 border-green-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Extras */}
            <div className="mb-8 flex flex-wrap gap-3">
              <button
                onClick={() => setVisaOnly(!visaOnly)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm ${
                  visaOnly
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                }`}
              >
                <Plane className="w-4 h-4" />
                <span>Solo sin visa</span>
                {visaOnly && <Check className="w-3.5 h-3.5" />}
              </button>
              <div className="flex gap-2">
                {[
                  { id: 'europa', label: '🇪🇺' },
                  { id: 'latam', label: '🌎' },
                  { id: 'asia', label: '🌏' },
                  { id: 'africa', label: '🌍' },
                  { id: 'oceania', label: '🏝️' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRegion(region === r.id ? '' : r.id)}
                    className={`px-3 py-3 rounded-xl border transition-all text-lg ${
                      region === r.id
                        ? 'bg-amber-500/15 border-amber-500/40'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={handleBuscar}
                disabled={(!selectedIntereses.length && !budget && !visaOnly && !region) || loading}
                className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all inline-flex items-center gap-2 ${
                  (!selectedIntereses.length && !budget && !visaOnly && !region)
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : loading
                    ? 'bg-purple-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/25'
                }`}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Buscando...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Buscar destinos</>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {results.length} destinos encontrados
                </h2>
                <p className="text-slate-400 text-sm">
                  {[...selectedIntereses.map(i => INTERESES.find(e => e.id === i)?.label).filter(Boolean), budget, visaOnly ? 'Sin visa' : null, region].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button onClick={handleReset} className="text-purple-400 text-sm hover:underline flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Refinar
              </button>
            </div>

            {/* Results */}
            <div className="grid gap-3">
              {results.map((dest, i) => (
                <div key={dest.codigo} className="group bg-slate-900 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {/* Rank */}
                    <div className={`text-sm font-bold w-8 h-8 rounded-lg flex items-center justify-center ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-slate-500/20 text-slate-400' :
                      i === 2 ? 'bg-amber-800/20 text-amber-600' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {i + 1}
                    </div>

                    {/* Flag + Name */}
                    <span className="text-2xl">{dest.bandera}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold">{dest.nombre}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {dest.matchReasons.slice(0, 3).map(r => (
                          <span key={r} className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded font-medium">{r}</span>
                        ))}
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">{dest.dailyCost}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] rounded ${dest.visa === 'Sin visa' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-500'}`}>{dest.visa}</span>
                      </div>
                    </div>

                    {/* IRV Score */}
                    <div className="text-right hidden sm:block">
                      <div className={`text-sm font-bold ${
                        dest.irv === 'Excelente' ? 'text-green-400' :
                        dest.irv === 'Muy bueno' ? 'text-blue-400' :
                        dest.irv === 'Bueno' ? 'text-yellow-400' :
                        'text-slate-400'
                      }`}>
                        {dest.irv}
                      </div>
                      <div className="text-[10px] text-slate-500">Score: {dest.score}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCompare(dest)}
                        className={`p-2 rounded-lg transition-all ${
                          compare.find(c => c.codigo === dest.codigo)
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-slate-800 text-slate-500 hover:text-white'
                        }`}
                        title="Añadir a comparar"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <Link href={`/pais/${dest.codigo}`} className="p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compare bar */}
            {compare.length >= 2 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-purple-500/30 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl z-50">
                <div className="flex items-center gap-2">
                  {compare.map(d => (
                    <span key={d.codigo} className="text-xl">{d.bandera}</span>
                  ))}
                </div>
                <span className="text-white text-sm font-medium">{compare.length} destinos</span>
                <Link
                  href={`/comparar?${compare.map(d => `p=${d.codigo}`).join('&')}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 transition-all"
                >
                  Comparar
                </Link>
                <button onClick={() => setCompare([])} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
