import type { Metadata } from 'next';
import PaisesAdminClient from './PaisesAdminClient';

export const metadata: Metadata = {
  title: 'Admin Países | Viaje con Inteligencia',
  description: 'Gestionar datos de países',
  robots: { index: false, follow: false },
};

export default function AdminPaisesPage() {
  return <PaisesAdminClient />;
}
