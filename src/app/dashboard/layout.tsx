import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Dashboard | Favoritos y Viajes - Viaje con Inteligencia',
  description: 'Tu panel personal: países favoritos, alertas de viaje, clima y recomendaciones personalizadas.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
