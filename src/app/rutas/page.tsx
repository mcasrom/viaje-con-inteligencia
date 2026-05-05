import { thematicRoutes, ThematicRoute } from '@/data/rutas-espanas';
import RutasClient from './RutasClient';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rutas Temáticas de España | Itinerarios con IA - Viaje con Inteligencia',
  description: 'Rutas culturales, costeras, de montaña y enoturismo por España. Itinerarios diseñados con IA para descubrir el país.',
  openGraph: {
    title: 'Rutas Temáticas de España',
    description: 'Descubre España con itinerarios diseñados por IA.',
    url: 'https://www.viajeinteligencia.com/rutas',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/rutas',
  },
};

export const revalidate = 3600;

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  facil: { label: 'Fácil', color: 'text-emerald-400 bg-emerald-500/10' },
  moderado: { label: 'Moderado', color: 'text-amber-400 bg-amber-500/10' },
  dificil: { label: 'Difícil', color: 'text-red-400 bg-red-500/10' },
};

const ROUTE_EMOJIS: Record<string, string> = {
  molinos: '🌾',
  faros: '🗼',
  murcia: '🌴',
  vino: '🍷',
};

export default function RutasPage() {
  const routes = Object.values(thematicRoutes).map(route => {
    const difficulty = DIFFICULTY_LABELS[route.difficulty] || { label: route.difficulty, color: '' };
    const emoji = ROUTE_EMOJIS[route.id] || '🗺️';
    return {
      id: route.id,
      name: route.name,
      shortName: route.shortName,
      description: route.description,
      image: route.image,
      category: route.category,
      totalDistance: route.totalDistance,
      totalDrivingTime: route.totalDrivingTime,
      bestSeason: route.bestSeason,
      difficulty: route.difficulty,
      difficultyLabel: difficulty.label,
      difficultyColor: difficulty.color,
      safetyScore: route.mlFeatures.safetyScore,
      popularityScore: route.mlFeatures.popularityScore,
      emoji,
    };
  });

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando rutas...</div>}>
      <RutasClient routes={routes} />
    </Suspense>
  );
}
