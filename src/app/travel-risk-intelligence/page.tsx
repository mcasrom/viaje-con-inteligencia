import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Globe, Brain, AlertTriangle, BarChart3, FileText, Database, TrendingUp, Bell, Map, Plane, Users, ArrowRight, CheckCircle, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Travel Risk Intelligence | Inteligencia de Riesgo para Viajes',
  description: 'Plataforma de inteligencia de riesgo de viaje que combina datos oficiales MAEC, OSINT, Machine Learning y análisis predictivo para viajeros conscientes. 136 países monitorizados en tiempo real.',
  openGraph: {
    title: 'Travel Risk Intelligence | Viaje con Inteligencia',
    description: 'Datos oficiales, señales OSINT y análisis predictivo combinados en una plataforma para viajar informado. Alertas, radar y predicciones ML.',
    url: 'https://www.viajeinteligencia.com/travel-risk-intelligence',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Risk Intelligence | Viaje con Inteligencia',
    description: 'Datos oficiales, señales OSINT y análisis predictivo combinados en una plataforma para viajar informado.',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/travel-risk-intelligence',
  },
  keywords: ['travel risk intelligence', 'inteligencia riesgo viaje', 'seguridad viajera', 'análisis riesgo destino', 'MAEC viajeros', 'OSINT turismo', 'predictor riesgo viaje', 'alertas viaje inteligentes', 'radar viaje riesgo'],
};

const SECTIONS = [
  {
    id: 'que-es',
    title: '¿Qué es Travel Risk Intelligence?',
    content: `Travel Risk Intelligence (TRI) es la disciplina que combina datos oficiales de seguridad, señales de fuentes abiertas (OSINT) y análisis predictivo para evaluar y anticipar los riesgos asociados a un destino de viaje.

A diferencia de las recomendaciones genéricas, TRI aplica un enfoque multicapa que cruza fuentes diplomáticas, indicadores sociopolíticos, patrones históricos y datos en tiempo real. Cada destino se evalúa no solo por su nivel de riesgo actual, sino por su tendencia, estacionalidad y contexto geopolítico.

Mientras que webs de viajes tradicionales ofrecen recomendaciones estáticas basadas en continentes o regiones, TRI proporciona inteligencia dinámica que se actualiza diariamente: el nivel de riesgo de un país puede cambiar por una protesta, un brote sanitario, un desastre natural o una escalada diplomática. La diferencia entre viajar informado y viajar a ciegas son los datos.`,
  },
  {
    id: 'fuentes',
    title: 'Fuentes de datos',
    content: `La plataforma integra tres capas de datos que se cruzan y validan mutuamente:

La capa diplomática incluye las recomendaciones oficiales del Ministerio de Asuntos Exteriores de España (MAEC) y los Travel Advisories del Departamento de Estado de EE.UU. Esta doble validación permite detectar discrepancias entre fuentes oficiales y ofrecer una visión más completa. Cuando una fuente sube el nivel y otra no, el sistema lo señala como anomalía.

La capa OSINT agrega señales de 14 fuentes abiertas: GDELT para sentimiento global, RSS de agencias internacionales (AP, BBC, Sky News, Reuters World), Reddit para experiencias de primera mano de viajeros, USGS para actividad sísmica, GDACS para desastres naturales, WHO Disease Outbreak News para brotes epidémicos, OpenSky para monitoreo de espacio aéreo y ReliefWeb para emergencias humanitarias.

La capa analítica procesa estas señales con algoritmos de clasificación y modelos predictivos para generar alertas tempranas y proyecciones de riesgo. Las señales se clusterizan en incidentes cuando múltiples fuentes independientes coinciden en ubicación y tipo de evento.`,
  },
  {
    id: 'metodologia',
    title: 'Metodología de análisis',
    content: `Cada país se evalúa en cuatro dimensiones principales:

El riesgo de seguridad se calcula a partir del nivel MAEC y US State Dept, ajustado por estacionalidad turística y eventos disruptivos activos. No es una foto fija: el riesgo evoluciona con cada nueva señal OSINT. Si hay protestas en un país, el nivel puede subir temporalmente aunque la recomendación oficial no haya cambiado.

El índice de coste (TCI) combina el precio real del petróleo Brent, cierres de espacio aéreo, demanda turística estacional e inflación local. Se actualiza diariamente con datos de Yahoo Finance para el petróleo y Frankfurter API para tipos de cambio.

El índice de saturación turística (IST) mide la presión turística sobre cada destino usando datos de llegadas, pernoctaciones y estancia media del INE y fuentes oficiales de turismo.

El score de viaje personalizado cruza estas dimensiones con el perfil del viajero (mochilero, familiar, aventura, lujo o negocios) para recomendar destinos compatibles. Un mismo país puede tener distinto score para un mochilero que para un viajero de negocios.`,
  },
  {
    id: 'ml',
    title: 'Análisis predictivo con IA',
    content: `El sistema entrena modelos Random Forest por país con 25 features que incluyen: nivel de riesgo MAEC, tendencias a 7 y 30 días, índices globales (GPI, GTI, HDI, IPC), señales OSINT, incidentes activos, sentimiento GDELT y estacionalidad.

Cada modelo genera cuatro predicciones: score de riesgo compuesto (0-100) y probabilidad de aumento de riesgo a 7, 14 y 30 días. Los modelos se reentrenan diariamente y sus predicciones se comparan con el modelo heurístico para detectar desviaciones.

El sistema no reemplaza el juicio humano: las predicciones son una herramienta de apoyo que se complementa con el análisis de fuentes oficiales y el criterio del viajero. Cuando el modelo ML y el heurístico discrepan significativamente (más de 5 puntos de riesgo o 5% de probabilidad), se genera una alerta de desviación para revisión.`,
  },
  {
    id: 'osint',
    title: 'OSINT y monitorización en tiempo real',
    content: `El corazón del sistema es el pipeline de OSINT que opera 24/7 capturando, clasificando y correlacionando señales de múltiples fuentes:

La recolección ejecuta cada 6 horas un barrido completo de todas las fuentes. GDELT Global Knowledge Graph captura el tono mediático hacia cada país. Los feeds RSS de AP, BBC y Sky News proporcionan noticias breaking. Reddit (r/travel, r/solotravel, r/digitalnomad) aporta experiencias de primera mano de viajeros sobre el terreno.

La clasificación usa Groq (LLaMA 3.1 8B) para clasificar semánticamente cada señal en categorías: seguridad, salud, clima, transporte, conflicto. A cada señal se le asigna un tone_score de -10 a +10 y un nivel de urgencia.

La detección de incidentes agrupa señales coincidentes por ubicación, tipo y ventana temporal. Si dos o más fuentes independientes reportan el mismo tipo de evento en el mismo país en las últimas horas, se crea automáticamente un incidente con severidad asignada según el número de fuentes, el tone_score y la cercanía temporal.`,
  },
  {
    id: 'alertas',
    title: 'Sistema de alertas y notificaciones',
    content: `Cuando se detecta un cambio significativo, el sistema activa múltiples canales de notificación:

Alertas de cambio de riesgo: cuando un país sube o baja de nivel MAEC, se genera una alerta inmediata. Los suscriptores de ese país reciben notificación vía Telegram y ven el cambio reflejado en su dashboard.

Alertas de incidentes: cuando se detecta un incidente nuevo (protestas, terremoto, brote sanitario), los usuarios con ese país en su radar reciben una notificación con detalle del evento, fuentes y recomendaciones.

Alertas de sentimiento: cuando el tone_score de GDELT para un país cruza umbrales negativos (media 7 días por debajo de -5), se genera una alerta informativa. Si cruza -8, la alerta escala a precaución.

Digest semanal: cada lunes, los suscriptores del newsletter reciben un resumen con los cambios de riesgo más relevantes, incidentes detectados y predicciones para la semana.`,
  },
  {
    id: 'comparativa',
    title: 'Comparativa con otras fuentes de riesgo',
    content: `Travel Risk Intelligence no es el único recurso para evaluar riesgos de viaje, pero ofrece ventajas frente a las alternativas:

Las webs de recomendaciones oficiales (MAEC, US State Dept, Foreign Office) son la fuente más autorizada, pero suelen tener actualización lenta y cobertura genérica por país, sin granularidad por región o temporada.

Los agregadores de noticias (Google News, Feedly) ofrecen información actualizada pero requieren que el viajero filtre, interprete y corrobore manualmente cada fuente. No hay análisis cruzado ni detección automática de incidentes.

Las aseguradoras de viaje proporcionan alertas básicas, pero están limitadas a sus suscriptores y no ofrecen predicciones ni análisis multisectorial.

TRI combina lo mejor de cada enfoque: la autoridad de las fuentes diplomáticas, la inmediatez del OSINT, la profundidad del análisis predictivo y la personalización para el perfil del viajero.`,
  },
  {
    id: 'preguntas',
    title: 'Preguntas frecuentes',
    content: `¿Con qué frecuencia se actualizan los datos? Los niveles MAEC y US State Dept se actualizan diariamente. Las señales OSINT se procesan cada 6 horas. Los modelos ML se reentrenan cada noche. El TCI y el IST se actualizan cada 24 horas.

¿Travel Risk Intelligence es gratis? Sí, el mapa de riesgos, las fichas de país, el radar de viaje y el feed OSINT público son gratuitos. Las alertas personalizadas vía Telegram y el dashboard de KPIs requieren suscripción premium (4.99€/mes).

¿Puedo integrar los datos en mi propia aplicación? Sí, ofrezco una API REST pública con cuatro endpoints: riesgo por país, TCI, incidentes activos y catálogo de países. Plan gratuito con 3,000 requests/mes y planes de pago para mayor volumen.

¿Cubrís todos los países del mundo? Actualmente se monitorizan 136 países con fichas completas. Se priorizan los destinos más visitados por viajeros españoles y latinoamericanos. El mapa global muestra todos los países con su nivel MAEC.

¿Las predicciones por IA son fiables? Los modelos Random Forest tienen un MAE (Mean Absolute Error) de 0.82 puntos en score de riesgo. Las predicciones a 7 días son más fiables que las de 30 días. Recomendamos usar las predicciones como orientación, no como verdad absoluta.

¿Cómo puedo contribuir o reportar un error? Puedes escribir a colabs@viajeinteligencia.com. Aceptamos contribuciones OSINT, correcciones de datos y sugerencias de mejora.`,
  },
];

const FEATURES = [
  { icon: Shield, title: '136 países monitorizados', desc: 'Cada destino con ficha completa, riesgo MAEC+US, contactos y visados' },
  { icon: Bell, title: 'Alertas en tiempo real', desc: 'Cambios de riesgo, incidentes OSINT y notificaciones personalizadas vía Telegram' },
  { icon: Brain, title: 'Predicciones por IA', desc: 'Modelos Random Forest que anticipan cambios de riesgo a 7/14/30 días' },
  { icon: Globe, title: '14 fuentes OSINT', desc: 'GDELT, Reddit, RSS, USGS, GDACS, WHO, OpenSky y más en una sola plataforma' },
  { icon: BarChart3, title: 'KPIs y comparativas', desc: 'Índices de paz, terrorismo, desarrollo, inflación y coste lado a lado' },
  { icon: Map, title: 'Radar de viaje', desc: 'Monitoriza tus destinos con proyección de riesgo y ajuste estacional a 12 meses' },
  { icon: TrendingUp, title: 'Análisis de sentimiento', desc: 'Tone_score GDELT con medias móviles 7/30 días y detección de tendencias' },
  { icon: Plane, title: 'Espacio aéreo en vivo', desc: 'Monitorización OpenSky de 20 países en conflicto con detección de anomalías' },
  { icon: Users, title: 'Alertas colaborativas', desc: 'Experiencias de viajeros en Reddit clasificadas por IA como señales OSINT' },
];

const QUICK_LINKS = [
  { href: '/metodologia', label: 'Metodología detallada', desc: 'Cómo calculamos cada indicador paso a paso' },
  { href: '/fuentes-osint', label: 'Fuentes OSINT', desc: 'Listado completo de las 14 fuentes abiertas' },
  { href: '/transparencia', label: 'Centro de transparencia', desc: 'Limitaciones, privacidad y estado del sistema' },
  { href: '/predicciones', label: 'Predicciones por país', desc: 'Score y probabilidades de cambio de riesgo' },
  { href: '/ecosistema', label: 'Arquitectura del sistema', desc: 'Diagrama completo del pipeline de datos' },
  { href: '/precio-api', label: 'API para empresas', desc: 'Integra datos de riesgo en tus sistemas' },
  { href: '/blog/ecosistema-osint-viajero-moderno', label: 'Ecosistema OSINT', desc: 'Cómo encajan todas las piezas (blog)' },
  { href: '/blog/de-plataforma-a-inteligencia', label: 'De plataforma a inteligencia', desc: 'Visión del proyecto (blog)' },
  { href: '/blog/radar-viaje-seguridad-maec-usa', label: 'Radar MAEC+USA', desc: 'Cómo usar el radar de viaje (blog)' },
  { href: '/osint-para-viajeros', label: 'OSINT para Viajeros', desc: 'Monitorización de fuentes abiertas' },
  { href: '/geopolitica-y-viajes', label: 'Geopolítica y Viajes', desc: 'Conflictos, sanciones y espacio aéreo' },
];

export default function TravelRiskIntelligencePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Globe className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Travel Risk Intelligence</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Travel Risk Intelligence
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            Plataforma de inteligencia de riesgo para viajeros que combina datos oficiales, 
            señales de fuentes abiertas y análisis predictivo. Toma decisiones informadas 
            sobre tu próximo destino.
          </p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Article',
                  headline: 'Travel Risk Intelligence | Inteligencia de Riesgo para Viajes',
                  description: 'Plataforma de inteligencia de riesgo de viaje que combina datos oficiales MAEC, OSINT, Machine Learning y análisis predictivo para viajeros conscientes.',
                  author: { '@type': 'Person', name: 'M. Castillo' },
                  publisher: { '@type': 'Organization', name: 'Viaje con Inteligencia' },
                  datePublished: '2026-05-01',
                  dateModified: '2026-05-20',
                  image: 'https://www.viajeinteligencia.com/preview_favicon.jpg',
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    { '@type': 'Question', name: '¿Con qué frecuencia se actualizan los datos?', acceptedAnswer: { '@type': 'Answer', text: 'Los niveles MAEC y US State Dept se actualizan diariamente. Las señales OSINT se procesan cada 6 horas. Los modelos ML se reentrenan cada noche.' } },
                    { '@type': 'Question', name: '¿Travel Risk Intelligence es gratis?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, el mapa de riesgos, las fichas de país, el radar de viaje y el feed OSINT público son gratuitos. Las alertas personalizadas vía Telegram y el dashboard de KPIs requieren suscripción premium (4.99€/mes).' } },
                    { '@type': 'Question', name: '¿Cubrís todos los países del mundo?', acceptedAnswer: { '@type': 'Answer', text: 'Actualmente se monitorizan 136 países con fichas completas. Se priorizan los destinos más visitados por viajeros españoles y latinoamericanos.' } },
                    { '@type': 'Question', name: '¿Puedo integrar los datos en mi propia aplicación?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, ofrezco una API REST pública con cuatro endpoints: riesgo por país, TCI, incidentes activos y catálogo de países.' } },
                    { '@type': 'Question', name: '¿Las predicciones por IA son fiables?', acceptedAnswer: { '@type': 'Answer', text: 'Los modelos Random Forest tienen un MAE de 0.82 puntos en score de riesgo. Las predicciones a 7 días son más fiables que las de 30 días.' } },
                  ],
                },
              ],
            }),
          }}
        />

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5 hover:border-slate-600/50 transition-colors">
              <f.icon className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-slate-400 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <section key={section.id} id={section.id} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
              {section.id === 'preguntas' ? (
                <div className="space-y-4">
                  {section.content.split('\n\n').filter(Boolean).map((p, i) => {
                    const qa = p.split('? ');
                    return qa.length > 1 ? (
                      <div key={i}>
                        <p className="text-white text-sm font-semibold mb-1">{qa[0]}?</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{qa.slice(1).join('? ')}</p>
                      </div>
                    ) : (
                      <p key={i} className="text-slate-300 text-sm leading-relaxed">{p}</p>
                    );
                  })}
                </div>
              ) : (
                section.content.split('\n\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0">{p}</p>
                ))
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Recursos relacionados
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-3 bg-slate-800/60 rounded-lg p-3 hover:bg-slate-700/60 transition-colors group">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">{link.label}</span>
                  <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium mb-1">Limitaciones</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Los datos de riesgo se actualizan diariamente pero pueden existir demoras entre un cambio 
                en la situación real y su reflejo en las fuentes oficiales. Las predicciones por IA tienen 
                un margen de error y no deben ser el único factor en decisiones de viaje. Consulte siempre 
                fuentes oficiales antes de viajar.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
