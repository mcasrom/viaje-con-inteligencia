import type { Metadata } from 'next';
import PetroleoClient from './PetroleoClient';

export const metadata: Metadata = {
  title: 'Análisis Petróleo ML | Predicciones de Crudo - Viaje con Inteligencia',
  description: 'Predicciones del precio del petróleo con machine learning. Impacto en vuelos y costes de viaje. Análisis de conflictos.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/petroleo',
  },
};

export default function PetroleoPage() {
  return <PetroleoClient />;
}
