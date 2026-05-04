import Link from 'next/link';
import { getTodosLosPaises } from '@/data/paises';
import { getTCIForAllCountries } from '@/data/tci-engine';

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Coste de Viaje por País — Índice TCI 2026',
    description: 'Compara cuánto cuesta viajar a cada país con el Índice de Coste de Viaje (TCI). Datos actualizados con demanda turística, petróleo, estacionalidad e IPC.',
    alternates: {
      canonical: 'https://www.viajeinteligencia.com/viaje-coste',
    },
  };
}

export default function ViajeCosteListPage() {
  const allCountries = getTCIForAllCountries();
  const paises = getTodosLosPaises();
  const paisMap = Object.fromEntries(paises.map(p => [p.codigo, p]));

  const continentOrder = ['Europa', 'América del Norte', 'América Central', 'América del Sur', 'Caribe', 'Asia', 'África', 'Oriente Medio', 'Oceanía'];
  const byRegion = Object.entries(allCountries.reduce<Record<string, typeof allCountries>>((acc, c) => {
    const region = c.region || 'Otros';
    if (!acc[region]) acc[region] = [];
    acc[region].push(c);
    return acc;
  }, {}));

  byRegion.sort((a, b) => continentOrder.indexOf(a[0]) - continentOrder.indexOf(b[0]));

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Índice de Coste de Viaje
          </h1>
          <p className="text-slate-400">
            Comparador de coste por país · {allCountries.length} destinos · Actualizado {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-slate-400">TCI &lt; 90 (barato)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-400">TCI 90-110 (medio)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-slate-400">TCI &gt; 110 (caro)</span>
            </div>
          </div>
        </div>

        <section className="bg-slate-800/60 rounded-2xl p-6 md:p-8 border border-slate-700 mb-12">
          <h2 className="text-xl font-bold text-white mb-4">¿Cómo se calcula el TCI?</h2>
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-slate-300 leading-relaxed">
              El <strong className="text-cyan-400">Travel Cost Index (TCI)</strong> es un índice propio que estima el coste relativo de viajar a cada destino
              respecto a una base de 100. No mide precios absolutos, sino <strong className="text-white">cuán caro o barato está un destino en este momento</strong>
              comparado con su comportamiento histórico.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-white font-semibold mb-2">Los 5 factores que componen el TCI</h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-purple-400 font-bold shrink-0">30%</span>
                    <div>
                      <strong className="text-white">Demanda turística</strong>
                      <p className="text-slate-400 text-xs mt-1">Basada en datos INE de llegadas internacionales. Un país con alta demanda relativa eleva el índice.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-orange-400 font-bold shrink-0">25%</span>
                    <div>
                      <strong className="text-white">Petróleo Brent</strong>
                      <p className="text-slate-400 text-xs mt-1">El precio del barril incide directamente en los billetes de avión. Comparamos el precio actual con la media histórica de 2024-2025.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold shrink-0">25%</span>
                    <div>
                      <strong className="text-white">Estacionalidad</strong>
                      <p className="text-slate-400 text-xs mt-1">Cada destino tiene patrones de temporada alta/baja. Viajar en agosto a Grecia no cuesta lo mismo que en noviembre.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold shrink-0">10%</span>
                    <div>
                      <strong className="text-white">IPC del país</strong>
                      <p className="text-slate-400 text-xs mt-1">La inflación local afecta al coste de alojamiento, comida y transporte en destino.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-400 font-bold shrink-0">10%</span>
                    <div>
                      <strong className="text-white">Riesgo MAEC</strong>
                      <p className="text-slate-400 text-xs mt-1">Zonas con mayor riesgo geopolítico suelen tener menos oferta y precios más volátiles.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Cómo interpretar el resultado</h3>
                <div className="space-y-3">
                  <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-3">
                    <p className="text-emerald-400 font-bold text-sm">TCI &lt; 90 · Bajista</p>
                    <p className="text-slate-300 text-xs mt-1">El destino está por debajo de su precio medio. Buen momento para reservar.</p>
                  </div>
                  <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3">
                    <p className="text-amber-400 font-bold text-sm">TCI 90-110 · Estable</p>
                    <p className="text-slate-300 text-xs mt-1">Precios en línea con la media histórica. Sin urgencia, pero tampoco ganga.</p>
                  </div>
                  <div className="bg-rose-900/30 border border-rose-700/50 rounded-lg p-3">
                    <p className="text-rose-400 font-bold text-sm">TCI &gt; 110 · Alcista</p>
                    <p className="text-slate-300 text-xs mt-1">Temporada alta o factores externos encarecen el viaje. Considera fechas alternativas.</p>
                  </div>
                </div>

                <h3 className="text-white font-semibold mb-2 mt-6">Nuestra aproximación</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  No tenemos acceso a la API de Amadeus (registro bloqueado), por lo que el TCI se construye con datos públicos:
                  estadísticas del INE, histórico de petróleo Brent (EIA), patrones de estacionalidad turística, IPC por país
                  y niveles de riesgo del MAEC. El índice se actualiza mensualmente y usa regresión lineal para proyectar tendencias
                  a 4 y 12 semanas. Es una aproximación estadística, no una cotización exacta de aerolínea.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-emerald-400">↓</span>
              Más baratos
            </h2>
            <div className="space-y-2">
              {allCountries.slice(0, 8).map((c, i) => (
                <DestinoRow key={c.code} c={c} pais={paisMap[c.code]} index={i} cheap />
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-rose-400">↑</span>
              Más caros
            </h2>
            <div className="space-y-2">
              {allCountries.slice(-8).reverse().map((c, i) => (
                <DestinoRow key={c.code} c={c} pais={paisMap[c.code]} index={i} expensive />
              ))}
            </div>
          </div>
        </div>

        {byRegion.map(([region, countries]) => (
          <section key={region} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">{region}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {countries.map((c) => (
                <Link
                  key={c.code}
                  href={`/viaje-coste/${c.code}`}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{paisMap[c.code]?.bandera || '🌍'}</span>
                    <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-lg ${
                      c.tci < 90 ? 'text-emerald-400' : c.tci < 110 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {c.tci}
                    </span>
                    <span className="text-slate-500 text-xs">{c.trend}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function DestinoRow({ c, pais, index, cheap, expensive }: { c: any; pais: any; index: number; cheap?: boolean; expensive?: boolean }) {
  return (
    <Link
      href={`/viaje-coste/${c.code}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <span className="text-slate-500 text-sm w-5">{index + 1}</span>
        <span className="text-lg">{pais?.bandera || '🌍'}</span>
        <span className="text-white group-hover:text-cyan-400 transition-colors">{c.name}</span>
      </div>
      <span className={`font-bold ${
        cheap ? 'text-emerald-400' : expensive ? 'text-rose-400' : 'text-white'
      }`}>
        {c.tci}
      </span>
    </Link>
  );
}
