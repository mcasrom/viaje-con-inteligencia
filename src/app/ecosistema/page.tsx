import { Metadata } from 'next';
import EcosistemaClient from './EcosistemaClient';

export const metadata: Metadata = {
  title: 'Ecosistema — Viaje con Inteligencia',
  description: 'Arquitectura completa del sistema: fuentes de datos, pipelines, ML, APIs, frontend y distribución social.',
};

export default function Page() {
  return <EcosistemaClient />;
}
