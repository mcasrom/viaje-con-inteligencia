import type { Metadata } from 'next';
import InfografiasClient from './page.client';

export const metadata: Metadata = {
  title: 'Infografías Semanales — Riesgo Global | Viaje con Inteligencia',
  description: 'Infografía semanal con análisis de riesgos globales, GWI (Global Weekly Index), distribución de riesgo por país, y top 10 destinos más y menos seguros. Actualizado cada lunes.',
  keywords: ['infografía viajes', 'riesgo global semanal', 'GWI', 'índice de riesgo', 'seguridad viajeros', 'OSINT viajes', 'análisis semanal'],
  
  // SOLUCIÓN: Añadimos la URL autorreferencial para corregir la indexación
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/infografias',
  },

  openGraph: {
    title: 'Infografías Semanales — Riesgo Global',
    description: 'Análisis visual semanal de riesgos de viaje en todo el mundo. Datos MAEC, GPI, GTI y OSINT.',
    url: 'https://www.viajeinteligencia.com/infografias',
    type: 'website',
    images: [{ url: '/og-infografias.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Infografías Semanales — Riesgo Global',
    description: 'Análisis visual semanal de riesgos de viaje en todo el mundo.',
    creator: '@ViajeIntel2026',
  },
};

export default function Page() {
  return <InfografiasClient />;
}
