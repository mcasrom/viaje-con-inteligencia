import { notFound } from 'next/navigation';
import { getPaisPorCodigo } from '@/data/paises';
import { getPostsByCountry, getSeoClusterContent } from '@/lib/posts';
import DetallePaisClient from './DetallePaisClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateCountryArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/schemas';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ codigo: string }>;
}

export async function generateStaticParams() {
  const { getTodosLosPaises } = await import('@/data/paises');
  const paises = getTodosLosPaises().filter(p => p.codigo !== 'cu');
  return paises.map((pais) => ({ codigo: pais.codigo }));
}

export async function generateMetadata({ params }: PageProps) {
  const { codigo } = await params;
  
  if (codigo === 'cu') {
    return { title: 'No disponible | Viaje con Inteligencia' };
  }
  
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
  
  if (codigo === 'cu') {
    notFound();
  }
  
  const pais = getPaisPorCodigo(codigo);

  if (!pais) {
    notFound();
  }

  const relatedPosts = getPostsByCountry(pais.nombre, 3);

  // JSON-LD Schemas para SEO
  const riesgoLabels: Record<string, string> = {
    'sin-riesgo': 'sin riesgo',
    'bajo': 'riesgo bajo',
    'medio': 'riesgo medio',
    'alto': 'riesgo alto',
    'muy-alto': 'riesgo muy alto'
  };
  const riesgoTexto = riesgoLabels[pais.nivelRiesgo] || pais.nivelRiesgo;

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Inicio', url: 'https://www.viajeinteligencia.com' },
    { name: 'Países', url: 'https://www.viajeinteligencia.com/paises' },
    { name: pais.nombre, url: `https://www.viajeinteligencia.com/pais/${codigo}` }
  ]);

  const articleSchema = generateCountryArticleSchema({
    name: pais.nombre,
    slug: codigo,
    description: `Guía completa para viajar a ${pais.nombre}: requisitos de entrada, nivel de riesgo ${riesgoTexto}, embajadas, moneda ${pais.moneda} y consejos para viajeros.`,
    lastUpdated: pais.ultimoInforme
  });

  const faqSchema = generateFAQSchema([
    { 
      question: `¿Necesito visa para viajar a ${pais.nombre}?`, 
      answer: `Consulta los requisitos de entrada actualizados para ${pais.nombre} en nuestra guía. Los requisitos pueden variar según tu nacionalidad.`
    },
    { 
      question: `¿Es seguro viajar a ${pais.nombre}?`, 
      answer: `${pais.nombre} tiene actualmente un nivel de riesgo ${riesgoTexto} según el MAEC. Te recomendamos revisar las alertas y consejos de seguridad actualizados.`
    },
    { 
      question: `¿Cuál es la moneda de ${pais.nombre}?`, 
      answer: `La moneda oficial de ${pais.nombre} es ${pais.moneda}. Te recomendamos consultar el tipo de cambio actual antes de viajar.`
    },
    { 
      question: `¿Qué idioma se habla en ${pais.nombre}?`, 
      answer: `El idioma oficial de ${pais.nombre} es ${pais.idioma}. En zonas turísticas suele haber hablantes de inglés.`
    }
  ]);

  return (
    <>
      <JsonLd data={[breadcrumbs, articleSchema, faqSchema]} />
      <DetallePaisClient pais={pais} relatedPosts={relatedPosts} />
    </>
  );
}
