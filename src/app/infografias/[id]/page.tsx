import type { Metadata } from 'next';
import { getInfografiaById } from '@/lib/infografia/generate';
import InfografiaDetailClient from './page.client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const infografia = await getInfografiaById(id);
  if (!infografia) return { title: 'Infografía no encontrada' };

  const data = infografia.data_snapshot as any;
  const countries = infografia.top_risk_countries?.slice(0, 5).join(', ') || '';
  const gwi = infografia.gwi_score?.toFixed(1) || '';

  return {
    title: `${infografia.title} | Viaje con Inteligencia`,
    description: `Edición #${infografia.edition} — GWI: ${gwi}. Países de mayor riesgo: ${countries}. Análisis semanal OSINT de riesgos globales de viaje.`,
    keywords: [
      `infografía ${infografia.edition}`,
      'riesgo global viajes',
      'GWI semanal',
      `análisis OSINT ${infografia.week_start}`,
      ...(infografia.top_risk_countries || []).map((c: string) => c.toLowerCase()),
      'seguridad viajeros',
      'riesgo países',
    ],
    openGraph: {
      title: `${infografia.title}: GWI ${gwi}`,
      description: `${infografia.week_start} — ${infografia.week_end}. Países más riesgosos: ${countries}.`,
      url: `https://www.viajeinteligencia.com/infografias/${id}`,
      type: 'article',
      publishedTime: infografia.published_at,
      images: infografia.image_url ? [{ url: infografia.image_url, width: 1200, height: 1800 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: infografia.title,
      description: `GWI: ${gwi} | ${countries}`,
      creator: '@ViajeIntel2026',
      images: infografia.image_url ? [infografia.image_url] : [],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const infografia = await getInfografiaById(id);
  return <InfografiaDetailClient infografia={infografia} />;
}
