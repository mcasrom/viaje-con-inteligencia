import type { Metadata } from 'next';
import OsintFeed from './OsintFeed';

export const metadata: Metadata = {
  title: 'Inteligencia de Viaje | Alertas en Vivo - Viaje con Inteligencia',
  description: 'Incidentes activos que afectan a viajeros. Recomendaciones claras para tomar decisiones informadas.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/osint',
  },
  openGraph: {
    title: 'Inteligencia de Viaje | Alertas en Vivo',
    description: 'Incidentes activos que afectan a viajeros. Recomendaciones claras.',
    url: 'https://www.viajeinteligencia.com/osint',
    type: 'website',
  },
};

export default function OsintPage() {
  return <OsintFeed />;
}
