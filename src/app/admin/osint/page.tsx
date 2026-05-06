import type { Metadata } from 'next';
import OsintDashboard from './OsintDashboard';

export const metadata: Metadata = {
  title: 'OSINT Sensor Dashboard | Administración',
  description: 'Monitor de señales OSINT en tiempo real desde redes sociales.',
  robots: { index: false, follow: false },
};

export default function AdminOsintPage() {
  return <OsintDashboard />;
}
