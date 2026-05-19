import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Shield, AlertTriangle, TrendingUp, Map, Users, Plane, Database, BookOpen, ArrowRight, ExternalLink, Flag, Radio, Activity, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Geopolítica y Viajes | Cómo Afectan los Conflictos al Turismo',
  description: 'Análisis del impacto geopolítico en viajes: conflictos activos, cierres de espacio aéreo, sanciones y cómo afectan a la seguridad y coste de tus destinos.',
  openGraph: {
    title: 'Geopolítica y Viajes | Viaje con Inteligencia',
    description: 'Analizamos cómo los conflictos, las sanciones y la geopolítica global afectan a la seguridad y el coste de viajar.',
    url: 'https://www.viajeinteligencia.com/geopolitica-y-viajes',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geopolítica y Viajes | Viaje con Inteligencia',
    description: 'Cómo afectan los conflictos globales a la seguridad y coste de tus viajes.',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/geopolitica-y-viajes',
  },
  keywords: ['geopolítica viajes', 'conflictos y turismo', 'riesgo geopolítico destino', 'cierre espacio aéreo', 'sanciones viajeros', 'seguridad viaje conflicto'],
};

const SECTIONS = [
  {
    id: 'geopolitica-viajes',
    title: 'Geopolítica y viajes: una relación inseparable',
    content: `La geopolítica determina en gran medida la seguridad y el coste de viajar. Un cambio en las relaciones diplomáticas puede cerrar espacio aéreo de la noche a la mañana. Una sanción económica puede disparar la inflación local. Un conflicto armado puede convertir un destino turístico en zona de riesgo en cuestión de horas.

Nuestra plataforma monitoriza continuamente indicadores geopolíticos que afectan directamente al viajero: niveles de riesgo MAEC y US State Dept, cierres de espacio aéreo, conflictos activos, sanciones económicas y eventos disruptivos.`,
  },
  {
    id: 'conflictos',
    title: 'Conflictos activos y su impacto en viajes',
    content: `Los conflictos armados tienen efectos inmediatos y duraderos sobre el turismo. El cierre de espacio aéreo impide volar hacia o sobre un país. Los combates activos hacen insegura cualquier visita. Pero el impacto va más allá: países vecinos a una zona de conflicto también ven reducido su turismo, aunque estén en paz.

Nuestro sistema detecta automáticamente países con espacio aéreo cerrado o restringido usando datos de OpenSky Network. Cuando un país en conflicto muestra cero tráfico aéreo, se genera una alerta de anomalía.

Además, los conflictos afectan al precio del petróleo, que es un componente clave del Travel Cost Index (TCI). Una escalada en Oriente Medio puede disparar el coste de los vuelos globalmente.`,
  },
  {
    id: 'indicadores',
    title: 'Indicadores geopolíticos clave',
    content: `El Global Peace Index (GPI) mide la paz en 163 países según 23 indicadores: conflictos internos e internacionales, criminalidad, gasto militar y relaciones con vecinos. Es el indicador de referencia para evaluar la estabilidad de un destino.

El Global Terrorism Index (GTI) cuantifica el impacto del terrorismo. Un país con GTI alto no es necesariamente inseguro para el turismo (el terrorismo puede concentrarse en zonas no turísticas), pero el índice alerta sobre el riesgo potencial.

El Human Development Index (HDI) mide esperanza de vida, educación e ingresos. Un HDI alto suele correlacionarse con mejor infraestructura sanitaria y mayor seguridad para el viajero.

Estos índices se combinan con los niveles MAEC, US State Dept y datos OSINT para generar el score de riesgo compuesto de cada país.`,
  },
  {
    id: 'espacio-aereo',
    title: 'Espacio aéreo y rutas de viaje',
    content: `El cierre de espacio aéreo es una de las consecuencias geopolíticas que más afecta al viajero. Cuando un país cierra su espacio aéreo por conflicto, las aerolíneas deben redirigir vuelos, lo que alarga tiempos de viaje y aumenta el coste del combustible.

Nuestro sistema monitoriza el espacio aéreo de 20 países en zonas de conflicto: Rusia, Ucrania, Siria, Libia, Yemen, Afganistán, Irak, Somalia, Sudán, Irán, Israel y Líbano. Cuando se detecta una caída anómala de tráfico aéreo (por debajo de umbrales históricos), se registra como anomalía.

Estos datos alimentan el TCI: si hay cierres activos que afectan rutas hacia un destino, el índice de coste se ajusta al alza para reflejar la mayor dificultad de acceso.`,
  },
  {
    id: 'sanciones',
    title: 'Sanciones y restricciones de viaje',
    content: `Las sanciones internacionales pueden afectar al viajero de varias formas: restricciones de visado, prohibición de vuelos directos, limitaciones a transacciones financieras y requisitos adicionales de entrada.

Países como Irán, Corea del Norte, Venezuela o Rusia tienen sanciones que afectan a viajeros occidentales. Nuestras fichas de país incluyen información actualizada sobre requisitos de visado, restricciones de entrada y recomendaciones específicas del MAEC.

El sistema alerta cuando un país cambia su nivel de riesgo MAEC, lo que puede reflejar nuevas sanciones o restricciones impuestas por la UE o EE.UU.`,
  },
  {
    id: 'tendencias',
    title: 'Tendencias geopolíticas y planificación de viajes',
    content: `La geopolítica no solo afecta a destinos en conflicto. Las tensiones comerciales entre potencias, los movimientos migratorios, las crisis diplomáticas y los cambios de gobierno pueden alterar el panorama de viajes global.

Nuestra plataforma permite al viajero informado tomar decisiones con datos actualizados: consultar el nivel de riesgo antes de reservar, activar alertas para destinos en tensión, y usar el radar de viaje para proyectar cómo puede evolucionar el riesgo en los próximos meses según la estacionalidad y los indicadores geopolíticos.

Para el viajero de negocios o el expatriado, las alertas personalizadas y el análisis de sentimiento GDELT ofrecen una ventana adicional sobre la evolución de la estabilidad de un país.`,
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
  { href: '/mapa', label: 'Mapa de riesgos', desc: '111 países con nivel MAEC actualizado' },
  { href: '/transparencia', label: 'Centro de transparencia', desc: 'Fuentes y metodología' },
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
              <Link key={c.code} href={`/pais/${c.code}`}
                className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors group">
                <Flag className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium">{c.name}</span>
                  <p className="text-slate-400 text-xs mt-0.5">{c.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <section key={section.id} id={section.id} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
              {section.content.split('\n\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0">{p}</p>
              ))}
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
                a destinos con nivel de riesgo medio o superior. Nuestros datos se actualizan 
                diariamente pero pueden existir demoras.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
