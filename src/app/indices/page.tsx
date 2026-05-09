import type { Metadata } from 'next';
import IndicesClient from './IndicesClient';
import { TOTAL_PAISES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Índices y Métricas | Viaje con Inteligencia',
  description: `Todos los índices, KPIs y algoritmos que usamos para analizar ${TOTAL_PAISES} países. IRV, TCI, IST y más métricas con narrativa y rangos visuales.`,
  openGraph: {
    title: 'Índices y Métricas | Viaje con Inteligencia',
    description: 'Transparencia total sobre cómo calculamos la inteligencia de viaje.',
    url: 'https://www.viajeinteligencia.com/indices',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/indices',
  },
};

export const revalidate = 3600;

export default function IndicesPage() {
  return <IndicesClient />;
}
