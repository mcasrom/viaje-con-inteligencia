import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Database, Newspaper, Shield, AlertTriangle, BarChart3, Heart, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fuentes OSINT | Datos que usamos - Viaje con Inteligencia',
  description: 'Lista completa de fuentes OSINT y datos abiertos utilizados para analizar riesgos de viaje y recomendaciones.',
  openGraph: {
    title: 'Fuentes OSINT | Viaje con Inteligencia',
    url: 'https://www.viajeinteligencia.com/fuentes-osint',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/fuentes-osint',
  },
};

const SOURCES = [
  {
    category: 'Riesgo y Seguridad',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    items: [
      { name: 'MAEC España', desc: 'Recomendaciones de viaje oficiales del Ministerio de Asuntos Exteriores', url: 'https://www.exteriores.gob.es' },
      { name: 'Global Peace Index (IEP)', desc: 'Índice de paz global por país y región', url: 'https://www.visionofhumanity.org' },
      { name: 'Global Terrorism Index', desc: 'Impacto del terrorismo mundial', url: 'https://www.visionofhumanity.org' },
      { name: 'US State Dept Travel Advisories', desc: 'Alertas de viaje del Departamento de Estado de EE.UU. (doble validación)', url: 'https://travel.state.gov' },
    ],
  },
  {
    category: 'Datos de Viaje',
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    items: [
      { name: 'World Bank Open Data', desc: 'Indicadores económicos: IPC, PIB, población por país', url: 'https://data.worldbank.org' },
      { name: 'UNDP Human Development', desc: 'Índice de Desarrollo Humano (HDI)', url: 'https://hdr.undp.org' },
      { name: 'UN Tourism (UNWTO)', desc: 'Estadísticas internacionales de turismo', url: 'https://www.unwto.org' },
      { name: 'Open-Meteo', desc: 'Pronóstico meteorológico gratuito y en vivo para cualquier destino', url: 'https://open-meteo.com' },
      { name: 'OpenStreetMap Overpass API', desc: 'Puntos de interés (POIs): hoteles, restaurantes, atracciones por país', url: 'https://overpass-api.de' },
      { name: 'Wikidata', desc: 'Datos estructurados para eventos disruptivos y POIs enriquecidos', url: 'https://www.wikidata.org' },
    ],
  },
  {
    category: 'Salud Global',
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    items: [
      { name: 'WHO Global Health Observatory', desc: 'Datos de salud mundial: tuberculosis, VIH, vacunación, gasto sanitario', url: 'https://www.who.int/data/global-health-observatory' },
      { name: 'WHO Disease Outbreak News', desc: 'Alertas de brotes epidémicos: Ebola, Marburg, Nipah, viruela del mono, cólera (API OData)', url: 'https://www.who.int/publications/i/item/disease-outbreak-news' },
      { name: 'USGS Earthquake Hazards', desc: 'Actividad sísmica en tiempo real y alertas de tsunami', url: 'https://earthquake.usgs.gov' },
    ],
  },
  {
    category: 'Conflictos y Alertas',
    icon: AlertTriangle,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    items: [
      { name: 'ACLED', desc: 'Armed Conflict Location & Event Data - Conflictos en tiempo real', url: 'https://acleddata.com' },
      { name: 'ReliefWeb', desc: 'Emergencias humanitarias y desastres naturales (ONU/OCHA)', url: 'https://reliefweb.int' },
      { name: 'GDACS', desc: 'Global Disaster Alert and Coordination System', url: 'https://www.gdacs.org' },
    ],
  },
  {
    category: 'Noticias y Sentimiento',
    icon: Newspaper,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    items: [
      { name: 'GDELT Project', desc: 'Monitor de noticias globales en 100+ idiomas. Análisis de sentimiento automático (tone_score)', url: 'https://www.gdeltproject.org' },
      { name: 'RSS (10 fuentes)', desc: 'AP, BBC Breaking, Sky News, Reuters, Al Jazeera y más — filtrado por keywords de viaje', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
      { name: 'Reddit (r/travel, r/solotravel, r/digitalnomad)', desc: 'Experiencias de viajeros en primera persona. Clasificación semántica con Groq AI', url: 'https://www.reddit.com' },
    ],
  },
  {
    category: 'Transporte',
    icon: Activity,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    items: [
      { name: 'OpenSky Network', desc: 'Datos de tráfico aéreo en tiempo real — detección de cierres de espacio aéreo en zonas de conflicto', url: 'https://opensky-network.org' },
      { name: 'Oil Price APIs', desc: 'Precios del petróleo Brent y WTI (impacto directo en coste de vuelos y TCI)', url: 'https://oilpriceapi.com' },
    ],
  },
];

export default function FuentesOSINTPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Fuentes OSINT</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Todas las fuentes de datos abiertos e inteligencia de fuentes abiertas que utilizamos para analizar riesgos de viaje y generar recomendaciones.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {SOURCES.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.category} className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-5 border-b border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${section.color}`} />
                    <h2 className="text-xl font-bold text-white">{section.category}</h2>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {section.items.map(item => (
                    <div key={item.name} className="bg-slate-700/20 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-white font-semibold text-sm">{item.name}</h3>
                          <p className="text-slate-400 text-xs mt-1">{item.desc}</p>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs flex-shrink-0 flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          Visitar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Methodology note */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Cómo procesamos los datos</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            El sistema procesa estas fuentes de la siguiente manera:
          </p>
          <div className="space-y-3">
            {[
              'Scraping automatizado de recomendaciones MAEC + US State Dept (diario, 06:00 UTC)',
              'Ingesta de APIs públicas: WHO DON, WHO GHO, USGS, World Bank, Open-Meteo, OpenSky',
              'OSINT sensor: GDELT, RSS (10 fuentes), Reddit — clasificación con Groq AI',
              'Detección de incidentes: clusterización de señales por tipo + ubicación',
              'Puntos de interés vía OpenStreetMap Overpass API + Wikidata',
              'Normalización de códigos ISO2 para cruce de datos entre fuentes',
              'Cálculo del índice TCI con datos vivos (petróleo, estacionalidad, espacio aéreo)',
              'Análisis de sentimiento: tone_score propagado a incidentes y modelo ML',
              'Early Bird digest: resumen matutino (07:00 UTC) con health, tráfico, incidentes',
              'Publicación social: Telegram, Mastodon, Bluesky, newsletter semanal',
              'Infografías semanales de riesgo generadas por IA',
              'Retención automática: histórico MAEC purgado a 90 días',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                <div className="w-6 h-6 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/metodologia" className="text-blue-400 hover:text-blue-300 text-sm">
            Ver metodología completa →
          </Link>
        </div>
      </div>
    </div>
  );
}
