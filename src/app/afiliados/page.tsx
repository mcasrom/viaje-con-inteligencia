import type { Metadata } from 'next';
import AfiliadosClient from './AfiliadosClient';

export const metadata: Metadata = {
  title: 'Afiliados | Viaje con Inteligencia',
  description: 'Programa de afiliados de Viaje con Inteligencia. Comparte el índice IRV, el radar de viaje o el chat IA y gana comisiones por cada usuario que se registre a través de tu enlace.',
  openGraph: {
    title: 'Programa de afiliados — Viaje con Inteligencia',
    description: 'Gana comisiones compartiendo inteligencia de viaje. Únete al programa de afiliados.',
    url: 'https://www.viajeinteligencia.com/afiliados',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/afiliados',
  },
};

export default function AfiliadosPage() {
  return <AfiliadosClient />;
}
