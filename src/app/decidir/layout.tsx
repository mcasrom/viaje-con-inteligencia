import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Decidir Destino | Encuentra tu Viaje Ideal - Viaje con Inteligencia',
  description: '¿No sabes a dónde ir? Selecciona tus intereses y te sugerimos el destino perfecto según seguridad, coste y clima.',
  openGraph: {
    title: 'Decidir Destino | Viaje con Inteligencia',
    description: 'Encuentra tu destino ideal con IA.',
    url: 'https://www.viajeinteligencia.com/decidir',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/decidir',
  },
};

export default function DecidirLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
