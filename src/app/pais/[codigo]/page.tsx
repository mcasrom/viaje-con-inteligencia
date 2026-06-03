import Link from 'next/link';
import { getTodosLosPaises } from '@/data/paises';
import { getPostsPagination } from '@/lib/posts';
import DetallePaisClient from './DetallePaisClient';
import OsintSignalsWidget from '@/components/OsintSignalsWidget';

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
      languages: {
        'es': 'https://www.viajeinteligencia.com/pais/' + codigo,
        'en': 'https://www.viajeinteligencia.com/en/pais/' + codigo,
      },
    },
    openGraph: {
    images: [{ url: '/preview_favicon.jpg', width: 1200, height: 630 }],
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

const riesgoConfig: Record<string, { label: string; description: string }> = {
  'sin-riesgo': { label: 'Sin riesgo', description: 'No existen riesgos específicos. Puede viajarse con normalidad.' },
  'bajo': { label: 'Riesgo bajo', description: 'Riesgo bajo. Se recomienda tomar precauciones normales.' },
  'medio': { label: 'Riesgo medio', description: 'Riesgo moderado. Se recomienda extremar precauciones.' },
  'alto': { label: 'Riesgo alto', description: 'Riesgo alto. Se desaconsejan los viajes no esenciales.' },
  'muy-alto': { label: 'Riesgo muy alto', description: 'Riesgo muy alto. Se desaconsejan todos los viajes.' },
};

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

  const { posts: relatedPosts } = getPostsPagination(1, 3, { search: pais.nombre, sort: 'recent' });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: pais.nombre,
    description: `Guía completa de viaje a ${pais.nombre}: nivel de riesgo MAEC ${pais.nivelRiesgo}, visado, clima, transporte, POIs y recomendaciones IA para viajeros.`,
    url: `https://www.viajeinteligencia.com/pais/${codigo}`,
    ...(pais.bandera ? { photo: pais.bandera } : {}),
  };

  const config = riesgoConfig[pais.nivelRiesgo] || riesgoConfig['bajo'];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-7xl">{pais.bandera}</span>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Guía de {pais.nombre}: riesgo MAEC, visado y consejos</h1>
                <p className="text-slate-400">Capital: {pais.capital} • {pais.continente}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-4 py-2 rounded-xl bg-yellow-500 text-white font-bold text-sm">{config.label}</span>
            </div>
            <p className="text-slate-300 text-sm mb-4">{config.description}</p>
            <p className="text-slate-500 text-xs">Datos MAEC: {pais.ultimoInforme}</p>
          </div>

          <div className="max-w-3xl mx-auto my-6 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">🔔 Recibe alertas si cambia el nivel de riesgo</p>
              <p className="text-slate-400 text-xs mt-1">Monitorización continua con fuentes MAEC y OSINT</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href="/alertas" className="text-sm px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">Newsletter gratis</a>
              <a href="/free-trial" className="text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors">7 días gratis →</a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {pais.idioma && <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Idioma</p><p className="text-white font-medium">{pais.idioma}</p></div>}
            {pais.moneda && <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Moneda</p><p className="text-white font-medium">{pais.moneda}</p></div>}
            {pais.poblacion && <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Población</p><p className="text-white font-medium">{pais.poblacion}</p></div>}
            {pais.zonaHoraria && <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Zona horaria</p><p className="text-white font-medium">{pais.zonaHoraria}</p></div>}
          </div>

          {pais.requerimientos && pais.requerimientos.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">Requisitos de entrada</h2>
              {pais.requerimientos.slice(0, 3).map((req, i) => (
                <div key={i} className="mb-3">
                  <p className="text-amber-400 font-medium text-sm mb-1">{req.icon} {req.categoria}</p>
                  {req.items.slice(0, 3).map((item, j) => (
                    <p key={j} className="text-slate-300 text-sm ml-5">• {item}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {pais.contactos && pais.contactos.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">Consulado / Embajada</h2>
              <div className="text-slate-300 text-sm">
                <p className="font-medium text-white">{pais.contactos[0].nombre}</p>
                {pais.contactos[0].direccion && <p className="mt-1">{pais.contactos[0].direccion}</p>}
                {pais.contactos[0].telefono && <p className="mt-1">Tel: {pais.contactos[0].telefono}</p>}
              </div>
            </div>
          )}

          {pais.queHacer && pais.queHacer.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">Qué hacer en {pais.nombre}</h2>
              <ul className="space-y-1">
                {pais.queHacer.slice(0, 5).map((item, i) => (
                  <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DetallePaisClient pais={pais} relatedPosts={relatedPosts} serverRenderedHero />
        <OsintSignalsWidget countryCode={codigo} countryName={pais.nombre} />
      </div>
    </>
  );
}
