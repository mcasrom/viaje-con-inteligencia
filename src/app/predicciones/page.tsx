import type { Metadata } from 'next';
import PredictionsClient from './PredictionsClient';

export const metadata: Metadata = {
  title: 'Predicciones de Riesgo IA | Pronóstico de Seguridad de Viaje',
  description: 'Predicciones de cambio de riesgo por país basadas en análisis predictivo. Cruza OSINT, conflictos, petróleo y estacionalidad para anticipar cambios MAEC.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/predicciones',
  },
};

export default function PredictionsPage() {
  return <PredictionsClient />;
}
