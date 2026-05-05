import type { Metadata } from 'next';
import DestinosClient from './DestinosClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Destinos Recomendados por IA | Viaje con Inteligencia',
  description: 'Descubre destinos recomendados por inteligencia artificial según tus intereses: playa, montaña, cultura, gastronomía y más.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/destinos',
  },
};

export default function DestinosPage() {
  return <DestinosClient />;
}
