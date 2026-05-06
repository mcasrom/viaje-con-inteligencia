import type { Metadata } from 'next';
import ReclamacionesClient from './ReclamacionesClient';

export const metadata: Metadata = {
  title: 'Generador de Reclamaciones de Viaje | Retrasos, Cancelaciones, Incumplimientos',
  description: 'Genera tu reclamación formal para aerolíneas, hoteles o agencias. Plantilla gratuita o documento personalizado Premium con referencias legales completas.',
  keywords: 'reclamación vuelo retrasado, reclamación cancelación vuelo, compensación aerolínea, Reglamento 261/2004, reclamación hotel, reclamación viaje',
  openGraph: {
    title: 'Generador de Reclamaciones de Viaje',
    description: 'Genera tu reclamación formal para aerolíneas, hoteles o agencias. Plantilla gratuita o documento personalizado Premium.',
    url: 'https://www.viajeinteligencia.com/reclamaciones',
    type: 'website',
  },
};

export default function ReclamacionesPage() {
  return <ReclamacionesClient />;
}
