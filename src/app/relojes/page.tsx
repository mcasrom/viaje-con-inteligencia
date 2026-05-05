import type { Metadata } from 'next';
import RelojesClient from './RelojesClient';

export const metadata: Metadata = {
  title: 'Relojes Mundiales | Hora en 18 Ciudades - Viaje con Inteligencia',
  description: 'Hora actual en las principales ciudades del mundo. Planifica viajes con zonas horarias. Amanecer, atardecer y más.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/relojes',
  },
};

export default function RelojesPage() {
  return <RelojesClient />;
}
