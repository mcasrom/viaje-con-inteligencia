import type { Metadata } from 'next';
import EarlyExplorersClient from './EarlyExplorersClient';
export const metadata: Metadata = {
  title: 'Early Explorers — Global Travel Intelligence Wall | Viaje con Inteligencia',
  description: 'Los primeros 100 exploradores que apostaron por la inteligencia de viaje. Únete al mapa y deja tu marca permanente en la comunidad.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/early-explorers',
  },
  openGraph: {
    title: 'Early Explorers — Global Travel Intelligence Wall',
    description: 'Los primeros 100 exploradores que apostaron por la inteligencia de viaje. Únete al mapa.',
    url: 'https://www.viajeinteligencia.com/early-explorers',
    type: 'website',
    images: [{ url: 'https://www.viajeinteligencia.com/og-early-explorers.jpeg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Early Explorers — Global Travel Intelligence Wall',
    description: 'Los primeros 100 exploradores. Únete y deja tu marca permanente.',
    images: ['https://www.viajeinteligencia.com/og-early-explorers.jpeg'],
  },
};
export default function EarlyExplorersPage() {
  return <EarlyExplorersClient />;
}
