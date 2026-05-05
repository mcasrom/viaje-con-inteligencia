'use client';

import { useState } from 'react';
import Link from 'next/link';
import { thematicRoutes, ThematicRoute, ThemeRoute } from '@/data/rutas-espanas';
import { MapPin, Clock, Car, TrendingUp, Star, Shield, ArrowRight, Filter, Grid3X3, List, ArrowLeft, Globe, BarChart3, Sparkles, DollarSign, Navigation } from 'lucide-react';

const categories = [
  { id: 'all', label: 'Todas', emoji: '🌍' },
  { id: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { id: 'costero', label: 'Costero', emoji: '🏖️' },
  { id: 'interior', label: 'Interior', emoji: '🏔️' },
] as const;

const difficultyLabels: Record<string, { label: string; color: string }> = {
  facil: { label: 'Fácil', color: 'text-emerald-400 bg-emerald-500/10' },
  moderado: { label: 'Moderado', color: 'text-amber-400 bg-amber-500/10' },
  dificil: { label: 'Difícil', color: 'text-red-400 bg-red-500/10' },
};

const routeEmojis: Record<ThemeRoute, string> = {
  molinos: '🌾',
  faros: '🗼',
  murcia: '🌴',
  vino: '🍷',
};

export default function RutasPage() {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'distance' | 'safety'>('popular');

  const routes = Object.values(thematicRoutes) as ThematicRoute[];

  const filtered = routes
    .filter(r => filter === 'all' || r.category === filter)
    .sort((a, b) => {
      if (sortBy === 'popular') return b.mlFeatures.popularityScore - a.mlFeatures.popularityScore;
      if (sortBy === 'distance') return a.totalDistance - b.totalDistance;
      if (sortBy === 'safety') return b.mlFeatures.safetyScore - a.mlFeatures.safetyScore;
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* HEADER */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al mapa</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 rounded-full border border-emerald-500/30">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-semibold">Rutas Temáticas</span>
            </div>
          </div>
          <div className="flex items-center gap-1 pb-2 overflow-x-auto">
            {[
              { href: '/', label: 'Mapa', icon: <Globe className="w-3 h-3" /> },
              { href: '/decidir', label: 'Decidir', icon: <Sparkles className="w-3 h-3" /> },
              { href: '/coste', label: 'Coste', icon: <DollarSign className="w-3 h-3" /> },
              { href: '/analisis', label: 'Análisis', icon: <BarChart3 className="w-3 h-3" /> },
              { href: '/rutas', label: 'Rutas', icon: <Car className="w-3 h-3" />, active: true },
              { href: '/radius', label: 'Radius', icon: <Navigation className="w-3 h-3" /> },
              { href: '/indices', label: 'KPIs', icon: <BarChart3 className="w-3 h-3" /> },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  link.active
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
            <span className="text-emerald-300 text-sm font-medium">España Premium</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Rutas Temáticas
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Descubre España con rutas curadas, scoring IA y datos de seguridad reales.
            Molinos, Faros, Murcia, Vino... ¿Cuál eliges?
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          {/* Categorías */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === cat.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Ordenar */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-800 text-white text-sm rounded-xl px-4 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="popular">Más populares</option>
              <option value="distance">Menos distancia</option>
              <option value="safety">Más seguras</option>
            </select>
          </div>
        </div>

        {/* GRID DE RUTAS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(route => {
            const difficulty = difficultyLabels[route.difficulty] || { label: route.difficulty, color: '' };
            const emoji = routeEmojis[route.id] || '🗺️';

            return (
              <Link
                key={route.id}
                href={`/rutas/${route.id}`}
                className="group bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]"
              >
                {/* Imagen placeholder */}
                <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center relative">
                  <span className="text-6xl">{emoji}</span>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold bg-slate-900/80 backdrop-blur-sm ${difficulty.color}`}>
                      {difficulty.label}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {route.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {route.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Car className="w-4 h-4 text-blue-400" />
                      <span>{route.totalDistance} km</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{route.totalDrivingTime}h</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>{route.mlFeatures.safetyScore}/10</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{route.mlFeatures.popularityScore}/10</span>
                    </div>
                  </div>

                  {/* Temporada */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <TrendingUp className="w-3 h-3" />
                    <span>Mejor: {route.bestSeason.slice(0, 2).join(', ')}</span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <span className="text-blue-400 text-sm font-medium">Ver ruta completa</span>
                    <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🗺️</span>
            <h3 className="text-xl font-bold text-white mb-2">No hay rutas en esta categoría</h3>
            <p className="text-slate-400">Prueba con otra categoría o vuelve a "Todas"</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Ver todas las rutas
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
