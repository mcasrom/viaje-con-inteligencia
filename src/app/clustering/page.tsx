import type { Metadata } from 'next';
import ClusteringClient from './ClusteringClient';

export const metadata: Metadata = {
  title: 'ML Clustering de Destinos | IA para Viajes - Viaje con Inteligencia',
  description: 'Destinos agrupados por inteligencia artificial según seguridad, coste y preferencias. Descubre tu destino ideal con ML.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/clustering',
  },
};

export default function ClusteringPage() {
  return <ClusteringClient />;
}
