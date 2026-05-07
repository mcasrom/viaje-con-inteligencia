import type { Metadata } from 'next';
import PremiumClient from './PremiumClient';

export const metadata: Metadata = {
  title: 'Premium | Viaje con Inteligencia — Chat IA, Alertas, ML y más',
  description: 'Desbloquea Chat IA ilimitado con modelo 70b, alertas en tiempo real, planificador de itinerarios, ML clustering y todas las herramientas Premium. 7 días gratis.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/premium',
  },
  openGraph: {
    title: 'Premium | Viaje con Inteligencia — Chat IA, Alertas, ML y más',
    description: 'Desbloquea Chat IA ilimitado, alertas en tiempo real, ML clustering y más. 7 días gratis.',
    url: 'https://www.viajeinteligencia.com/premium',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium | Viaje con Inteligencia — Chat IA, Alertas, ML y más',
    description: 'Desbloquea Chat IA ilimitado, alertas en tiempo real, ML clustering y más. 7 días gratis.',
  },
};

export default function PremiumPage() {
  return <PremiumClient />;
}
