'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Clock, MapPin, Compass, ChevronRight } from 'lucide-react';

const photos = ['/photos/1.jpg', '/photos/2.jpg', '/photos/3.jpg', '/photos/4.jpg'];
const today = new Date();
const photoIndex = (today.getMonth() * 2 + today.getDate()) % photos.length;
const bgPhoto = photos[photoIndex];

type TravelPreference = 'playa' | 'cultural' | 'naturaleza' | 'familiar';
type Budget = 'bajo' | 'medio' | 'alto';
type RouteId = 'molinos' | 'faros' | 'murcia';

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
  description: string;
  stats: { distance: string; time: string; difficulty: string };
}

const preferenciaLabels: Record<TravelPreference, { label: string; icon: string; desc: string }> = {
  playa: { label: '🏖️ Playa', icon: '🌊', desc: 'Sol, arena y relax' },
  cultural: { label: '🏛️ Cultural', icon: '🎭', desc: 'Historia y museos' },
  naturaleza: { label: '🏔️ Naturaleza', icon: '🥾', desc: 'Aventura y paisajes' },
  familiar: { label: '👨‍👩‍👧‍👦 Familiar', icon: '🎢', desc: 'Apto para niños' },
};

const routePreviews: RoutePreview[] = [
  {
    id: 'molinos',
    name: 'Ruta de los Molinos',
    shortName: 'La Mancha',
    icon: <span className="text-3xl">🌬️</span>,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Don Quijote vio gigantes. Molinos monumentales, gastronomía y historia.',
    stats: { distance: '450 km', time: '4-5 días', difficulty: 'Fácil' },
  },
  {
    id: 'faros',
    name: 'Ruta de los Faros',
    shortName: 'Costa España',
    icon: <span className="text-3xl">🌅</span>,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600',
    description: 'De Huelva a Gerona. Los faros más emblemáticos de España.',
    stats: { distance: '2.100 km', time: '5-7 días', difficulty: 'Moderado' },
  },
  {
    id: 'murcia',
    name: 'Ruta de Murcia',
    shortName: 'Interior',
    icon: <span className="text-3xl">🏔️</span>,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Caravaca, Calasparra, Moratalla. Pueblos monumentales y naturaleza.',
    stats: { distance: '280 km', time: '3-4 días', difficulty: 'Fácil' },
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-2 space-y-4">
      {/* Planificador Principal */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20 border border-blue-400/30 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${bgPhoto})` }}
        />
        <div className="relative z-10">
          <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              ✈️ Planifica tu viaje en 30 segundos
            </h2>
            <p className="text-blue-100 text-sm">
              Selecciona tu tipo de viaje y obtén recomendaciones personalizadas con IA
            </p>
          </div>

          {/* Selectores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs text-blue-200 mb-1 block">Tipo de viaje</label>
              <div className="grid grid-cols-2 gap-1">
                {(['playa', 'cultural', 'naturaleza', 'familiar'] as TravelPreference[]).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setPreferencia(pref)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      preferencia === pref
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {preferenciaLabels[pref].icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-blue-200 mb-1 block">Presupuesto</label>
              <div className="flex flex-col gap-1">
                {(['bajo', 'medio', 'alto'] as Budget[]).map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setPresupuesto(budget)}
                    className={`p-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      presupuesto === budget
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {budget === 'bajo' ? '💰' : budget === 'medio' ? '💰💰' : '💎'} {budget}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-blue-200 mb-1 block">Duración</label>
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
            <span className="text-blue-200">Powered by </span>
            <span className="text-white font-medium">ML Clustering</span>
          </div>
        </div>
      </div>

      {/* RUTAS TEMÁTICAS ESPAÑA - Nueva Sección */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 shadow-lg border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-emerald-400" />
              🛣️ Rutas Temáticas de España
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Itinerarios diseñados por expertos. Selecciona duración yDescubre España de otra manera
            </p>
          </div>
          
          {/* Selector duración global */}
          <div className="flex items-center gap-2">
            <Clock className="text-slate-400 w-4 h-4" />
            <select
              value={routeDuration}
              onChange={(e) => setRouteDuration(e.target.value)}
              className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1.5 border border-slate-600"
            >
              <option value="3">3 días</option>
              <option value="4">4 días</option>
              <option value="5">5 días</option>
            </select>
          </div>
        </div>

        {/* Cards de Rutas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routePreviews.map((route) => (
            <button
              key={route.id}
              onClick={() => handleRouteClick(route.id)}
              className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${route.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
              
              {/* Content */}
              <div className="relative p-4 text-left">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-white/20 backdrop-blur ${route.color}`}>
                    {route.icon}
                  </div>
                  <ChevronRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                {/* Title */}
                <h4 className="text-white font-bold text-lg mb-1 group-hover:text-white">
                  {route.name}
                </h4>
                <p className="text-white/80 text-sm font-medium mb-2">
                  {route.shortName}
                </p>

                {/* Description */}
                <p className="text-white/70 text-xs mb-3 line-clamp-2">
                  {route.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {route.stats.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {route.stats.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    {route.stats.difficulty}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer links */}
        <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            ✨ Más rutas soon: Nieve • Playa • Gastronomía • Vino
          </span>
          <a href="/rutas" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 flex items-center gap-1">
            Ver todas las rutas <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}