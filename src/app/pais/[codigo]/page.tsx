import { notFound } from 'next/navigation';
import { getPaisPorCodigo } from '@/data/paises';
import DetallePaisClient from './DetallePaisClient';

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

  return {
    title: `${pais.nombre} - Requisitos, ${riesgo} y consejos para viajar | Viaje con Inteligencia`,
    description: `Información actualizada sobre ${pais.nombre}: requisitos de entrada, nivel de riesgo ${riesgo}, embajadas, moneda, idioma y consejos para viajeros. Datos del MAEC español.`,
    keywords: `viajar a ${pais.nombre}, ${pais.nombre} requisitos entrada, riesgo ${pais.nombre}, seguro viaje ${pais.nombre}, embajadas ${pais.nombre},${pais.continente} viaje`,
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

  return <DetallePaisClient pais={pais} />;
}