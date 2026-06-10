import type { Metadata } from 'next';
import ItinerariosEspanaClient from './ItinerariosEspanaClient';

export const metadata: Metadata = {
  title: 'Itinerarios por España con IA | Smart Traveller - Viaje con Inteligencia',
  description: 'Genera tu itinerario personalizado por España con inteligencia artificial. Analisis de seguridad, mejor epoca del año y coste real por region.',
  alternates: { canonical: 'https://www.viajeinteligencia.com/itinerarios/espana' },
};

export default function ItinerariosEspanaPage() {
  return <ItinerariosEspanaClient />;
}
