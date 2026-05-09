'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Plane, Sun, Mountain, Landmark, UtensilsCrossed, Waves, Tent, Music, Loader2, ExternalLink, MapPin, Shield, ChevronRight, Star, DollarSign, Calendar, Target, Filter, Zap, Check, X, Compass, Camera, Palette, Trees, BookOpen } from 'lucide-react';
import { getTodosLosPaises, paisesData } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';

// ============================================================
// INTERNATIONAL MODE DATA
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
  cultura: ['es', 'it', 'fr', 'gr', 'jp', 'in', 'eg', 'mx', 'pe', 'bo', 'ir', 'tr', 'ma', 'th', 'kh', 'mm', 'uz'],
  gastronomia: ['es', 'it', 'fr', 'jp', 'th', 'mx', 'pe', 'co', 'in', 'vn', 'kr', 'tw', 'pt', 'gr', 'tr', 'ma', 'ar', 'br'],
  aventura: ['np', 'pe', 'cl', 'ar', 'co', 'cr', 'tz', 'ke', 'na', 'is', 'no', 'nz', 'fj', 'bo', 'ec', 'et', 'za'],
  fiesta: ['es', 'br', 'mx', 'co', 'ar', 'th', 'de', 'nl', 'gb', 'us', 'do', 'pr', 'hr', 'pt', 'gr', 'ie'],
  relax: ['mv', 'fj', 'mu', 'sc', 'cr', 'th', 'gr', 'pt', 'es', 'cy', 'mt'],
  naturaleza: ['cr', 'nz', 'is', 'no', 'ke', 'tz', 'ec', 'cl', 'pe', 'au', 'ca', 'jp', 'za', 'bw'],
};

const PAISES_SEGUROS: string[] = ['es', 'pt', 'fr', 'it', 'de', 'at', 'nl', 'be', 'dk', 'fi', 'no', 'se', 'ie', 'ch', 'jp', 'sg', 'au', 'nz', 'cr', 'cl', 'ur', 'ar', 'hr', 'si', 'cz', 'is'];

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

// ============================================================
// SPAIN DOMESTIC MODE DATA
// ============================================================
interface SpainRegion {
  id: string;
  nombre: string;
  emoji: string;
  categorias: string[];
  descripcion: string;
  coste: 'economico' | 'medio' | 'alto';
  highlights: string[];
  mejorEpoca: string;
}

const ESPANA_REGIONES: SpainRegion[] = [
  { id: 'andalucia', nombre: 'Andalucía', emoji: '💃', categorias: ['playa', 'gastronomia', 'cultura', 'historia', 'arte', 'senderismo'], descripcion: 'Flamenco, tapas, Alhambra y playas de ensueño', coste: 'medio', highlights: ['Alhambra de Granada', 'Mezquita de Córdoba', 'Playas de Cádiz', 'Sierra Nevada'], mejorEpoca: 'Mar–May, Sep–Oct' },
  { id: 'cataluna', nombre: 'Cataluña', emoji: '🏛️', categorias: ['playa', 'gastronomia', 'cultura', 'historia', 'arte', 'ciudades'], descripcion: 'Gaudí, Costa Brava y gastronomía de vanguardia', coste: 'alto', highlights: ['Sagrada Familia', 'Costa Brava', 'Dalí en Figueres', 'Montserrat'], mejorEpoca: 'Abr–Jun, Sep–Oct' },
  { id: 'galicia', nombre: 'Galicia', emoji: '🌊', categorias: ['gastronomia', 'senderismo', 'cultura', 'historia', 'naturaleza'], descripcion: 'Mariscos, Camino de Santiago y rías mágicas', coste: 'economico', highlights: ['Camino de Santiago', 'Cabo Fisterra', 'Rías Baixas', 'Catedral de Santiago'], mejorEpoca: 'Jun–Sep' },
  { id: 'euskadi', nombre: 'País Vasco', emoji: '🍷', categorias: ['gastronomia', 'senderismo', 'arte', 'ciudades', 'cultura'], descripcion: 'Pintxos, Guggenheim y acantilados vertiginosos', coste: 'alto', highlights: ['Guggenheim Bilbao', 'San Juan de Gaztelugatxe', 'Pintxos en Donostia', 'San Sebastián'], mejorEpoca: 'May–Sep' },
  { id: 'asturias', nombre: 'Asturias', emoji: '🏔️', categorias: ['senderismo', 'naturaleza', 'gastronomia', 'cultura', 'relax'], descripcion: 'Picos de Europa, sidra y paraísos naturales', coste: 'economico', highlights: ['Picos de Europa', 'Playas de Asturias', 'Covadonga', 'Oviedo monumental'], mejorEpoca: 'Jun–Sep' },
  { id: 'cantabria', nombre: 'Cantabria', emoji: '🦴', categorias: ['senderismo', 'naturaleza', 'historia', 'relax', 'playa'], descripcion: 'Altamira, playas salvajes y montañas verdes', coste: 'economico', highlights: ['Cueva de Altamira', 'Santander', 'San Vicente de la Barquera', 'Picos de Europa'], mejorEpoca: 'Jun–Sep' },
  { id: 'castillaleon', nombre: 'Castilla y León', emoji: '⚔️', categorias: ['historia', 'cultura', 'gastronomia', 'ciudades', 'arte'], descripcion: 'Catedrales medievales, vinos y gastronomía castellana', coste: 'economico', highlights: ['Catedral de Burgos', 'Salamanca', 'Segovia', 'León'], mejorEpoca: 'Abr–Jun, Sep–Oct' },
  { id: 'madrid', nombre: 'Madrid', emoji: '🏙️', categorias: ['arte', 'cultura', 'gastronomia', 'ciudades', 'historia'], descripcion: 'Museos de clase mundial, tapas y vida nocturna', coste: 'alto', highlights: ['Museo del Prado', 'Retiro', 'Palacio Real', 'Barrio de Letras'], mejorEpoca: 'Todo el año' },
  { id: 'valencia', nombre: 'Comunidad Valenciana', emoji: '🍊', categorias: ['playa', 'gastronomia', 'cultura', 'ciudades', 'relax'], descripcion: 'Ciudad de las Artes, paella y playas doradas', coste: 'medio', highlights: ['Ciudad de las Artes', 'Playa de la Malvarrosa', 'Albufera', 'Paella valenciana'], mejorEpoca: 'Abr–Oct' },
  { id: 'canarias', nombre: 'Islas Canarias', emoji: '🌋', categorias: ['playa', 'senderismo', 'naturaleza', 'relax', 'buceo'], descripcion: 'Volcanes, playas volcánicas y clima eterno', coste: 'medio', highlights: ['Teide (Tenerife)', 'Timanfaya (Lanzarote)', 'Dunas de Maspalomas', 'Buceo en Lanzarote'], mejorEpoca: 'Todo el año' },
  { id: 'baleares', nombre: 'Islas Baleares', emoji: '⛵', categorias: ['playa', 'relax', 'buceo', 'gastronomia', 'senderismo'], descripcion: 'Calas cristalinas, gastronomía balear y patrimonio', coste: 'alto', highlights: ['Calas de Mallorca', 'Serra de Tramuntana', 'Dalt Vila (Ibiza)', 'Ciudadela (Menorca)'], mejorEpoca: 'May–Oct' },
  { id: 'aragon', nombre: 'Aragón', emoji: '🏰', categorias: ['senderismo', 'historia', 'naturaleza', 'cultura'], descripcion: 'Pirineos, Monasterios y arte mudéjar', coste: 'economico', highlights: ['Ordesa', 'Basílica del Pilar', 'Aljafería', 'Monasterio de Piedra'], mejorEpoca: 'Jun–Sep' },
  { id: 'castillalamancha', nombre: 'Castilla-La Mancha', emoji: '🌾', categorias: ['historia', 'cultura', 'gastronomia', 'senderismo', 'relax'], descripcion: 'Don Quijote, vinos y molinos de viento', coste: 'economico', highlights: ['Toledo', 'Almagro', 'Ruta de Don Quijote', 'Cuenca'], mejorEpoca: 'Abr–Jun, Sep–Oct' },
  { id: 'murcia', nombre: 'Región de Murcia', emoji: '☀️', categorias: ['playa', 'gastronomia', 'relax', 'historia', 'buceo'], descripcion: 'La Costa Cálida, Mar Menor y gastronomía murciana', coste: 'economico', highlights: ['Mar Menor', 'Cartagena romana', 'Calas del Cabo de Palos', 'Cabo Cope'], mejorEpoca: 'Abr–Oct' },
  { id: 'extremadura', nombre: 'Extremadura', emoji: '🌿', categorias: ['historia', 'senderismo', 'naturaleza', 'gastronomia', 'cultura'], descripcion: 'Mérida romana, dehesas y gastronomía extremeña', coste: 'economico', highlights: ['Mérida romana', 'Cáceres monumental', 'Monfragüe', 'Trujillo'], mejorEpoca: 'Mar–Jun, Sep–Oct' },
  { id: 'navarra', nombre: 'Navarra', emoji: '🏃', categorias: ['gastronomia', 'senderismo', 'historia', 'cultura'], descripcion: 'San Fermín, vinos de Rioja y Pirineos navarros', coste: 'medio', highlights: ['San Fermín', 'Bardenas Reales', 'Selva de Irati', 'Olite'], mejorEpoca: 'May–Oct' },
  { id: 'rioja', nombre: 'La Rioja', emoji: '🍇', categorias: ['gastronomia', 'cultura', 'historia', 'senderismo', 'relax'], descripcion: 'Capital del vino, enoturismo y gastronomía riojana', coste: 'medio', highlights: ['Bodegas de Haro', 'Santo Domingo de la Calzada', 'San Millán de la Cogolla', 'Camino del Vino'], mejorEpoca: 'May–Oct' },
  { id: 'levante', nombre: 'Costa Blanca', emoji: '🏖️', categorias: ['playa', 'relax', 'buceo', 'gastronomia'], descripcion: 'Sol, playas de arena y gastronomía levantina', coste: 'medio', highlights: ['Benidorm', 'Alicante', 'Peñón de Ifach', 'Tabarca'], mejorEpoca: 'Abr–Oct' },
  { id: 'costadeluz', nombre: 'Costa de la Luz', emoji: '🌅', categorias: ['playa', 'buceo', 'relax', 'gastronomia'], descripcion: 'Playas infinitas, viento y mariscos frescos', coste: 'medio', highlights: ['Playa de Bolonia', 'Caños de Meca', 'Tarifa', 'Cádiz'], mejorEpoca: 'Jun–Sep' },
  { id: 'pirineos', nombre: 'Pirineos', emoji: '⛰️', categorias: ['senderismo', 'aventura', 'naturaleza', 'relax'], descripcion: 'Valles pirenaicos, estaciones de esquí y lagos', coste: 'medio', highlights: ['Valle de Benasque', 'Aigüestortes', 'Ordesa', 'Cerro del Sol'], mejorEpoca: 'Jun–Sep' },
];

const ESPANA_PROMPTS = [
  { label: '☀️ Sol y playa barato', filters: { categorias: ['playa', 'relax'], coste: 'economico' } },
  { label: '🍷 Gastronomía y vino', filters: { categorias: ['gastronomia'], coste: 'medio' } },
  { label: '🏔️ Montaña y senderismo', filters: { categorias: ['senderismo', 'montaña'], coste: 'economico' } },
  { label: '🏛️ Ciudades históricas', filters: { categorias: ['historia', 'cultura', 'ciudades'] } },
  { label: '🎨 Arte y museos', filters: { categorias: ['arte', 'cultura', 'ciudades'], coste: 'alto' } },
  { label: '🤿 Buceo y relax', filters: { categorias: ['buceo', 'playa', 'relax'] } },
];

// ============================================================
// TYPES
// ============================================================
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
  // Spain mode
  highlights?: string[];
  mejorEpoca?: string;
  descripcion?: string;
}

interface SpainResult {
  region: SpainRegion;
  score: number;
  matchReasons: string[];
}

const CATEGORY_LABELS_ES: Record<string, string> = {
  playa: '🏖️ Playa', gastronomia: '🍽️ Gastronomía', montaña: '⛰️ Montaña',
  senderismo: '🥾 Senderismo', buceo: '🤿 Buceo', relax: '🧘 Relax',
  arte: '🎨 Arte', historia: '📜 Historia', cultura: '🏛️ Cultura',
  ciudades: '🏙️ Ciudades', naturaleza: '🌿 Naturaleza', aventura: '🏕️ Aventura',
};

// ============================================================
// COMPONENT
// ============================================================
export default function DecidirClient() {
  const [mode, setMode] = useState<'international' | 'espana'>('international');
  const [selectedIntereses, setSelectedIntereses] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>('');
  const [visaOnly, setVisaOnly] = useState(false);
  const [region, setRegion] = useState<string>('');
  const [compare, setCompare] = useState<Destination[]>([]);
  const [compareSpain, setCompareSpain] = useState<SpainResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedPrompt, setAppliedPrompt] = useState<string | null>(null);
  const [step, setStep] = useState<'chips' | 'results'>('chips');

  // --- INTERNATIONAL RESULTS ---
  const intResults: Destination[] = useMemo(() => {
    const hasFilters = selectedIntereses.length > 0 || budget || visaOnly || region;
    if (!hasFilters) return [];

    const allPaises = getTodosLosPaises().filter(p => p.visible !== false && p.codigo !== 'cu');

    const scored = allPaises.map(pais => {
      let score = 0;
      const code = pais.codigo;
      const reasons: string[] = [];

      if (selectedIntereses.length > 0) {
        selectedIntereses.forEach(interes => {
          const matching = PAISES_INTERESES[interes] || [];
          if (matching.includes(code)) { score += 25; reasons.push(interes); }
        });
      } else { score += 10; }

      if (budget) {
        const cost = COST_MAP[code];
        if (budget === 'economico') { cost === 'economico' ? score += 20 : cost === 'alto' ? score -= 30 : score += 5; }
        else if (budget === 'medio') { (cost === 'economico' || cost === 'medio') ? score += 15 : score -= 10; }
        else if (budget === 'premium') { cost === 'alto' ? score += 20 : score -= 5; }
      }

      if (visaOnly) { VISA_MAP[code] === 'no' ? score += 25 : score -= 40; }
      if (region) { REGION_MAP[code] === region ? score += 20 : score -= 30; }

      if (PAISES_SEGUROS.includes(code)) score += 15;
      if (pais.nivelRiesgo === 'alto') score -= 25;
      else if (pais.nivelRiesgo === 'muy-alto') score -= 50;
      else if (pais.nivelRiesgo === 'medio') score -= 5;

      const tci = calculateTCI(code);
      if (tci.tci < 90) score += 8;
      else if (tci.tci > 120) score -= 5;

      const finalScore = Math.max(0, score);
      const irvLabel = finalScore >= 80 ? 'Excelente' : finalScore >= 60 ? 'Muy bueno' : finalScore >= 40 ? 'Bueno' : finalScore >= 20 ? 'Regular' : 'Bajo';
      const costLabel = COST_MAP[code] === 'economico' ? '~30€/día' : COST_MAP[code] === 'medio' ? '~60€/día' : COST_MAP[code] === 'alto' ? '~120€/día' : '';

      return { ...pais, score: finalScore, tci: tci.tci, irv: irvLabel, matchReasons: reasons, dailyCost: costLabel, visa: VISA_MAP[code] === 'no' ? 'Sin visa' : 'Visa' };
    });

    return scored.filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
  }, [selectedIntereses, budget, visaOnly, region]);

  // --- SPAIN RESULTS ---
  const espResults: SpainResult[] = useMemo(() => {
    const hasFilters = selectedIntereses.length > 0 || budget;
    if (!hasFilters) return [];

    const scored = ESPANA_REGIONES.map(reg => {
      let score = 0;
      const reasons: string[] = [];

      if (selectedIntereses.length > 0) {
        selectedIntereses.forEach(cat => {
          if (reg.categorias.includes(cat)) { score += 30; reasons.push(cat); }
        });
      } else { score += 10; }

      if (budget) {
        if (budget === 'economico' && reg.coste === 'economico') score += 20;
        else if (budget === 'medio' && (reg.coste === 'economico' || reg.coste === 'medio')) score += 15;
        else if (budget === 'premium' && reg.coste === 'alto') score += 20;
      }

      const finalScore = Math.max(0, score);
      return { region: reg, score: finalScore, matchReasons: reasons };
    });

    return scored.filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
  }, [selectedIntereses, budget]);

  const toggleInteres = (id: string) => {
    setSelectedIntereses(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const applyPrompt = (prompt: any) => {
    setAppliedPrompt(prompt.label);
    setSelectedIntereses(prompt.filters.categorias || prompt.filters.intereses || []);
    setBudget(prompt.filters.budget || prompt.filters.coste || '');
    if (mode === 'international') {
      setVisaOnly(prompt.filters.visa === 'no');
      setRegion(prompt.filters.region || '');
    }
  };

  const handleBuscar = () => {
    if (selectedIntereses.length === 0 && !budget) return;
    setLoading(true);
    setTimeout(() => { setStep('results'); setLoading(false); }, 800);
  };

  const handleReset = () => {
    setSelectedIntereses([]);
    setBudget('');
    setVisaOnly(false);
    setRegion('');
    setAppliedPrompt(null);
    setCompare([]);
    setCompareSpain([]);
    setStep('chips');
  };

  const categories = mode === 'espana'
    ? [
        { id: 'playa', label: 'Playa', icon: <Waves className="w-5 h-5" /> },
        { id: 'gastronomia', label: 'Gastronomía', icon: <UtensilsCrossed className="w-5 h-5" /> },
        { id: 'montaña', label: 'Montaña', icon: <Mountain className="w-5 h-5" /> },
        { id: 'senderismo', label: 'Senderismo', icon: <Compass className="w-5 h-5" /> },
        { id: 'buceo', label: 'Buceo', icon: <Target className="w-5 h-5" /> },
        { id: 'arte', label: 'Arte', icon: <Palette className="w-5 h-5" /> },
        { id: 'historia', label: 'Historia', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'cultura', label: 'Cultura', icon: <Landmark className="w-5 h-5" /> },
        { id: 'ciudades', label: 'Ciudades', icon: <MapPin className="w-5 h-5" /> },
        { id: 'relax', label: 'Relax', icon: <Sun className="w-5 h-5" /> },
        { id: 'naturaleza', label: 'Naturaleza', icon: <Trees className="w-5 h-5" /> },
        { id: 'aventura', label: 'Aventura', icon: <Tent className="w-5 h-5" /> },
      ]
    : INTERESES;

  const prompts = mode === 'espana' ? ESPANA_PROMPTS : QUICK_PROMPTS;

  const activeResults = mode === 'espana' ? espResults : intResults;

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

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* MODE TOGGLE */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 rounded-xl p-1 border border-slate-800 inline-flex">
            <button
              onClick={() => { setMode('international'); handleReset(); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'international'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plane className="w-4 h-4" />
              Internacional
            </button>
            <button
              onClick={() => { setMode('espana'); handleReset(); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'espana'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇪🇸
              Turismo España
            </button>
          </div>
        </div>

        {step === 'chips' && (
          <div>
            {/* Hero */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {mode === 'international' ? 'Encuentra tu destino ideal' : 'Descubre España'}
              </h1>
              <p className="text-slate-400">
                {mode === 'international'
                  ? 'Combina filtros o elige un atajo. Sin registro, sin spam.'
                  : 'Playas, montaña, gastronomía, arte... ¿Qué te apetece esta vez?'}
              </p>
            </div>

            {/* Quick prompts */}
            <div className="mb-8">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Atajos rápidos</p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, i) => (
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

            {/* Categories */}
            <div className="mb-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                {mode === 'international' ? '¿Qué te apetece?' : '¿Qué buscas en España?'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map(cat => {
                  const isActive = selectedIntereses.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleInteres(cat.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm ${
                        isActive
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="mb-8">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Presupuesto diario</p>
              <div className="flex gap-2">
                {[
                  { id: 'economico', label: mode === 'espana' ? '~25€/día' : '~30€/día', icon: <DollarSign className="w-4 h-4" /> },
                  { id: 'medio', label: mode === 'espana' ? '~50€/día' : '~60€/día', icon: <DollarSign className="w-4 h-4" /> },
                  { id: 'premium', label: mode === 'espana' ? '~100€/día' : '~120€/día', icon: <DollarSign className="w-4 h-4" /> },
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

            {/* International extras */}
            {mode === 'international' && (
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
                    { id: 'latam', label: '💃' },
                    { id: 'asia', label: '🐉' },
                    { id: 'africa', label: '🦁' },
                    { id: 'oceania', label: '🏝️' },
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRegion(region === r.id ? '' : r.id)}
                      className={`px-3 py-3 rounded-xl border transition-all text-lg ${
                        region === r.id ? 'bg-amber-500/15 border-amber-500/40' : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={handleBuscar}
                disabled={(!selectedIntereses.length && !budget) || loading}
                className={`px-8 py-4 rounded-2xl text-lg font-semibold transition-all inline-flex items-center gap-2 ${
                  (!selectedIntereses.length && !budget)
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : loading
                    ? 'bg-purple-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/25'
                }`}
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Buscando...</> : <><Sparkles className="w-5 h-5" /> Buscar destinos</>}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === 'results' && mode === 'international' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{intResults.length} destinos encontrados</h2>
                <p className="text-slate-400 text-sm">{[...selectedIntereses.map(i => INTERESES.find(e => e.id === i)?.label).filter(Boolean), budget, visaOnly ? 'Sin visa' : null, region].filter(Boolean).join(' · ')}</p>
              </div>
              <button onClick={handleReset} className="text-purple-400 text-sm hover:underline flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Refinar</button>
            </div>

            <div className="grid gap-3">
              {intResults.map((dest, i) => (
                <div key={dest.codigo} className="group bg-slate-900 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <div className={`text-sm font-bold w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-400' : i === 2 ? 'bg-amber-800/20 text-amber-600' : 'bg-slate-800 text-slate-500'}`}>{i + 1}</div>
                    <span className="text-2xl">{dest.bandera}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold">{dest.nombre}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {dest.matchReasons.slice(0, 3).map(r => <span key={r} className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded font-medium">{r}</span>)}
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">{dest.dailyCost}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] rounded ${dest.visa === 'Sin visa' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-500'}`}>{dest.visa}</span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className={`text-sm font-bold ${dest.irv === 'Excelente' ? 'text-green-400' : dest.irv === 'Muy bueno' ? 'text-blue-400' : dest.irv === 'Bueno' ? 'text-yellow-400' : 'text-slate-400'}`}>{dest.irv}</div>
                      <div className="text-[10px] text-slate-500">Score: {dest.score}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCompare(prev => { const exists = prev.find(p => p.codigo === dest.codigo); if (exists) return prev.filter(p => p.codigo !== dest.codigo); if (prev.length >= 3) return [...prev.slice(1), dest]; return [...prev, dest]; })} className={`p-2 rounded-lg transition-all ${compare.find(c => c.codigo === dest.codigo) ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500 hover:text-white'}`}><Star className="w-4 h-4" /></button>
                      <Link href={`/pais/${dest.codigo}`} className="p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'results' && mode === 'espana' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{espResults.length} destinos en España</h2>
                <p className="text-slate-400 text-sm">{[...selectedIntereses.map(i => CATEGORY_LABELS_ES[i]).filter(Boolean), budget].filter(Boolean).join(' · ')}</p>
              </div>
              <button onClick={handleReset} className="text-red-400 text-sm hover:underline flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Refinar</button>
            </div>

            <div className="grid gap-3">
              {espResults.map((result, i) => {
                const { region: reg } = result;
                return (
                  <div key={reg.id} className="group bg-slate-900 rounded-xl border border-slate-800 hover:border-red-500/40 transition-all overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className={`text-sm font-bold w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-400' : i === 2 ? 'bg-amber-800/20 text-amber-600' : 'bg-slate-800 text-slate-500'}`}>{i + 1}</div>
                      <span className="text-2xl">{reg.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold">{reg.nombre}</h3>
                        <p className="text-slate-400 text-xs leading-snug mt-0.5">{reg.descripcion}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {reg.categorias.slice(0, 4).map(cat => (
                            <span key={cat} className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                              result.matchReasons.includes(cat) ? 'bg-red-500/15 text-red-400' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {CATEGORY_LABELS_ES[cat] || cat}
                            </span>
                          ))}
                          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">
                            ~{reg.coste === 'economico' ? '25' : reg.coste === 'medio' ? '50' : '100'}€/día
                          </span>
                          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded">
                            📅 {reg.mejorEpoca}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {reg.highlights.slice(0, 3).map((h, hi) => (
                            <span key={hi} className="text-slate-500 text-[10px] flex items-center gap-0.5">
                              <Camera className="w-3 h-3" /> {h}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className={`text-sm font-bold ${result.score >= 60 ? 'text-green-400' : result.score >= 40 ? 'text-yellow-400' : 'text-slate-400'}`}>
                          {result.score >= 60 ? 'Ideal' : result.score >= 40 ? 'Bueno' : 'Regular'}
                        </div>
                        <div className="text-[10px] text-slate-500">Score: {result.score}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCompareSpain(prev => {
                            const exists = prev.find(p => p.region.id === reg.id);
                            if (exists) return prev.filter(p => p.region.id !== reg.id);
                            if (prev.length >= 3) return [...prev.slice(1), result];
                            return [...prev, result];
                          })}
                          className={`p-2 rounded-lg transition-all ${compareSpain.find(c => c.region.id === reg.id) ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Compare bar - Spain */}
        {compareSpain.length >= 2 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-red-500/30 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl z-50">
            <div className="flex items-center gap-2">
              {compareSpain.map(r => <span key={r.region.id} className="text-xl">{r.region.emoji}</span>)}
            </div>
            <span className="text-white text-sm font-medium">{compareSpain.length} destinos</span>
            <button onClick={() => setCompareSpain([])} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Compare bar - International */}
        {compare.length >= 2 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-purple-500/30 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl z-50">
            <div className="flex items-center gap-2">
              {compare.map(d => <span key={d.codigo} className="text-xl">{d.bandera}</span>)}
            </div>
            <span className="text-white text-sm font-medium">{compare.length} destinos</span>
            <Link href={`/comparar?${compare.map(d => `p=${d.codigo}`).join('&')}`} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 transition-all">Comparar</Link>
            <button onClick={() => setCompare([])} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}
      </main>
    </div>
  );
}
