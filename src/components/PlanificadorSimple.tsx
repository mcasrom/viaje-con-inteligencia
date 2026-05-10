'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, Clock, MapPin, Compass, ChevronRight } from 'lucide-react';

const photos = ['/photos/1.jpg', '/photos/2.jpg', '/photos/3.jpg', '/photos/4.jpg'];
const today = new Date();
const photoIndex = (today.getMonth() * 2 + today.getDate()) % photos.length;
const bgPhoto = photos[photoIndex];

type TravelPreference = 'playa' | 'cultural' | 'naturaleza' | 'familiar' | 'gastronomia' | 'enoturismo';
type Budget = 'bajo' | 'medio' | 'alto';
type RouteId = 'molinos' | 'faros' | 'murcia' | 'vino';

interface Recommendation {
  destination: string;
  nombre: string;
  bandera: string;
  nivelRiesgo: string;
  score: number;
  reason: string;
  days: number;
  bestTime: string[];
  highlights: string[];
  ipc?: number;
  nivel?: string;
}

interface RoutePreview {
  id: RouteId;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  image: string;
  description: string;
  stats: { distance: string; time: string; difficulty: string };
  tags: TravelPreference[];
  mlScore: number;
}

const preferenciaLabels: Record<TravelPreference, { label: string; icon: string; desc: string }> = {
  playa: { label: '🏖️ Playa', icon: '🌊', desc: 'Sol, arena y relax' },
  cultural: { label: '🏛️ Cultural', icon: '🎭', desc: 'Historia y museos' },
  naturaleza: { label: '🏔️ Naturaleza', icon: '🥾', desc: 'Aventura y paisajes' },
  familiar: { label: '👨‍👩‍👧‍👦 Familiar', icon: '🎢', desc: 'Apto para niños' },
  gastronomia: { label: '🍽️ Gastronomía', icon: '🍽️', desc: 'Comida y vino' },
  enoturismo: { label: '🍷 Enoturismo', icon: '🍷', desc: 'Bodegas y vino' },
};

const routePreviews: RoutePreview[] = [
  {
    id: 'molinos',
    name: 'Ruta de los Molinos',
    shortName: 'La Mancha',
    icon: <span className="text-3xl">🌬️</span>,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    description: 'Don Quijote vio gigantes. Molinos monumentales, gastronomía y historia.',
    stats: { distance: '450 km', time: '4-5 días', difficulty: 'Fácil' },
    tags: ['cultural', 'familiar'],
    mlScore: 8.5,
  },
  {
    id: 'faros',
    name: 'Ruta de los Faros',
    shortName: 'Costa España',
    icon: <span className="text-3xl">🌅</span>,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600',
    image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80',
    description: 'De Huelva a Gerona. Los faros más emblemáticos de la costa española.',
    stats: { distance: '2.100 km', time: '5-7 días', difficulty: 'Moderado' },
    tags: ['playa', 'familiar', 'naturaleza'],
    mlScore: 8.2,
  },
  {
    id: 'murcia',
    name: 'Ruta de Murcia',
    shortName: 'Interior',
    icon: <span className="text-3xl">🏔️</span>,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    description: 'Caravaca, Calasparra, Moratalla. Pueblos monumentales y naturaleza.',
    stats: { distance: '280 km', time: '3-4 días', difficulty: 'Fácil' },
    tags: ['cultural', 'naturaleza', 'familiar'],
    mlScore: 8.8,
  },
  {
    id: 'vino',
    name: 'Rutas del Vino',
    shortName: 'Enoturismo',
    icon: <span className="text-3xl">🍷</span>,
    color: 'text-red-400',
    gradient: 'from-red-500 to-rose-600',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b2687098b?w=800&q=80',
    description: 'Rioja, Ribera del Duero, Rías Baixas, Penedés, Jumilla. Enoturismo premium.',
    stats: { distance: '1.200 km', time: '5-7 días', difficulty: 'Fácil' },
    tags: ['cultural', 'gastronomia', 'enoturismo'],
    mlScore: 8.0,
  },
];

export default function PlanificadorSimple() {
  const [preferencia, setPreferencia] = useState<TravelPreference>('cultural');
  const [presupuesto, setPresupuesto] = useState<Budget>('medio');
  const [duracion, setDuracion] = useState('7');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteId | null>(null);
  const [routeDuration, setRouteDuration] = useState('3');

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ai/recommend?preferencia=${preferencia}&presupuesto=${presupuesto}&duracion=${duracion}&limit=3`
      );
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteClick = (routeId: RouteId) => {
    window.location.href = `/rutas?route=${routeId}&days=${routeDuration}`;
  };

  const getRiesgoColor = (nivel: string) => {
    if (nivel === 'sin-riesgo') return 'text-green-400';
    if (nivel === 'bajo') return 'text-emerald-400';
    if (nivel === 'medio') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMatchingScore = (route: RoutePreview): number => {
    const baseScore = route.mlScore;
    const matchesPreference = route.tags.includes(preferencia) ? 1.5 : 0;
    const matchesBudget = presupuesto === 'bajo' ? route.stats.difficulty === 'Fácil' ? 1 : 0 : presupuesto === 'alto' ? route.mlScore * 0.2 : 0.5;
    return Math.min(10, baseScore * 0.7 + matchesPreference + matchesBudget);
  };

  const sortedRoutes = [...routePreviews].sort((a, b) => getMatchingScore(b) - getMatchingScore(a));

  const getMatchBadge = (route: RoutePreview) => {
    if (route.tags.includes(preferencia)) {
      return { text: `✨ Match ${preferenciaLabels[preferencia].icon}`, color: 'bg-amber-500' };
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-2 space-y-4">
      {/* Planificador Principal */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl p-5 shadow-lg shadow-blue-200/50 border border-blue-300 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${bgPhoto})` }}
        />
        <div className="relative z-10">
          <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-wide">
              ✈️ Planifica tu viaje en 30 segundos
            </h2>
            <p className="text-slate-700 text-base font-medium">
              Selecciona tu tipo de viaje y obtén recomendaciones personalizadas con IA
            </p>
          </div>

          {/* Selectores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs text-slate-700 font-bold mb-1 block uppercase tracking-wider">Tipo de viaje</label>
              <div className="grid grid-cols-2 gap-1">
                {(['playa', 'cultural', 'naturaleza', 'familiar', 'gastronomia', 'enoturismo'] as TravelPreference[]).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setPreferencia(pref)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      preferencia === pref
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'bg-blue-100 text-slate-700 hover:bg-blue-200'
                    }`}
                  >
                    {preferenciaLabels[pref].icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold mb-1 block uppercase tracking-wider">Presupuesto</label>
              <div className="flex flex-col gap-1">
                {(['bajo', 'medio', 'alto'] as Budget[]).map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setPresupuesto(budget)}
                    className={`p-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      presupuesto === budget
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'bg-blue-100 text-slate-700 hover:bg-blue-200'
                    }`}
                  >
                    {budget === 'bajo' ? '💰' : budget === 'medio' ? '💰💰' : '💎'} {budget}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold mb-1 block uppercase tracking-wider">Duración</label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full p-2 rounded-lg text-sm bg-white text-slate-800"
              >
                <option value="3">3 días</option>
                <option value="5">5 días</option>
                <option value="7">7 días</option>
                <option value="10">10 días</option>
                <option value="14">14 días</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRecommend}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white text-blue-600 font-bold rounded-lg shadow-md hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? 'Analizando...' : 'Obtener recomendación'}
              </button>
            </div>
          </div>

          {/* Resultados */}
          {showResults && recommendations.length > 0 && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <div className="text-center mb-3">
                <span className="text-blue-200 text-sm">🎯 Basado en tu perfil: {preferenciaLabels[preferencia].desc}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.map((rec, idx) => (
                  <a
                    key={rec.destination}
                    href={`/analisis?destino=${rec.destination}`}
                    className="block p-4 bg-white/95 rounded-xl hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{rec.bandera}</span>
                      <span className="font-bold text-slate-800">{rec.nombre}</span>
                      <span className={`ml-auto text-xs ${getRiesgoColor(rec.nivelRiesgo)}`}>
                        {rec.nivelRiesgo === 'sin-riesgo' ? '✓ Seguro' : rec.nivelRiesgo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                      <span>{rec.highlights.slice(0, 2).join(' • ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>⏱️ {rec.days} días</span>
                      <span>📅 {rec.bestTime.slice(0, 2).join(', ')}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium group-hover:underline">
                        Ver análisis →
                      </span>
                      <span className="text-xs text-slate-400">#{idx + 1}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center mt-4 text-sm">
            <span className="text-slate-600 font-medium">Powered by </span>
            <span className="text-slate-900 font-bold">ML Clustering</span>
            <Link href="/viajes/clima" className="text-blue-600 hover:text-blue-700 font-medium ml-2 underline underline-offset-2">
              🌤️ Ver clima
            </Link>
          </div>
        </div>
      </div>

{/* RUTAS TEMÁTICAS ESPAÑA - ML-powered */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 shadow-lg border border-slate-700">
          {/* Header con selector */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="text-emerald-400 w-5 h-5" />
              🛣️ Rutas Temáticas
            </h3>
            
            <div className="flex items-center gap-2">
              <Clock className="text-slate-400 w-4 h-4" />
              <select
                value={routeDuration}
                onChange={(e) => setRouteDuration(e.target.value)}
                className="bg-slate-700 text-white text-xs rounded-lg px-2 py-1 border border-slate-600"
              >
                <option value="3">3 días</option>
                <option value="4">4 días</option>
                <option value="5">5 días</option>
              </select>
            </div>
          </div>

          {/* Top Match Card - Destacada */}
          <div className="relative overflow-hidden rounded-xl h-48 mb-4 group cursor-pointer"
               onClick={() => sortedRoutes[0] && handleRouteClick(sortedRoutes[0].id)}>
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url(${sortedRoutes[0]?.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg bg-white/20 backdrop-blur ${sortedRoutes[0]?.color}`}>
                  {sortedRoutes[0]?.icon}
                </div>
                <span className="text-xs bg-emerald-500/90 text-white px-3 py-1 rounded-full font-medium backdrop-blur">
                  ⭐ Top Match
                </span>
              </div>

              <div>
                <h4 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
                  {sortedRoutes[0]?.name}
                </h4>
                <p className="text-white/90 text-sm mb-2 drop-shadow-md">
                  {sortedRoutes[0]?.description?.slice(0, 80)}...
                </p>
                <div className="flex items-center gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {sortedRoutes[0]?.stats.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sortedRoutes[0]?.stats.time}
                  </span>
                  <span className="text-white/60">•</span>
                  <span>{sortedRoutes[0]?.stats.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Hero - Ver todas las rutas */}
          <Link
            href="/rutas"
            className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]"
          >
            <span>Rutas Temáticas</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <p className="text-center text-slate-500 text-xs mt-2">
            Molinos • Faros • Murcia Interior • Vino
          </p>
        </div>
    </div>
  );
}