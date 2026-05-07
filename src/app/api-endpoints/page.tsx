import type { Metadata } from 'next';
import ApiDocsClient from './ApiDocsClient';

export const metadata: Metadata = {
  title: 'API Pública v1 | Risk, TCI, Incidents — Viaje con Inteligencia',
  description: 'API pública de datos de viaje: riesgo MAEC, índice de coste TCI, incidentes activos. Ideal para agencias, aseguradoras y desarrolladores.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/api-endpoints',
  },
};

export default function ApiDocsPage() {
  return <ApiDocsClient />;
}
