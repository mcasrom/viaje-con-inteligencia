import type { Metadata } from 'next';
import EventosClient from './EventosClient';

export const metadata: Metadata = {
  title: 'Eventos Globales | Festivales y Fechas Importantes - Viaje con Inteligencia',
  description: 'Descubre festivales, fiestas nacionales y eventos culturales por país y mes. Planifica tu viaje con las mejores fechas.',
  openGraph: {
    title: 'Eventos Globales | Viaje con Inteligencia',
    url: 'https://www.viajeinteligencia.com/eventos',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/eventos',
  },
};

export default function EventosPage() {
  return <EventosClient />;
}
