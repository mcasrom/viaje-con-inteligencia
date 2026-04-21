import { Metadata } from 'next';
import LeadMagnetClient from './LeadMagnetClient';

export const metadata: Metadata = {
  title: 'Checklist Premium de Viaje - Descarga Gratis | Viaje con Inteligencia',
  description: 'Descarga nuestro checklist premium con 80+ items verificados. No olvides nada en tu próximo viaje. Incluye categorías por prioridad.',
  keywords: 'checklist viaje, preparacion viaje, packing list, lista viaje',
  openGraph: {
    title: 'Checklist Premium de Viaje - Descarga Gratis',
    description: '80+ items verificados por viajeros experimentados. No olvides nada.',
    type: 'website',
  },
};

export default function LeadMagnetPage() {
  return <LeadMagnetClient />;
}