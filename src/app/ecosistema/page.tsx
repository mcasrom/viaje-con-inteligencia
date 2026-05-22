import { Metadata } from 'next';
import EcosistemaClient from './EcosistemaClient';

export const metadata: Metadata = {
  title: 'Ecosistema — Viaje con Inteligencia',
  description: 'Arquitectura completa del sistema: fuentes de datos, pipelines, análisis, APIs, frontend y distribución social.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/ecosistema',
  },
};

export default function Page() {
  return <EcosistemaClient />;
}
