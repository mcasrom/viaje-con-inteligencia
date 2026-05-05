import type { Metadata } from 'next';
import DecidirClient from './DecidirClient';

export const metadata: Metadata = {
  title: 'Decide tu Destino en 30 Seg | IA Viaje Seguro - Viaje con Inteligencia',
  description: '¿No sabes a dónde viajar? Elige tus intereses y te sugerimos los mejores destinos seguros. Playas, montaña, cultura, gastronomía, aventura o fiesta.',
  keywords: 'decidir destino viaje, sugerencias viaje, destinos seguros, viaje playa, viaje montaña, viaje cultural, viaje gastronomia, viaje aventura, recomendaciones viaje',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/decidir',
  },
  openGraph: {
    title: 'Decide tu Destino en 30 Seg | IA Viaje Seguro - Viaje con Inteligencia',
    description: '¿No sabes a dónde viajar? Elige tus intereses y te sugerimos los mejores destinos seguros. Playas, montaña, cultura, gastronomía, aventura o fiesta.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decide tu Destino en 30 Seg | IA Viaje Seguro - Viaje con Inteligencia',
    description: '¿No sabes a dónde viajar? Elige tus intereses y te sugerimos los mejores destinos seguros.',
  },
};

export default function DecidirPage() {
  return <DecidirClient />;
}
