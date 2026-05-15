import type { Metadata } from 'next';
import AnalisisClient from './AnalisisClient';

export const metadata: Metadata = {
  title: 'Análisis de Petróleo y Vuelos | Impacto en Viajes - Viaje con Inteligencia',
  description: 'Análisis del precio del petróleo y su impacto en vuelos. Predicciones y tendencias para planificar viajes inteligentes.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/analisis',
  },
  openGraph: {
    title: 'Análisis de Petróleo y Vuelos | Impacto en Viajes - Viaje con Inteligencia',
    description: 'Análisis del precio del petróleo y su impacto en vuelos. Predicciones y tendencias para planificar viajes inteligentes.',
    url: 'https://www.viajeinteligencia.com/analisis',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Análisis de Petróleo y Vuelos | Impacto en Viajes - Viaje con Inteligencia',
    description: 'Análisis del precio del petróleo y su impacto en vuelos. Predicciones y tendencias para planificar viajes inteligentes.',
    creator: '@ViajeIntel2026',
  },
};

export default function AnalisisPage() {
  return <AnalisisClient />;
}
