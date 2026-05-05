import type { Metadata } from 'next';
import TurismoClient from './TurismoClient';

export const metadata: Metadata = {
  title: 'Datos de Turismo por País | Estadísticas INE - Viaje con Inteligencia',
  description: 'Estadísticas de turismo por país. Datos del INE, llegadas internacionales, ingresos turísticos y tendencias.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/turismo',
  },
};

export default function TurismoPage() {
  return <TurismoClient />;
}
