import type { Metadata } from 'next';
import CompararClient from './CompararClient';

export const metadata: Metadata = {
  title: 'Comparador de Países | Riesgos, Costes y Seguridad - Viaje con Inteligencia',
  description: 'Compara países lado a lado: nivel de riesgo, coste de vida, seguridad, clima y más. Decide tu destino con datos.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/comparar',
  },
};

export default function CompararPage() {
  return <CompararClient />;
}
