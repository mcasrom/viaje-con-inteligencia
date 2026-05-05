import type { Metadata } from 'next';
import AnalisisClient from './AnalisisClient';

export const metadata: Metadata = {
  title: 'Análisis de Petróleo y Vuelos | Impacto en Viajes - Viaje con Inteligencia',
  description: 'Análisis del precio del petróleo y su impacto en vuelos. Predicciones y tendencias para planificar viajes inteligentes.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/analisis',
  },
};

export default function AnalisisPage() {
  return <AnalisisClient />;
}
