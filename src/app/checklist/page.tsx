import type { Metadata } from 'next';
import ChecklistClient from './ChecklistClient';

export const metadata: Metadata = {
  title: 'Checklist de Viaje | 80+ Items para tu Viaje - Viaje con Inteligencia',
  description: 'Checklist completo para organizar tu viaje: documentos, tecnología, salud, finanzas, equipaje, seguridad y más. 80+ items organizados por categoría.',
  openGraph: {
    title: 'Checklist de Viaje | 80+ Items',
    description: 'Organiza tu viaje con nuestra checklist completa. Documentos, tecnología, salud y más.',
    url: 'https://www.viajeinteligencia.com/checklist',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/checklist',
  },
};

export default function ChecklistPage() {
  return <ChecklistClient />;
}
