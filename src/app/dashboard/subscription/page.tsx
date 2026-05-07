import type { Metadata } from 'next';
import SubscriptionClient from './SubscriptionClient';

export const metadata: Metadata = {
  title: 'Gestionar Suscripción Premium | Viaje con Inteligencia',
  description: 'Gestiona tu suscripción Premium: plan actual, facturas, cancelar o cambiar plan.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/dashboard/subscription',
  },
};

export default function SubscriptionPage() {
  return <SubscriptionClient />;
}
