import type { Metadata } from 'next';
import DecidirClient from './DecidirClient';

export const revalidate = 86400;

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
    url: 'https://www.viajeinteligencia.com/decidir',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decide tu Destino en 30 Seg | IA Viaje Seguro - Viaje con Inteligencia',
    description: '¿No sabes a dónde viajar? Elige tus intereses y te sugerimos los mejores destinos seguros.',
  },
};

export default function DecidirPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Decide tu Destino',
    description: 'Herramienta IA para encontrar tu destino ideal de viaje en 30 segundos',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    url: 'https://www.viajeinteligencia.com/decidir',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1 className="sr-only">Decide tu Destino de Viaje en 30 Segundos con IA — Viaje con Inteligencia</h1>
      <DecidirClient />
    </>
  );
}
