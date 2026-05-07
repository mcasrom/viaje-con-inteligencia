import type { Metadata } from 'next';
import AdminIncidents from './IncidentsAdmin';

export const metadata: Metadata = {
  title: 'Gestion de Incidentes | Administracion',
  description: 'Añadir notas de analista a incidentes activos.',
  robots: { index: false, follow: false },
};

export default function AdminIncidentsPage() {
  return <AdminIncidents />;
}
