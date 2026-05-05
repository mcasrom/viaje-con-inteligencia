import type { Metadata } from 'next';
import LeadMagnetClient from './LeadMagnetClient';

export const metadata: Metadata = {
  title: 'Checklist Premium Gratis | Viaje con Inteligencia',
  description: 'Descarga gratis nuestra checklist premium de viaje con 80+ items verificados por viajeros experimentados.',
  openGraph: {
    title: 'Checklist Premium Gratis | Viaje con Inteligencia',
    url: 'https://www.viajeinteligencia.com/lead-magnet',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/lead-magnet',
  },
};

export default function LeadMagnetPage() {
  return <LeadMagnetClient />;
}
