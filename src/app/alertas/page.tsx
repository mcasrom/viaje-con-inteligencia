import type { Metadata } from 'next';
import AlertasClient from './AlertasClient';

export const metadata: Metadata = {
  title: 'Alertas MAEC en Vivo | Riesgos de Viaje - Viaje con Inteligencia',
  description: 'Alertas de riesgo en tiempo real del Ministerio de Asuntos Exteriores. Conflictos, desastres naturales y recomendaciones de viaje.',
  keywords: 'alertas viaje MAEC, riesgos viaje tiempo real, alertas seguridad viajeros, conflictos armados turismo, desastres naturales viaje, recomendaciones ministerio exteriores',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/alertas',
  },
  openGraph: {
    title: 'Alertas MAEC en Vivo | Riesgos de Viaje - Viaje con Inteligencia',
    description: 'Alertas de riesgo en tiempo real del Ministerio de Asuntos Exteriores. Conflictos, desastres naturales y recomendaciones de viaje.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alertas MAEC en Vivo | Riesgos de Viaje - Viaje con Inteligencia',
    description: 'Alertas de riesgo en tiempo real del MAEC. Conflictos, desastres naturales y recomendaciones de viaje.',
  },
};

export default function AlertasPage() {
  return <AlertasClient />;
}
