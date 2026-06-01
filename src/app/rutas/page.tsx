import { thematicRoutes, ThematicRoute } from '@/data/rutas-espanas';
import RutasClient from './RutasClient';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string>> }): Promise<Metadata> {
  const params = await searchParams;
  const hasParams = Object.keys(params).length > 0;
  return {
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
    ...(hasParams && { robots: { index: false, follow: true } }),
  };
}

export const revalidate = 3600;

export default function RutasPage() {
  return (
    <Suspense>
      <RutasClient routes={thematicRoutes} />
    </Suspense>
  );
}
