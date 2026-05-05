import type { Metadata } from 'next';
import AlertasClient from './AlertasClient';

export const metadata: Metadata = {
  title: 'Alertas MAEC en Vivo | Riesgos de Viaje - Viaje con Inteligencia',
  description: 'Alertas de riesgo en tiempo real del Ministerio de Asuntos Exteriores. Conflictos, desastres naturales y recomendaciones de viaje.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/alertas',
  },
};

export default function AlertasPage() {
  return <AlertasClient />;
}
