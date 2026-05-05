import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Dashboard | Favoritos y Viajes - Viaje con Inteligencia',
  description: 'Tu panel personal: países favoritos, alertas de viaje, clima y recomendaciones personalizadas.',
  openGraph: {
    title: 'Mi Dashboard | Viaje con Inteligencia',
    description: 'Gestiona tus favoritos y recibe alertas de viaje.',
    url: 'https://www.viajeinteligencia.com/dashboard',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/dashboard',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
