import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prueba Premium Gratis - Viaje con Inteligencia',
  description: 'Prueba premium gratis 7 días. Desbloquea todas las funciones premium: Chat IA, planner de viajes, alertas en tiempo real, análisis de riesgo y más.',
  keywords: ['prueba gratis premium', 'trial premium viaje', 'suscripcion gratuita', 'viaje inteligente premium', 'chat ia viajes'],
};

export default function FreeTrialLayout({ children }: { children: React.ReactNode }) {
  return children;
}