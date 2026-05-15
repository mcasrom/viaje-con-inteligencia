import Link from 'next/link';
import { getTodosLosPaises } from '@/data/paises';
import { getPostsPagination } from '@/lib/posts';
import DetallePaisClient from './DetallePaisClient';

export const revalidate = 86400;

export function generateStaticParams() {
  return getTodosLosPaises().map(p => ({ codigo: p.codigo }));
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const pais = getTodosLosPaises().find(p => p.codigo === codigo);
  return {
    title: `${pais?.nombre || codigo} — Riesgo, Visado y Consejos | Viaje Inteligencia`,
    description: `Ficha completa de ${pais?.nombre}: nivel de riesgo MAEC, visado, clima, transporte, POIs y recomendaciones IA.`,
    keywords: `viajar a ${pais?.nombre}, riesgo ${pais?.nombre}, visado ${pais?.nombre}, consejos viaje ${pais?.nombre}, seguridad ${pais?.nombre}, embajada ${pais?.nombre}, turismo ${pais?.nombre}`,
    alternates: {
      canonical: `https://www.viajeinteligencia.com/pais/${codigo}`,
    },
    openGraph: {
      title: `${pais?.nombre} — Riesgo, Visado y Consejos`,
      description: `Ficha completa de ${pais?.nombre}: nivel de riesgo MAEC, visado, clima y recomendaciones.`,
      url: `https://www.viajeinteligencia.com/pais/${codigo}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pais?.nombre} — Riesgo, Visado y Consejos | Viaje Inteligencia`,
      description: `Ficha completa de ${pais?.nombre}: nivel de riesgo MAEC, visado, clima y recomendaciones.`,
      creator: '@ViajeIntel2026',
    },
  };
}

export default async function PaisPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const pais = getTodosLosPaises().find(p => p.codigo === codigo);

  if (!pais) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">País no encontrado</h1>
          <Link href="/" className="text-blue-400 hover:underline">Volver al mapa →</Link>
        </div>
      </div>
    );
  }

  const { posts: relatedPosts } = getPostsPagination(1, 3, { category: pais.nombre, sort: 'recent' });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: pais.nombre,
    description: `Guía completa de viaje a ${pais.nombre}: nivel de riesgo MAEC ${pais.nivelRiesgo}, visado, clima, transporte, POIs y recomendaciones IA para viajeros.`,
    url: `https://www.viajeinteligencia.com/pais/${codigo}`,
    ...(pais.bandera ? { photo: pais.bandera } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1 className="sr-only">Guía de viaje a {pais.nombre}: riesgo MAEC, visado, seguridad y consejos para viajeros</h1>
      <DetallePaisClient pais={pais} relatedPosts={relatedPosts} />
    </>
  );
}
