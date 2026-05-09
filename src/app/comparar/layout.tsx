import { TOTAL_PAISES } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparador de Países | Riesgo MAEC, TCI, Paz - Viaje con Inteligencia',
  description: 'Compara hasta 4 países lado a lado: riesgo MAEC, índice de paz, terrorismo, desarrollo humano, inflación y coste de viaje.',
  openGraph: {
    title: 'Comparador de Países | Viaje con Inteligencia',
    description: 'Compara seguridad, coste y desarrollo de países.',
    url: 'https://www.viajeinteligencia.com/comparar',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/comparar',
  },
};

export default function CompararLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
