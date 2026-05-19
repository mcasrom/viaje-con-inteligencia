import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Shield, AlertTriangle, TrendingUp, Map, Users, Plane, Database, BookOpen, ArrowRight, ExternalLink, Flag, Radio, Activity, BarChart3, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Geopolítica y Viajes | Cómo Afectan los Conflictos al Turismo',
  description: 'Análisis del impacto geopolítico en viajes: conflictos activos, cierres de espacio aéreo, sanciones, GPI, GTI y cómo afectan a la seguridad y coste de tus destinos. 120 países monitorizados.',
  openGraph: {
    title: 'Geopolítica y Viajes | Viaje con Inteligencia',
    description: 'Indicadores GPI, GTI, HDI, conflictos activos, cierres de espacio aéreo y alertas OSINT combinados en un análisis geopolítico para viajeros. 120 países monitorizados.',
    url: 'https://www.viajeinteligencia.com/geopolitica-y-viajes',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geopolítica y Viajes | Viaje con Inteligencia',
    description: 'Cómo afectan los conflictos globales a la seguridad y coste de tus viajes. Conflictos activos, espacio aéreo, sanciones y predicciones.',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/geopolitica-y-viajes',
  },
  keywords: ['geopolítica viajes', 'conflictos y turismo', 'riesgo geopolítico destino', 'cierre espacio aéreo', 'sanciones viajeros', 'seguridad viaje conflicto', 'GPI viajes', 'GTI turismo', 'análisis geopolítico viajero'],
};

const SECTIONS = [
  {
    id: 'geopolitica-viajes',
    title: 'Geopolítica y viajes: una relación inseparable',
    content: `La geopolítica determina en gran medida la seguridad y el coste de viajar. Un cambio en las relaciones diplomáticas puede cerrar espacio aéreo de la noche a la mañana. Una sanción económica puede disparar la inflación local. Un conflicto armado puede convertir un destino turístico en zona de riesgo en cuestión de horas.

Esta plataforma monitoriza continuamente indicadores geopolíticos que afectan directamente al viajero: niveles de riesgo MAEC y US State Dept, cierres de espacio aéreo, conflictos activos, sanciones económicas y eventos disruptivos.

La diferencia entre viajar a un destino estable y uno en tensión geopolítica no siempre es obvia. Países como Marruecos, Turquía o Egipto tienen riesgos geopolíticos que varían con el tiempo y que es crucial conocer antes de reservar.`,
  },
  {
    id: 'conflictos',
    title: 'Conflictos activos y su impacto en viajes',
    content: `Los conflictos armados tienen efectos inmediatos y duraderos sobre el turismo. El cierre de espacio aéreo impide volar hacia o sobre un país. Los combates activos hacen insegura cualquier visita. Pero el impacto va más allá: países vecinos a una zona de conflicto también ven reducido su turismo, aunque estén en paz.

El sistema detecta automáticamente países con espacio aéreo cerrado o restringido usando datos de OpenSky Network. Cuando un país en conflicto muestra cero tráfico aéreo, se genera una alerta de anomalía. Esto ha ocurrido con Ucrania (feb 2022), Rusia (cierre mutuo con UE), Irán y Líbano.

Además, los conflictos afectan al precio del petróleo, que es un componente clave del Travel Cost Index (TCI). Una escalada en Oriente Medio puede disparar el coste de los vuelos globalmente. En 2026, la inestabilidad en múltiples frentes (Europa del Este, Oriente Medio, Cuerno de África) mantiene el precio del Brent volátil.`,
  },
  {
    id: 'indicadores',
    title: 'Indicadores geopolíticos clave',
    content: `El Global Peace Index (GPI) mide la paz en 163 países según 23 indicadores: conflictos internos e internacionales, criminalidad, gasto militar y relaciones con vecinos. Es el indicador de referencia para evaluar la estabilidad de un destino. España ocupa un puesto alto en el GPI; países como Rusia, Ucrania o Yemen ocupan los últimos.

El Global Terrorism Index (GTI) cuantifica el impacto del terrorismo. Un país con GTI alto no es necesariamente inseguro para el turismo (el terrorismo puede concentrarse en zonas no turísticas), pero el índice alerta sobre el riesgo potencial. Países como Afganistán, Irak o Nigeria tienen GTI muy alto.

El Human Development Index (HDI) mide esperanza de vida, educación e ingresos. Un HDI alto suele correlacionarse con mejor infraestructura sanitaria y mayor seguridad para el viajero. Los países nórdicos, Suiza y Australia encabezan el ranking.

La inflación (IPC) es un indicador geopolítico que afecta directamente al bolsillo del viajero. Una inflación alta encarece alojamiento, transporte y comida en destino. Países con inflación descontrolada (Argentina, Venezuela, Turquía) requieren presupuestos más flexibles.

Estos índices se combinan con los niveles MAEC, US State Dept y datos OSINT para generar el score de riesgo compuesto de cada país.`,
  },
  {
    id: 'espacio-aereo',
    title: 'Espacio aéreo y rutas de viaje',
    content: `El cierre de espacio aéreo es una de las consecuencias geopolíticas que más afecta al viajero. Cuando un país cierra su espacio aéreo por conflicto, las aerolíneas deben redirigir vuelos, lo que alarga tiempos de viaje y aumenta el coste del combustible.

El sistema monitoriza el espacio aéreo de 20 países en zonas de conflicto: Rusia, Ucrania, Siria, Libia, Yemen, Afganistán, Irak, Somalia, Sudán, Irán, Israel y Líbano. Cuando se detecta una caída anómala de tráfico aéreo (por debajo de umbrales históricos), se registra como anomalía.

Estos datos alimentan el TCI: si hay cierres activos que afectan rutas hacia un destino, el índice de coste se ajusta al alza para reflejar la mayor dificultad de acceso. Por ejemplo, volar a Asia desde Europa evitando espacio aéreo ruso añade horas y coste.`,
  },
  {
    id: 'sanciones',
    title: 'Sanciones y restricciones de viaje',
    content: `Las sanciones internacionales pueden afectar al viajero de varias formas: restricciones de visado, prohibición de vuelos directos, limitaciones a transacciones financieras y requisitos adicionales de entrada.

Países como Irán, Corea del Norte, Venezuela o Rusia tienen sanciones que afectan a viajeros occidentales. Las fichas de país incluyen información actualizada sobre requisitos de visado, restricciones de entrada y recomendaciones específicas del MAEC.

El sistema alerta cuando un país cambia su nivel de riesgo MAEC, lo que puede reflejar nuevas sanciones o restricciones impuestas por la UE o EE.UU. En 2026, la situación de países como Nicaragua y Bielorrusia sigue siendo dinámica, con cambios periódicos en las recomendaciones.`,
  },
  {
    id: 'tendencias',
    title: 'Tendencias geopolíticas y planificación de viajes',
    content: `La geopolítica no solo afecta a destinos en conflicto. Las tensiones comerciales entre potencias, los movimientos migratorios, las crisis diplomáticas y los cambios de gobierno pueden alterar el panorama de viajes global.

La plataforma permite al viajero informado tomar decisiones con datos actualizados: consultar el nivel de riesgo antes de reservar, activar alertas para destinos en tensión, y usar el radar de viaje para proyectar cómo puede evolucionar el riesgo en los próximos meses según la estacionalidad y los indicadores geopolíticos.

Para el viajero de negocios o el expatriado, las alertas personalizadas y el análisis de sentimiento GDELT ofrecen una ventana adicional sobre la evolución de la estabilidad de un país. Un cambio brusco en el tone_score puede anticipar inestabilidad antes de que las fuentes oficiales actualicen sus recomendaciones.`,
  },
  {
    id: 'preguntas',
    title: 'Preguntas frecuentes',
    content: `¿Qué países están actualmente en conflicto activo? Ucrania, Siria, Yemen, Myanmar y Sudán tienen conflictos armados activos. Israel y Líbano están en alerta máxima. Rusia tiene espacio aéreo restringido para aerolíneas europeas.

¿Es seguro viajar a un país vecino de una zona de conflicto? Depende del país y la distancia al conflicto. Polonia y Rumanía, vecinos de Ucrania, son seguros. La frontera entre Turquía y Siria es zona de riesgo, pero Estambul está lejos del conflicto.

¿Cómo afectan las sanciones al viajero individual? Pueden limitar el uso de tarjetas de crédito internacionales, prohibir vuelos directos, requerir visados especiales o restringir la importación/exportación de ciertos bienes.

¿Las aseguradoras de viaje cubren destinos en conflicto? Generalmente no. La mayoría de las aseguradoras excluyen países con recomendación de no viajar del MAEC o US State Dept. Verifica siempre la cobertura antes de contratar.

¿Cada cuánto se actualizan los indicadores geopolíticos? Los niveles MAEC y US State Dept se actualizan diariamente. GPI, GTI, HDI e IPC se actualizan anualmente por sus fuentes oficiales. Las señales OSINT se procesan cada 6 horas.`,
  },
];

const INDICATORS = [
  { icon: Shield, name: 'GPI', desc: 'Global Peace Index', color: 'text-blue-400' },
  { icon: AlertTriangle, name: 'GTI', desc: 'Global Terrorism Index', color: 'text-red-400' },
  { icon: TrendingUp, name: 'HDI', desc: 'Human Development Index', color: 'text-emerald-400' },
  { icon: BarChart3, name: 'IPC', desc: 'Inflación por país', color: 'text-amber-400' },
  { icon: Radio, name: 'OSINT', desc: 'Señales de fuentes abiertas', color: 'text-violet-400' },
  { icon: Globe, name: 'MAEC+US', desc: 'Doble validación diplomática', color: 'text-indigo-400' },
];

const CONFLICT_MONITOR = [
  { code: 'RU', name: 'Rusia', status: 'Espacio aéreo restringido' },
  { code: 'UA', name: 'Ucrania', status: 'Conflicto activo · No viajar' },
  { code: 'IR', name: 'Irán', status: 'Muy alto · Sanciones activas' },
  { code: 'IL', name: 'Israel', status: 'Alto · Conflicto activo' },
  { code: 'LB', name: 'Líbano', status: 'Muy alto · Inestabilidad' },
  { code: 'SY', name: 'Siria', status: 'Conflicto activo extremo' },
  { code: 'YE', name: 'Yemen', status: 'Conflicto activo extremo' },
  { code: 'VE', name: 'Venezuela', status: 'Muy alto · Crisis política' },
];

const RELATED = [
  { href: '/analisis', label: 'Análisis de impacto global', desc: 'Conflictos, petróleo y turismo' },
  { href: '/predicciones', label: 'Predicciones de riesgo', desc: 'Probabilidad de cambio por país' },
  { href: '/alertas', label: 'Alertas geopolíticas', desc: 'Notificaciones de cambios de riesgo' },
  { href: '/pulso-global', label: 'Pulso Global', desc: 'Sentimiento GDELT por país' },
  { href: '/mapa', label: 'Mapa de riesgos', desc: '120 países con nivel MAEC actualizado' },
  { href: '/transparencia', label: 'Centro de transparencia', desc: 'Fuentes y metodología' },
  { href: '/osint-para-viajeros', label: 'OSINT para Viajeros', desc: 'Monitorización de fuentes abiertas' },
  { href: '/travel-risk-intelligence', label: 'Travel Risk Intelligence', desc: 'Visión global de inteligencia de viaje' },
  { href: '/blog/crisis-combustible-vuelos-2026', label: 'Crisis combustible (blog)', desc: 'Impacto de la geopolítica en el coste de volar' },
  { href: '/blog/cancelacion-vuelos-oriente-medio', label: 'Cancelaciones Oriente Medio (blog)', desc: 'Cómo los conflictos afectan a los vuelos' },
  { href: '/blog/radar-viaje-seguridad-maec-usa', label: 'Radar MAEC+USA (blog)', desc: 'Cómo usar el radar de viaje' },
  { href: '/blog/estafas-turisticas', label: 'Estafas turísticas (blog)', desc: 'Riesgos geopolíticos y seguridad personal' },
];

export default function GeopoliticaYViajesPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Globe className="w-5 h-5 text-rose-400" />
          <h1 className="text-xl font-bold text-white">Geopolítica y Viajes</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Geopolítica y Viajes
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            Cómo los conflictos, las sanciones y la geopolítica global afectan 
            a la seguridad y el coste de tus viajes. Datos actualizados, alertas 
            tempranas y análisis predictivo.
          </p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: '¿Qué países están actualmente en conflicto activo?', acceptedAnswer: { '@type': 'Answer', text: 'Ucrania, Siria, Yemen, Myanmar y Sudán tienen conflictos armados activos. Israel y Líbano están en alerta máxima.' } },
                { '@type': 'Question', name: '¿Es seguro viajar a un país vecino de una zona de conflicto?', acceptedAnswer: { '@type': 'Answer', text: 'Depende del país y la distancia. Polonia y Rumanía, vecinos de Ucrania, son seguros. La frontera Turquía-Siria es zona de riesgo.' } },
                { '@type': 'Question', name: '¿Las aseguradoras de viaje cubren destinos en conflicto?', acceptedAnswer: { '@type': 'Answer', text: 'Generalmente no. La mayoría excluye países con recomendación de no viajar del MAEC o US State Dept.' } },
              ],
            }),
          }}
        />

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {INDICATORS.map(ind => (
            <div key={ind.name} className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 flex items-center gap-3">
              <ind.icon className={`w-5 h-5 ${ind.color} flex-shrink-0`} />
              <div>
                <span className="text-white font-medium text-sm">{ind.name}</span>
                <p className="text-slate-500 text-xs">{ind.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-12 bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Países en monitorización activa
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {CONFLICT_MONITOR.map(c => (
              <div key={c.code}
                className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                <Flag className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium">{c.name}</span>
                  <p className="text-slate-400 text-xs mt-0.5">{c.status}</p>
                </div>
              </div>
            ))}
          </div>
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

        <div className="mt-12 bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-xl border border-rose-500/20 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-400" />
            Recursos relacionados
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {RELATED.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-3 bg-slate-800/60 rounded-lg p-3 hover:bg-slate-700/60 transition-colors group">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium group-hover:text-rose-400 transition-colors">{link.label}</span>
                  <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium mb-1">Aviso importante</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                La situación geopolítica cambia rápidamente. Consulte siempre las recomendaciones 
                oficiales del Ministerio de Asuntos Exteriores (MAEC) antes de viajar, especialmente 
                a destinos con nivel de riesgo medio o superior. Los datos se actualizan 
                diariamente pero pueden existir demoras.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
