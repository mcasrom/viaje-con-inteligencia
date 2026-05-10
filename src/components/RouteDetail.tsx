'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Compass, Euro, Calendar, ChevronRight, ArrowLeft, Star, Check } from 'lucide-react';
import { thematicRoutes, generateDayByDay, ThemeRoute, DurationOption } from '@/data/rutas-espanas';

interface RouteDetailProps {
  routeId: ThemeRoute;
  days: number;
}

export default function RouteDetail({ routeId, days: initialDays }: RouteDetailProps) {
  const route = thematicRoutes[routeId];
  const [duration, setDuration] = useState<DurationOption>(initialDays as DurationOption);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItinerary(generateDayByDay(routeId, duration));
    setLoading(false);
  }, [routeId, duration]);

  if (!route) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Ruta no encontrada</h2>
        <Link href="/rutas" className="text-emerald-400 mt-4 inline-block">Volver a rutas</Link>
      </div>
    );
  }

  const gradients: Record<string, string> = {
    molinos: 'from-amber-600 to-orange-700',
    faros: 'from-cyan-600 to-blue-700',
    murcia: 'from-emerald-600 to-teal-700',
  };

  const colors: Record<string, string> = {
    molinos: 'text-amber-400',
    faros: 'text-cyan-400',
    murcia: 'text-emerald-400',
  };

  return (
    <div>
      {/* Header */}
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradients[routeId]} p-8 mb-8`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10">
          <Link href="/rutas" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a todas las rutas
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{route.name}</h1>
              <p className="text-white/80 text-lg max-w-2xl">{route.description}</p>
            </div>
            
            {/* Selector duración */}
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <label className="text-white/80 text-sm mb-2 block">Duración del viaje</label>
              <div className="flex gap-2">
                {([3, 4, 5] as DurationOption[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      duration === d
                        ? 'bg-white text-slate-800 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {d} días
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{route.totalDistance} km</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{route.totalDrivingTime}h conducción</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Compass className="w-5 h-5" />
              <span className="font-medium capitalize">{route.difficulty}</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Euro className="w-5 h-5" />
              <span className="font-medium">~{route.avgDailyCost.medio}€/día</span>
            </div>
          </div>
        </div>
      </div>

      {/* ML Features */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-yellow-400 w-5 h-5" />
            <span className="text-slate-400 text-sm">Popularidad</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full" 
              style={{ width: `${route.mlFeatures.popularityScore * 10}%` }}
            />
          </div>
          <span className="text-white font-medium mt-1 block">{route.mlFeatures.popularityScore}/10</span>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Check className="text-emerald-400 w-5 h-5" />
            <span className="text-slate-400 text-sm">Seguridad</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-emerald-400 h-2 rounded-full" 
              style={{ width: `${route.mlFeatures.safetyScore * 10}%` }}
            />
          </div>
          <span className="text-white font-medium mt-1 block">{route.mlFeatures.safetyScore}/10</span>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="text-purple-400 w-5 h-5" />
            <span className="text-slate-400 text-sm">Calidad-Precio</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-purple-400 h-2 rounded-full" 
              style={{ width: `${route.mlFeatures.valueScore * 10}%` }}
            />
          </div>
          <span className="text-white font-medium mt-1 block">{route.mlFeatures.valueScore}/10</span>
        </div>
      </div>

      {/* Itinerary */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className={colors[routeId]} />
        Itinerario de {duration} días
      </h2>

      <div className="space-y-4 mb-8">
        {!loading && itinerary.map((day, idx) => (
          <div key={idx} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start gap-4">
              {/* Day badge */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[routeId]} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-lg">{day.day}</span>
              </div>
              
              {/* Activities */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-3">Día {day.day}</h3>
                <div className="grid gap-3">
                  {day.activities.map((activity: any, actIdx: number) => (
                    <div key={actIdx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-slate-400 text-xs">{actIdx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{activity.location}</span>
                          <span className="text-slate-400 text-sm">⏱️ {activity.time}h</span>
                        </div>
                        <p className="text-slate-400 text-sm">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Best Season */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 mb-8">
        <h3 className="text-white font-bold mb-3">🌡️ Mejor época para visitar</h3>
        <div className="flex flex-wrap gap-2">
          {route.bestSeason.map((month) => (
            <span key={month} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
              {month}
            </span>
          ))}
        </div>
      </div>

      {/* Cost estimate */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-bold mb-4">💰 Estimación de costes</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <span className="text-slate-400 text-sm">Económico</span>
            <div className="text-2xl font-bold text-emerald-400">{(route.avgDailyCost.bajo * duration).toFixed(0)}€</div>
            <span className="text-slate-500 text-xs">Total para {duration} días</span>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <span className="text-slate-400 text-sm">Moderado</span>
            <div className="text-2xl font-bold text-yellow-400">{(route.avgDailyCost.medio * duration).toFixed(0)}€</div>
            <span className="text-slate-500 text-xs">Total para {duration} días</span>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <span className="text-slate-400 text-sm">Alto</span>
            <div className="text-2xl font-bold text-purple-400">{(route.avgDailyCost.alto * duration).toFixed(0)}€</div>
            <span className="text-slate-500 text-xs">Total para {duration} días</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <a
          href={`/analisis?destino=${route.locations[0]?.name.toLowerCase() || routeId}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
        >
          Analizar primer destino <ChevronRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}