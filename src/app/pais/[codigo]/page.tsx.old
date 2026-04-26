import { notFound } from 'next/navigation';
import { getPaisPorCodigo } from '@/data/paises';
import { getPostsByCountry, getSeoClusterContent } from '@/lib/posts';
import DetallePaisClient from './DetallePaisClient';

export const revalidate = 3600; // ISR cada hora - cache de páginas países

interface PageProps {
  params: Promise<{ codigo: string }>;
}

export async function generateStaticParams() {
  const { getTodosLosPaises } = await import('@/data/paises');
  const paises = getTodosLosPaises();
  return paises.map((pais) => ({ codigo: pais.codigo }));
}

export async function generateMetadata({ params }: PageProps) {
  const { codigo } = await params;
  const pais = getPaisPorCodigo(codigo);
  
  if (!pais) {
    return { title: 'País no encontrado | Viaje con Inteligencia' };
  }

  const riesgoLabels: Record<string, string> = {
    'sin-riesgo': 'sin riesgo',
    'bajo': 'riesgo bajo',
    'medio': 'riesgo medio',
    'alto': 'riesgo alto',
    'muy-alto': 'riesgo muy alto'
  };
  const riesgo = riesgoLabels[pais.nivelRiesgo] || 'riesgo';
  const seoCluster = getSeoClusterContent(pais.nombre, pais.nivelRiesgo);

  return {
    title: `${pais.nombre} - Requisitos, ${riesgo} y consejos para viajar | Viaje con Inteligencia`,
    description: `Información actualizada sobre ${pais.nombre}: requisitos de entrada, nivel de riesgo ${riesgo}, embajadas, moneda, idioma y consejos para viajeros. Datos del MAEC español.`,
    keywords: [
      `viajar a ${pais.nombre}`,
      `${pais.nombre} requisitos entrada`,
      `riesgo ${pais.nombre}`,
      `${pais.continente} viaje`,
      pais.moneda,
      pais.idioma,
      `países ${pais.nivelRiesgo}`,
      `consejos viajeros ${pais.nombre}`,
      `embajada Madrid ${pais.nombre}`,
      ...seoCluster.longTailKeywords,
    ].join(', '),
    alternates: {
      canonical: `https://www.viajeinteligencia.com/pais/${codigo}`,
    },
    openGraph: {
      title: `${pais.nombre} - Guía completa para viajeros`,
      description: `Todo lo que necesitas saber antes de viajar a ${pais.nombre}: ${riesgo}, requisitos, embajadas y más.`,
      type: 'article',
      publishedTime: pais.ultimoInforme,
    },
    other: {
      'geo.region': pais.continente,
      'geo.placename': pais.capital,
    }
  };
}

export default async function DetallePaisPage({ params }: PageProps) {
  const { codigo } = await params;
  const pais = getPaisPorCodigo(codigo);

  if (!pais) {
    notFound();
  }

  const relatedPosts = getPostsByCountry(pais.nombre, 3);

  return <DetallePaisClient pais={pais} relatedPosts={relatedPosts} />;
}