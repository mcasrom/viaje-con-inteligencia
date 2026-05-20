import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Newspaper, Shield, AlertTriangle, Database, TrendingUp, MessageSquare, Bell, ExternalLink, ArrowRight, BookOpen, Radio, Users, Search, Activity, HelpCircle, MapPin, Clock, Bug } from 'lucide-react';

export const metadata: Metadata = {
  title: 'OSINT para Viajeros | Cómo Usar Fuentes Abiertas para Viajar Seguro',
  description: 'Guía completa de OSINT aplicado a viajes: cómo monitorizar riesgos geopolíticos, desastres naturales, brotes sanitarios y seguridad con fuentes abiertas y análisis por IA. 137 países, 14 fuentes.',
  openGraph: {
    title: 'OSINT para Viajeros | Viaje con Inteligencia',
    description: 'Aprende a usar fuentes abiertas para monitorizar riesgos, incidentes y seguridad en tus destinos de viaje. 14 fuentes OSINT, alertas y análisis predictivo.',
    url: 'https://www.viajeinteligencia.com/osint-para-viajeros',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OSINT para Viajeros | Viaje con Inteligencia',
    description: 'Aprende a usar fuentes abiertas para monitorizar riesgos en tus destinos. Alertas tempranas con datos de GDELT, Reddit, USGS y más.',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/osint-para-viajeros',
  },
  keywords: ['OSINT viajeros', 'fuentes abiertas viaje', 'inteligencia fuentes abiertas turismo', 'seguridad viajera OSINT', 'monitoreo riesgo viaje', 'GDELT viajeros', 'alertas OSINT viaje', 'incidentes viaje tiempo real', 'Reddit seguridad viajera'],
};


const SECTIONS = [
  {
    id: 'que-es-osint-viajero',
    title: '¿Qué es OSINT para viajeros?',
    content: `OSINT (Open Source Intelligence) es la disciplina de recopilar y analizar información de fuentes públicamente disponibles para obtener inteligencia accionable. Aplicado a viajes, significa monitorizar sistemáticamente señales de riesgo en tus destinos usando datos abiertos.

La plataforma automatiza este proceso: 14 fuentes OSINT se monitorizan continuamente, las señales se clasifican por tipo y urgencia, y los incidentes se detectan automáticamente cuando múltiples fuentes coinciden en el mismo evento.

La diferencia clave entre OSINT para viajeros y las recomendaciones tradicionales es la velocidad. Mientras que una recomendación oficial puede tardar días en actualizarse tras un incidente, las señales OSINT pueden detectar el evento en minutos. El reto está en filtrar el ruido y validar la información, que es precisamente lo que automatizamos con IA.`,
  },
  {
    id: 'fuentes-clave',
    title: 'Fuentes OSINT clave para el viajero',
    content: `GDELT (Global Database of Events, Language, and Tone) monitoriza medios de comunicación en 100+ idiomas y asigna un tone_score a cada noticia. Cuando el sentimiento hacia un país se vuelve negativo, puede ser indicador temprano de inestabilidad. GDELT procesa millones de artículos diarios y es la fuente principal de análisis de sentimiento global.

Reddit (r/travel, r/solotravel, r/digitalnomad) proporciona experiencias de primera mano de viajeros sobre el terreno. El sistema clasifica estas señales con IA (Groq/Llama 3.1) para detectar incidentes reportados por la comunidad. A diferencia de las noticias, Reddit capta la percepción real de quienes están viajando.

USGS monitoriza terremotos en tiempo real. Cada sismo de magnitud significativa se cruza con los países afectados para generar alertas automáticas. Utilizamos el feed USGS Earthquake Hazards con datos de ubicación, profundidad y magnitud.

GDACS (Global Disaster Alert and Coordination System) de la ONU proporciona alertas de desastres naturales: ciclones, inundaciones, tsunamis y erupciones volcánicas. Es la fuente más autorizada para desastres a gran escala.

WHO Disease Outbreak News es la fuente más reciente. Proporciona alertas oficiales de brotes epidémicos (Ebola, Marburg, Nipah, viruela del mono, cólera) con datos de la Organización Mundial de la Salud. Es crítica para la detección temprana de amenazas sanitarias.

OpenSky Network permite monitorizar el espacio aéreo. Una caída repentina de tráfico aéreo sobre un país puede indicar cierre de espacio aéreo por conflicto, algo que ha ocurrido en Ucrania, Rusia, Irán y Líbano en los últimos años.

ReliefWeb de la ONU proporciona informes de emergencias humanitarias, que complementan a GDACS con análisis más detallados de crisis complejas.`,
  },
  {
    id: 'como-funciona',
    title: 'Cómo funciona el sistema',
    content: `El pipeline de OSINT opera 24/7 en cuatro fases:

La recolección captura señales de todas las fuentes cada 6 horas (Reddit, RSS, WHO) o en tiempo real (GDELT, USGS, GDACS). Cada señal incluye ubicación, timestamp y contenido. Las fuentes RSS (AP, BBC Breaking, Sky News, Reuters World) proporcionan noticias breaking con cobertura global.

La clasificación usa algoritmos de keywords para GDELT y RSS (coste cero) y Groq AI para Reddit (detección de experiencia de primera mano). Cada señal recibe una categoría (seguridad, salud, clima, transporte, conflicto) y un nivel de urgencia. El tone_score de GDELT se conserva y se compara con la clasificación de Groq para validación cruzada.

La detección de incidentes agrupa señales coincidentes: si 2+ fuentes reportan el mismo tipo de evento en la misma ubicación, se crea un incidente con severidad asignada automáticamente. Cuantas más fuentes independientes coincidan, mayor será la confianza en el incidente.

La notificación envía alertas a usuarios suscritos a ese país vía web o Telegram, con detalle del incidente, fuentes y recomendaciones. Las alertas se priorizan por severidad: las críticas (conflictos activos, desastres mayores) se envían inmediatamente; las informativas se agrupan en el digest diario.`,
  },
  {
    id: 'incidentes',
    title: 'Tipos de incidentes detectados',
    content: `El sistema detecta múltiples tipos de incidentes, cada uno con umbrales de expiración distintos:

Incidentes de seguridad: protestas, violencia, secuestros, terrorismo. Expiran entre 12 y 72 horas según la gravedad. Las protestas pueden escalar rápidamente, por eso el sistema monitoriza su evolución cada 6 horas.

Incidentes naturales: terremotos, huracanes, inundaciones, erupciones. Siguen el ciclo del evento real. Un huracán puede estar activo varios días; un terremoto puntual se archiva tras 24 horas sin réplicas.

Incidentes de viaje: huelgas de transporte, cierres aeroportuarios, brotes sanitarios. Se actualizan según la evolución de la situación. Los brotes sanitarios (como el Ebola) tienen seguimiento continuo mientras la OMS mantenga la alerta.

Cada incidente puede recibir una nota de analista (vía panel de administración) y valoración de la comunidad (estrellas 1-5) para mejorar la calidad de la información. Las valoraciones ayudan a calibrar la severidad automática: si los usuarios reportan que una protesta fue pacífica, el sistema ajusta su peso.`,
  },
  {
    id: 'sentimiento',
    title: 'Análisis de sentimiento GDELT',
    content: `El tone_score de GDELT mide el sentimiento de las noticias hacia un país en una escala de -10 (extremadamente negativo) a +10 (extremadamente positivo). El sistema calcula medias móviles a 7 y 30 días y detecta tendencias.

Cuando el sentimiento cruza umbrales negativos, la urgencia de las alertas asociadas se incrementa automáticamente. Una alerta con sentimiento muy negativo puede escalar de informativa a urgente.

Las alertas de sentimiento se generan cuando: la media de 7 días baja de -5 (alerta informativa), de -8 (precaución), o cuando la volatilidad del sentimiento supera el 30% en una semana. La volatilidad es importante: un país puede tener sentimiento neutro pero si fluctúa bruscamente, indica inestabilidad.

El tone_score se cruza con otras fuentes. Si GDELT muestra sentimiento negativo hacia un país y simultáneamente hay señales en Reddit de viajeros reportando incidentes, la confianza en la alerta aumenta significativamente.`,
  },
  {
    id: 'aplicaciones',
    title: 'Aplicaciones prácticas para el viajero',
    content: `Antes de reservar un vuelo, consulta el feed OSINT público para ver si hay incidentes activos en tu destino. Si viajas a zonas con alertas, usa el botón SOS con geolocalización para encontrar teléfonos de emergencia, contactos consulares y hospitales cercanos.

Durante el viaje, activa alertas personalizadas para tus destinos. Recibirás notificaciones en Telegram o en tu dashboard cuando se detecten incidentes relevantes. Puedes suscribirte a países concretos desde el menú del bot de Telegram con /suscribir.

Después del viaje, comparte tu experiencia valorando los incidentes que hayas presenciado. Tu valoración ayuda a otros viajeros a tener una imagen más precisa y mejora el sistema de clasificación automática.

Para viajeros frecuentes, el radar de viaje permite monitorizar varios destinos simultáneamente con proyección de riesgo a 12 meses, ajustada por estacionalidad y eventos geopolíticos.`,
  },
  {
    id: 'limitaciones',
    title: 'Limitaciones del OSINT automatizado',
    content: `El OSINT automatizado tiene limitaciones que es importante conocer:

Falsos positivos: no todas las señales son precisas. Un rumor en redes sociales, una noticia sensacionalista o un error en GDELT pueden generar alertas innecesarias. El sistema clustering requiere múltiples fuentes para crear un incidente, lo que reduce el ruido pero no lo elimina por completo.

Cobertura geográfica desigual: GDELT tiene mejor cobertura en países con prensa libre y digitalizada. Países con censura de internet o medios de comunicación controlados generan menos señales, lo que puede dar una falsa sensación de seguridad.

Latencia: aunque las fuentes OSINT son más rápidas que las oficiales, sigue existiendo un desfase entre un evento real y su reflejo en los datos. Un terremoto aparece en USGS en minutos; una protesta puede tardar horas en aparecer en Reddit o GDELT.

Por estas razones, siempre se recomienda contrastar las alertas con fuentes oficiales (MAEC, US State Dept) antes de tomar decisiones críticas de viaje.`,
  },
  {
    id: 'preguntas',
    title: 'Preguntas frecuentes',
    content: `¿Qué diferencia hay entre OSINT y las noticias tradicionales? Las noticias tradicionales pasan por un filtro editorial que introduce retraso. OSINT captura señales en bruto de múltiples fuentes, incluyendo redes sociales y datos de sensores, sin edición intermedia. Es más rápido pero requiere validación.

¿El sistema detecta todos los incidentes en un país? No. El sistema detecta incidentes que generan señales en las fuentes. Un incidente que no aparece en GDELT, Reddit, RSS, USGS, GDACS, WHO o ReliefWeb no será detectado. La cobertura mejora con cada fuente que se añade.

¿Puedo confiar en las alertas automáticas? Las alertas son un sistema de aviso temprano, no una verificación forense. Cuando recibes una alerta, se recomienda abrir el feed OSINT, ver las fuentes originales, y contrastar con fuentes oficiales antes de actuar.

¿Cuánto cuesta el acceso al OSINT? El feed OSINT público y las fichas de país son gratuitos. Las alertas personalizadas vía Telegram y el dashboard avanzado requieren suscripción premium.

¿Cada cuánto se actualizan las fuentes? GDELT y USGS se consultan en cada ciclo del cron (cada 6 horas). Reddit y RSS igualmente. WHO DON se consulta con el mismo ciclo. El master cron completo se ejecuta diariamente a las 06:00 UTC.`,
  },
];

const SOURCES_LIST = [
  { icon: Newspaper, name: 'GDELT', desc: 'Sentimiento global de noticias', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: MessageSquare, name: 'Reddit', desc: 'Experiencias de viajeros', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Globe, name: 'RSS (AP, BBC, Reuters)', desc: 'Noticias breaking global', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Activity, name: 'USGS', desc: 'Terremotos en vivo', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Shield, name: 'GDACS (ONU)', desc: 'Desastres naturales', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Radio, name: 'OpenSky', desc: 'Espacio aéreo', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Database, name: 'WHO DON', desc: 'Brotes epidémicos', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Globe, name: 'ReliefWeb', desc: 'Emergencias humanitarias', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Bug, name: 'OSINT clustering', desc: 'IA + detección incidentes', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

const RELATED = [
  { href: '/osint', label: 'Feed OSINT público', desc: 'Incidentes activos con sentimiento GDELT' },
  { href: '/fuentes-osint', label: 'Todas las fuentes', desc: 'Listado completo con descripción de cada fuente' },
  { href: '/pulso-global', label: 'Pulso Global', desc: 'Sentimiento en tiempo real por país' },
  { href: '/alertas', label: 'Alertas personalizadas', desc: 'Suscríbete a países para recibir notificaciones' },
  { href: '/metodologia', label: 'Metodología de análisis', desc: 'Cómo se procesan y clasifican las señales' },
  { href: '/transparencia', label: 'Limitaciones del sistema', desc: 'Qué puede y no puede detectar el sistema OSINT' },
  { href: '/blog/ecosistema-osint-viajero-moderno', label: 'Ecosistema OSINT (blog)', desc: 'Cómo encajan las piezas del sistema' },
  { href: '/travel-risk-intelligence', label: 'Travel Risk Intelligence', desc: 'Visión global de inteligencia de viaje' },
  { href: '/geopolitica-y-viajes', label: 'Geopolítica y Viajes', desc: 'Conflictos, sanciones y espacio aéreo' },
];

export default function OsintParaViajerosPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Radio className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white">OSINT para Viajeros</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            OSINT para Viajeros
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            Cómo se usan fuentes abiertas para monitorizar riesgos en tus destinos. 
            Alertas tempranas, análisis de sentimiento y detección automática de incidentes 
            para que viajes informado.
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
                  headline: 'OSINT para Viajeros | Cómo Usar Fuentes Abiertas para Viajar Seguro',
                  description: 'Guía completa de OSINT aplicado a viajes: cómo monitorizar riesgos geopolíticos, desastres naturales, brotes sanitarios y seguridad con fuentes abiertas y análisis por IA.',
                  author: { '@type': 'Person', name: 'M. Castillo' },
                  publisher: { '@type': 'Organization', name: 'Viaje con Inteligencia' },
                  datePublished: '2026-05-01',
                  dateModified: '2026-05-20',
                  image: 'https://www.viajeinteligencia.com/preview_favicon.jpg',
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    { '@type': 'Question', name: '¿Qué diferencia hay entre OSINT y las noticias tradicionales?', acceptedAnswer: { '@type': 'Answer', text: 'OSINT captura señales en bruto de múltiples fuentes sin edición intermedia. Es más rápido pero requiere validación.' } },
                    { '@type': 'Question', name: '¿El sistema detecta todos los incidentes en un país?', acceptedAnswer: { '@type': 'Answer', text: 'No. Detecta incidentes que generan señales en GDELT, Reddit, RSS, USGS, GDACS, WHO o ReliefWeb. La cobertura mejora con cada fuente añadida.' } },
                    { '@type': 'Question', name: '¿Puedo confiar en las alertas automáticas?', acceptedAnswer: { '@type': 'Answer', text: 'Las alertas son un sistema de aviso temprano, no una verificación forense. Recomendamos contrastar con fuentes oficiales antes de actuar.' } },
                    { '@type': 'Question', name: '¿Cuánto cuesta el acceso al OSINT?', acceptedAnswer: { '@type': 'Answer', text: 'El feed OSINT público y las fichas de país son gratuitos. Las alertas personalizadas vía Telegram requieren suscripción premium.' } },
                  ],
                },
              ],
            }),
          }}
        />

          <div className="grid md:grid-cols-3 gap-3 mb-12">
          {SOURCES_LIST.map(s => (
            <div key={s.name} className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <span className="text-white font-medium text-sm">{s.name}</span>
                <p className="text-slate-500 text-xs">{s.desc}</p>
              </div>
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

        <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Recursos relacionados
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {RELATED.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-3 bg-slate-800/60 rounded-lg p-3 hover:bg-slate-700/60 transition-colors group">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{link.label}</span>
                  <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium mb-1">Limitaciones del OSINT automatizado</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                El OSINT automatizado no sustituye la verificación humana. Las señales pueden contener 
                falsos positivos (rumores, noticias desactualizadas, cobertura mediática desproporcionada). 
                El sistema clustering agrupa múltiples fuentes para reducir el ruido, pero siempre 
                se recomienda contrastar alertas críticas con fuentes oficiales.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
