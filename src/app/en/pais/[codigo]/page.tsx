import Link from 'next/link';
import { getTodosLosPaises } from '@/data/paises';
import { getPostsPagination } from '@/lib/posts';
import { NOMBRES_EN } from '@/data/nombres-en';
import DetallePaisClient from '@/app/pais/[codigo]/DetallePaisClient';
import OsintSignalsWidget from '@/components/OsintSignalsWidget';

export const revalidate = 86400;

export function generateStaticParams() {
  return getTodosLosPaises().map(p => ({ codigo: p.codigo }));
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const pais = getTodosLosPaises().find(p => p.codigo === codigo);
  const nombreEn = NOMBRES_EN[codigo] || pais?.nombre || codigo;
  return {
    title: `${nombreEn} — Travel Risk, Visa & Tips | Viaje Inteligencia`,
    description: `Complete travel guide for ${nombreEn}: MAEC risk level, visa requirements, climate, transportation, POIs and AI recommendations.`,
    keywords: `travel to ${nombreEn}, ${nombreEn} risk, ${nombreEn} visa, travel tips ${nombreEn}, ${nombreEn} safety, ${nombreEn} embassy, tourism ${nombreEn}`,
    alternates: {
      canonical: `https://www.viajeinteligencia.com/en/pais/${codigo}`,
      languages: {
        'es': 'https://www.viajeinteligencia.com/pais/' + codigo,
        'en': 'https://www.viajeinteligencia.com/en/pais/' + codigo,
      },
    },
    openGraph: {
      images: [{ url: '/preview_favicon.jpg', width: 1200, height: 630 }],
      title: `${nombreEn} — Travel Risk, Visa & Tips`,
      description: `Complete travel guide for ${nombreEn}: MAEC risk level, visa requirements, climate and recommendations.`,
      url: `https://www.viajeinteligencia.com/en/pais/${codigo}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${nombreEn} — Travel Risk, Visa & Tips | Viaje Inteligencia`,
      description: `Complete travel guide for ${nombreEn}: MAEC risk level, visa requirements, climate and recommendations.`,
      creator: '@ViajeIntel2026',
    },
  };
}

const riesgoConfig: Record<string, { label: string; description: string }> = {
  'sin-riesgo': { label: 'No risk', description: 'No specific risks. Travel with normal precautions.' },
  'bajo': { label: 'Low risk', description: 'Low risk. Normal precautions recommended.' },
  'medio': { label: 'Medium risk', description: 'Moderate risk. Exercise increased caution.' },
  'alto': { label: 'High risk', description: 'High risk. Non-essential travel discouraged.' },
  'muy-alto': { label: 'Very high risk', description: 'Very high risk. All travel advised against.' },
};

export default async function EnPaisPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const pais = getTodosLosPaises().find(p => p.codigo === codigo);
  const nombreEn = NOMBRES_EN[codigo] || pais?.nombre || codigo;

  if (!pais) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Country not found</h1>
          <Link href="/en" className="text-blue-400 hover:underline">Back to map →</Link>
        </div>
      </div>
    );
  }

  const { posts: relatedPosts } = getPostsPagination(1, 3, { search: pais.nombre, sort: 'recent' });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: nombreEn,
    description: `Complete travel guide for ${nombreEn}: MAEC risk level, visa, climate, transport, POIs and AI recommendations.`,
    url: `https://www.viajeinteligencia.com/en/pais/${codigo}`,
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
                <h1 className="text-4xl font-bold text-white mb-1">{nombreEn}: travel risk, visa & tips</h1>
                <p className="text-slate-400">Capital: {pais.capital} • {pais.continente}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-4 py-2 rounded-xl bg-yellow-500 text-white font-bold text-sm">{config.label}</span>
            </div>
            <p className="text-slate-300 text-sm mb-4">{config.description}</p>
            <p className="text-slate-500 text-xs">MAEC data: {pais.ultimoInforme}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {pais.idioma && <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Language</p><p className="text-white font-medium">{pais.idioma}</p></div>}
            {pais.moneda && <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Currency</p><p className="text-white font-medium">{pais.moneda}</p></div>}
            {pais.poblacion && <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Population</p><p className="text-white font-medium">{pais.poblacion}</p></div>}
            {pais.zonaHoraria && <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Timezone</p><p className="text-white font-medium">{pais.zonaHoraria}</p></div>}
          </div>

          {pais.requerimientos && pais.requerimientos.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">Entry requirements</h2>
              {pais.requerimientos.slice(0, 3).map((req: any, i: number) => (
                <div key={i} className="mb-3">
                  <p className="text-amber-400 font-medium text-sm mb-1">{req.icon} {req.categoria}</p>
                  {req.items.slice(0, 3).map((item: string, j: number) => (
                    <p key={j} className="text-slate-300 text-sm ml-5">• {item}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {pais.contactos && pais.contactos.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">Consulate / Embassy</h2>
              <div className="text-slate-300 text-sm">
                <p className="font-medium text-white">{pais.contactos[0].nombre}</p>
                {pais.contactos[0].direccion && <p className="mt-1">{pais.contactos[0].direccion}</p>}
                {pais.contactos[0].telefono && <p className="mt-1">Tel: {pais.contactos[0].telefono}</p>}
              </div>
            </div>
          )}

          {pais.queHacer && pais.queHacer.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">What to do in {nombreEn}</h2>
              <ul className="space-y-1">
                {pais.queHacer.slice(0, 5).map((item: string, i: number) => (
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
        <OsintSignalsWidget countryCode={codigo} countryName={nombreEn} />
      </div>
    </>
  );
}
