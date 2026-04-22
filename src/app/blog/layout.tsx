import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog de Viajes | Viaje con Inteligencia',
  description: 'Consejos prácticos, guías de destinos y análisis de riesgos para planificar tus viajes con seguridad.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}