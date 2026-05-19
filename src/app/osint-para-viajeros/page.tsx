import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Newspaper, Shield, AlertTriangle, Database, TrendingUp, MessageSquare, Bell, ExternalLink, ArrowRight, BookOpen, Radio, Users, Search, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'OSINT para Viajeros | Cómo Usar Fuentes Abiertas para Viajar Seguro',
  description: 'Guía completa de OSINT aplicado a viajes: cómo monitorizar riesgos geopolíticos, desastres naturales y seguridad con fuentes abiertas y análisis por IA.',
  openGraph: {
    title: 'OSINT para Viajeros | Viaje con Inteligencia',
    description: 'Aprende a usar fuentes abiertas para monitorizar riesgos, incidentes y seguridad en tus destinos de viaje.',
    url: 'https://www.viajeinteligencia.com/osint-para-viajeros',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OSINT para Viajeros | Viaje con Inteligencia',
    description: 'Aprende a usar fuentes abiertas para monitorizar riesgos en tus destinos.',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/osint-para-viajeros',
  },
  keywords: ['OSINT viajeros', 'fuentes abiertas viaje', 'inteligencia fuentes abiertas turismo', 'seguridad viajera OSINT', 'monitoreo riesgo viaje', 'GDELT viajeros'],
};

const SECTIONS = [
  {
    id: 'que-es-osint-viajero',
    title: '¿Qué es OSINT para viajeros?',
    content: `OSINT (Open Source Intelligence) es la disciplina de recopilar y analizar información de fuentes públicamente disponibles para obtener inteligencia accionable. Aplicado a viajes, significa monitorizar sistemáticamente señales de riesgo en tus destinos usando datos abiertos.

Nuestra plataforma automatiza este proceso: 14 fuentes OSINT se monitorizan continuamente, las señales se clasifican por tipo y urgencia, y los incidentes se detectan automáticamente cuando múltiples fuentes coinciden en el mismo evento.`,
  },
  {
    id: 'fuentes-clave',
    title: 'Fuentes OSINT clave para el viajero',
    content: `GDELT (Global Database of Events, Language, and Tone) monitoriza medios de comunicación en 100+ idiomas y asigna un tone_score a cada noticia. Cuando el sentimiento hacia un país se vuelve negativo, puede ser indicador temprano de inestabilidad.

Reddit (r/travel, r/solotravel, r/digitalnomad) proporciona experiencias de primera mano de viajeros sobre el terreno. Nuestro sistema clasifica estas señales con IA para detectar incidentes reportados por la comunidad.

USGS monitoriza terremotos en tiempo real. Cada sismo de magnitud significativa se cruza con los países afectados para generar alertas automáticas.

GDACS (Global Disaster Alert and Coordination System) de la ONU proporciona alertas de desastres naturales: ciclones, inundaciones, tsunamis y erupciones volcánicas.

OpenSky Network permite monitorizar el espacio aéreo. Una caída repentina de tráfico aéreo sobre un país puede indicar cierre de espacio aéreo por conflicto.`,
  },
  {
    id: 'como-funciona',
    title: 'Cómo funciona el sistema',
    content: `El pipeline de OSINT opera 24/7 en cuatro fases:

La recolección captura señales de todas las fuentes cada 6 horas (Reddit, RSS) o en tiempo real (GDELT, USGS, GDACS). Cada señal incluye ubicación, timestamp y contenido.

La clasificación usa algoritmos de keywords para GDELT y RSS (coste cero) y Groq AI para Reddit (detección de experiencia de primera mano). Cada señal recibe una categoría (seguridad, salud, clima, transporte, conflicto) y un nivel de urgencia.

La detección de incidentes agrupa señales coincidentes: si 2+ fuentes reportan el mismo tipo de evento en la misma ubicación, se crea un incidente con severidad asignada automáticamente.

La notificación envía alertas a usuarios suscritos a ese país vía web o Telegram, con detalle del incidente, fuentes y recomendaciones.`,
  },
  {
    id: 'incidentes',
    title: 'Tipos de incidentes detectados',
    content: `El sistema detecta 10 tipos de incidentes, cada uno con umbrales de expiración distintos:

Incidentes de seguridad: protestas, violencia, secuestros, terrorismo. Expiran entre 12 y 72 horas según la gravedad.

Incidentes naturales: terremotos, huracanes, inundaciones, erupciones. Siguen el ciclo del evento real.

Incidentes de viaje: huelgas de transporte, cierres aeroportuarios, brotes sanitarios. Se actualizan según la evolución de la situación.

Cada incidente puede recibir una nota de analista (vía panel de administración) y valoración de la comunidad (estrellas 1-5) para mejorar la calidad de la información.`,
  },
  {
    id: 'sentimiento',
    title: 'Análisis de sentimiento GDELT',
    content: `El tone_score de GDELT mide el sentimiento de las noticias hacia un país en una escala de -10 (extremadamente negativo) a +10 (extremadamente positivo). Nuestro sistema calcula medias móviles a 7 y 30 días y detecta tendencias.

Cuando el sentimiento cruza umbrales negativos, la urgencia de las alertas asociadas se incrementa automáticamente. Una alerta con sentimiento muy negativo puede escalar de informativa a urgente.

Las alertas de sentimiento se generan cuando: la media de 7 días baja de -5 (alerta informativa), de -8 (precaución), o cuando la volatilidad del sentimiento supera el 30% en una semana.`,
  },
  {
    id: 'aplicaciones',
    title: 'Aplicaciones prácticas para el viajero',
    content: `Antes de reservar un vuelo, consulta nuestro feed OSINT público para ver si hay incidentes activos en tu destino. Si viajas a zonas con alertas, usa el botón SOS con geolocalización para encontrar teléfonos de emergencia, contactos consulares y hospitales cercanos.

Durante el viaje, activa alertas personalizadas para tus destinos. Recibirás notificaciones en Telegram o en tu dashboard cuando se detecten incidentes relevantes.

Después del viaje, comparte tu experiencia valorando los incidentes que hayas presenciado. Tu valoración ayuda a otros viajeros a tener una imagen más precisa.`,
  },
];

const SOURCES_LIST = [
  { icon: Newspaper, name: 'GDELT', desc: 'Sentimiento global de noticias', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: MessageSquare, name: 'Reddit', desc: 'Experiencias de viajeros', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Globe, name: 'RSS (AP, BBC, Sky)', desc: 'Noticias breaking', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Activity, name: 'USGS', desc: 'Terremotos en vivo', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Shield, name: 'GDACS (ONU)', desc: 'Desastres naturales', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Radio, name: 'OpenSky', desc: 'Espacio aéreo', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

const RELATED = [
  { href: '/osint', label: 'Feed OSINT público', desc: 'Incidentes activos con sentimiento GDELT' },
  { href: '/fuentes-osint', label: 'Todas las fuentes', desc: 'Listado completo con descripción de cada fuente' },
  { href: '/pulso-global', label: 'Pulso Global', desc: 'Sentimiento en tiempo real por país' },
  { href: '/alertas', label: 'Alertas personalizadas', desc: 'Suscríbete a países para recibir notificaciones' },
  { href: '/metodologia', label: 'Metodología de análisis', desc: 'Cómo procesamos y clasificamos las señales' },
  { href: '/transparencia', label: 'Limitaciones del sistema', desc: 'Qué puede y no puede detectar nuestro OSINT' },
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
            Cómo usamos fuentes abiertas para monitorizar riesgos en tus destinos. 
            Alertas tempranas, análisis de sentimiento y detección automática de incidentes 
            para que viajes informado.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
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
              {section.content.split('\n\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0">{p}</p>
              ))}
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
                Nuestro sistema clustering agrupa múltiples fuentes para reducir el ruido, pero siempre 
                recomendamos contrastar alertas críticas con fuentes oficiales.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
