import type { Metadata } from 'next';
import ItinerarioClient from './ItinerarioClient';

export const metadata: Metadata = {
  title: 'Generador de Itinerarios IA | Planifica tu Viaje - Viaje con Inteligencia',
  description: 'Crea itinerarios personalizados con inteligencia artificial. Destino, días, presupuesto e intereses. Tu viaje perfecto en minutos.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/itinerario',
  },
};

export default function ItinerarioPage() {
  return <ItinerarioClient />;
}
