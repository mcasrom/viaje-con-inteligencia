import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { checkPremium } from '@/lib/premium-check';
import ClusteringClient from './ClusteringClient';

export const metadata: Metadata = {
  title: 'ML Clustering de Destinos | IA para Viajes - Viaje con Inteligencia',
  description: 'Destinos agrupados por inteligencia artificial según seguridad, coste y preferencias. Descubre tu destino ideal con ML.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/clustering',
  },
};

export default async function ClusteringPage() {
  const { isPremium } = await checkPremium();
  if (!isPremium) redirect('/premium?redirect=/clustering');
  return <ClusteringClient />;
}
