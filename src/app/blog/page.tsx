import type { Metadata } from 'next';
import SkeletonPage from '@/components/SkeletonPage';

export const metadata: Metadata = {
  title: 'Blog OSINT | Análisis de Viajes y Seguridad - Viaje con Inteligencia',
  description: 'Análisis geopolíticos, guías de seguridad y tendencias de viaje basadas en datos OSINT e inteligencia artificial.',
  keywords: 'blog viajes, análisis geopolítico, OSINT viajes, seguridad viajeros, tendencias viaje, inteligencia artificial viajes',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/blog',
  },
  openGraph: {
    title: 'Blog OSINT | Análisis de Viajes y Seguridad - Viaje con Inteligencia',
    description: 'Análisis geopolíticos, guías de seguridad y tendencias de viaje basadas en datos OSINT e inteligencia artificial.',
    url: 'https://www.viajeinteligencia.com/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog OSINT | Análisis de Viajes y Seguridad - Viaje con Inteligencia',
    description: 'Análisis geopolíticos, guías de seguridad y tendencias de viaje basadas en datos OSINT.',
  },
};

export default function Page() {
  return <SkeletonPage title="Blog OSINT" />;
}
