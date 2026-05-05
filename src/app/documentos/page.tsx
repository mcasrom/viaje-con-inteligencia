import type { Metadata } from 'next';
import DocumentosClient from './DocumentosClient';

export const metadata: Metadata = {
  title: 'Mis Documentos de Viaje | Gestión Local Segura - Viaje con Inteligencia',
  description: 'Guarda y organiza tus documentos de viaje localmente. Pasaportes, billetes, seguros. Todo privado y offline.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/documentos',
  },
};

export default function DocumentosPage() {
  return <DocumentosClient />;
}
