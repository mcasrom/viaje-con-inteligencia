import type { Metadata } from 'next';
import PredictionsClient from './PredictionsClient';

export const metadata: Metadata = {
  title: 'ML Risk Predictions | IA Predictiva de Riesgo de Viaje',
  description: 'Predicciones de cambio de riesgo por país basadas en ML. Cruza OSINT, conflictos, petróleo y estacionalidad para anticipar cambios MAEC.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/predicciones',
  },
};

export default function PredictionsPage() {
  return <PredictionsClient />;
}
