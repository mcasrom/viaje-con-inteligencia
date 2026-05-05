import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plan Premium | 7 Días Gratis - Viaje con Inteligencia',
  description: '7 días gratis. Chat IA ilimitado, alertas en tiempo real, sismos USGS, KPIs globales y planificador de itinerarios.',
  openGraph: {
    title: 'Plan Premium | Viaje con Inteligencia',
    description: 'Prueba gratuita de 7 días. Alertas IA, chat, sismos y más.',
    url: 'https://www.viajeinteligencia.com/premium',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/premium',
  },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
