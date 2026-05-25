import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const { codigo } = await params;
  return {
    alternates: {
      canonical: `https://www.viajeinteligencia.com/pais/${codigo}`,
    },
  };
}

export default function ClimaDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
