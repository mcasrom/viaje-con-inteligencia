import type { Metadata } from 'next';
import ColaborarClient from './ColaborarClient';

export const metadata: Metadata = {
  title: 'Colabora | Viaje con Inteligencia',
  description: 'Colabora con Viaje con Inteligencia: redacción de contenido, traducciones, OSINT, desarrollo o embajador. Gana visibilidad y acceso anticipado.',
  openGraph: {
    title: 'Colabora con Viaje con Inteligencia',
    description: 'Únete al proyecto de travel intelligence independiente. Byline, acceso beta y comunidad.',
    url: 'https://www.viajeinteligencia.com/colaborar',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/colaborar',
  },
};

export default function ColaborarPage() {
  return <ColaborarClient />;
}
