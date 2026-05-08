import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { checkPremium } from '@/lib/premium-check';
import SegurosPremiumClient from './SegurosPremiumClient';

export const metadata: Metadata = {
  title: 'Monitor de Seguros | Premium - Viaje con Inteligencia',
  description: 'Monitorea tu seguro de viaje frente al riesgo real de tus destinos favoritos. Alertas cuando tu cobertura se queda corta.',
};

export default async function SegurosDashboardPage() {
  const { isPremium, userId } = await checkPremium();
  if (!isPremium) redirect('/premium?redirect=/dashboard/seguros');
  return <SegurosPremiumClient userId={userId!} />;
}
