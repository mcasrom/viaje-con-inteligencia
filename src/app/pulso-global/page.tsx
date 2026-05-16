import type { Metadata } from 'next';
import PulsoGlobalClient from './PulsoGlobalClient';

export const metadata: Metadata = {
  title: 'Pulso Global OSINT | Viaje con Inteligencia',
  description: 'Mapa de calor de alertas y ranking de sentimiento país por país en tiempo real. Datos GDELT, RSS y OSINT.',
  openGraph: {
    title: 'Pulso Global — Alertas y Sentimiento en Vivo',
    description: 'Descubre qué países tienen alertas activas, cómo evoluciona el sentimiento y dónde están los mayores cambios esta semana.',
  },
  robots: { index: true, follow: true },
};

export default function PulsoGlobalPage() {
  return <PulsoGlobalClient />;
}
