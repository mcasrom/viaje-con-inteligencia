import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mapa de Riesgos Globales | Viaje con Inteligencia',
  description: 'Mapa interactivo con el nivel de riesgo actualizado de 136 países según datos MAEC, OMS, y fuentes oficiales. Explora la seguridad de tu próximo destino.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/mapa',
  },
  openGraph: {
    title: 'Mapa de Riesgos Globales | Viaje con Inteligencia',
    description: 'Mapa interactivo con el nivel de riesgo de 136 países según datos MAEC y fuentes oficiales.',
  },
};

export default function MapaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
