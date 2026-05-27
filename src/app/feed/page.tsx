import type { Metadata } from 'next';
import FeedClient from './FeedClient';

export const metadata: Metadata = {
  title: 'Feed de Viaje | Alertas, Noticias y Eventos - Viaje con Inteligencia',
  description: 'Feed unificado con alertas MAEC, noticias de actualidad, señales OSINT y eventos relevantes para viajeros.',
  alternates: { canonical: 'https://www.viajeinteligencia.com/feed' },
  openGraph: {
    title: 'Feed de Viaje | Alertas, Noticias y Eventos',
    description: 'Toda la información relevante para viajeros en un solo lugar.',
    url: 'https://www.viajeinteligencia.com/feed',
    type: 'website',
  },
};

export default function FeedPage() {
  return <FeedClient />;
}
