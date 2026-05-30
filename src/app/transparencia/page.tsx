import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Database, Brain, Shield, Lock, Clock, AlertTriangle, Eye, FileText, Heart, Server, RefreshCw, BarChart3 } from 'lucide-react';
import { TOTAL_PAISES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Centro de Transparencia | Cómo funciona Viaje Inteligencia',
  description: 'Transparencia total: fuentes, uso de IA, limitaciones, privacidad, seguridad, actualización de datos, sesgos y filosofía del proyecto.',
  openGraph: {
    title: 'Centro de Transparencia | Viaje Inteligencia',
    url: 'https://www.viajeinteligencia.com/transparencia',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/transparencia',
  },
};

const SECTIONS = [
  {
    id: 'fuentes',
    icon: Database,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'Fuentes de datos',
    content: [
      'Extraemos las recomendaciones de viaje del MAEC (Ministerio de Asuntos Exteriores de España) y los Travel Advisories del US State Department como fuentes primarias de riesgo.',
      'Complementamos con 73+ fuentes OSINT: WHO Disease Outbreak News (brotes epidémicos), GDELT (monitorización global de noticias), USGS (terremotos), GDACS (desastres naturales), Reddit (r/travel, r/solotravel, r/digitalnomad), RSS feeds de agencias internacionales y OpenStreetMap.',
      'Para el cálculo de costes usamos: precio del petróleo Brent (EIA + Yahoo Finance), tipos de cambio (Frankfurter API), datos turísticos del INE y estacionalidad histórica.',
      'Los índices globales (GPI, GTI, HDI, IPC) se obtienen de sus fuentes oficiales anuales.',
    ],
  },
  {
    id: 'ia',
    icon: Brain,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    title: 'Cómo usamos la IA',
    content: [
      'La IA analiza, no decide. Groq (modelo de lenguaje) clasifica señales OSINT por categoría, urgencia y sentimiento. El modelo Random Forest predice cambios de riesgo basándose en 25 features históricas.',
      'Ninguna alerta o recomendación se genera automáticamente sin pasar por el pipeline de validación: fuente original → normalización → clasificación → revisión.',
      'El Chat IA responde preguntas de viajeros usando Groq, pero siempre advertimos que sus respuestas son orientativas y deben contrastarse con fuentes oficiales. El chat incluye historial de conversaciones, contexto personalizado (favoritos, viajes guardados, alertas OSINT en vivo) y generador de itinerarios estructurados. Cada itinerario generado incluye automáticamente un análisis de riesgo completo: nivel MAEC, US State Dept, riesgo sanitario, índices GPI/GTI/HDI, clima actual, alertas OSINT activas y precauciones clave del país.',
      'No usamos IA para: decidir niveles de riesgo MAEC, modificar datos oficiales, generar contenido sin supervisión, ni tomar decisiones en nombre del usuario.',
    ],
  },
  {
    id: 'limitaciones',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    title: 'Limitaciones',
    content: [
      'Los niveles de riesgo MAEC son representaciones de las recomendaciones oficiales, no sustitutivos. Consulta siempre la fuente original antes de viajar.',
      'El análisis de sentimiento (tone_score) es una aproximación estadística, no un juicio de valor. Groq puede malinterpretar sarcasmo o contexto local. GDELT usa diccionario genérico.',
      'Las predicciones ML tienen un margen de error. El modelo se entrena con datos históricos limitados y no puede predecir eventos imprevistos (golpes de estado, desastres repentinos).',
      'No todas las fuentes OSINT cubren todos los países con la misma profundidad. La cobertura es mayor en países con más presencia mediática.',
    ],
  },
  {
    id: 'privacidad',
    icon: Lock,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    title: 'Privacidad',
    content: [
      'No recopilamos ubicación persistente del usuario. La geolocalización solo se usa bajo petición explícita (Modo Emergencia) y no se almacena en el servidor.',
      'No vendemos, compartimos ni cedemos datos personales a terceros. No usamos trackers publicitarios ni cookies de terceros.',
      'Los datos de usuario (viajes, favoritos, preferencias) se almacenan en Supabase con autenticación mediante magic link. El usuario puede eliminar sus datos en cualquier momento.',
      'No creamos perfiles comerciales ni de comportamiento. No usamos los datos para publicidad ni recomendaciones sesgadas.',
      'El Monitor de Seguros procesa tus pólizas íntegramente en tu navegador (localStorage). No almacenamos en servidor los detalles de tu seguro médico, coberturas ni aseguradora. Si pierdes el dispositivo o borras los datos del navegador, perderás tus pólizas guardadas — no hay copia en los servidores.',
    ],
  },
  {
    id: 'seguridad',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    title: 'Seguridad',
    content: [
      'Todas las conexiones son HTTPS (TLS 1.3). La autenticación se gestiona mediante Supabase Auth con magic links — no manejamos contraseñas.',
      'Las API keys de servicios externos (Groq, Resend, Supabase) se almacenan como variables de entorno en el servidor Hetzner, nunca en el código fuente.',
      'El dashboard admin requiere autenticación y solo el administrador (email verificado) tiene acceso a funcionalidades sensibles.',
      'Realizamos auditorías periódicas de dependencias con npm audit y mantenemos las librerías actualizadas.',
    ],
  },
  {
    id: 'actualizacion',
    icon: RefreshCw,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    title: 'Cómo se actualizan los datos',
    content: [
      'El riesgo MAEC se actualiza automáticamente cada día a las 06:00 UTC mediante scraping de las recomendaciones oficiales. El US State Department se refresca en el mismo ciclo.',
      'Las señales OSINT (GDELT, Reddit, RSS, GDACS, USGS, WHO DON, ReliefWeb) se procesan diariamente en el cron maestro. Los incidentes se clusterizan y actualizan en el mismo ciclo.',
      'El modelo ML se reentrena diariamente con los últimos datos de riesgo, sentimiento y features históricas. Las predicciones se comparan con el modelo heurístico para detectar desviaciones.',
      'Los precios del petróleo y tipos de cambio se actualizan diariamente. Los índices globales (GPI, GTI, HDI) se actualizan anualmente según publicación de sus fuentes.',
      'Early Bird digest: a las 07:00 UTC, 1h después del master cron, se genera un resumen matutino para el administrador con incidentes, cambios MAEC, sentimiento, health del sistema y tráfico.',
      'Política de retención: el histórico de riesgo MAEC se conserva 90 días en maec_risk_history. Los registros anteriores se eliminan automáticamente cada ciclo diario del cron. El modelo ML y las predicciones actuales mantienen sus datos de entrenamiento históricos.',
    ],
  },
  {
    id: 'sesgos',
    icon: Eye,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    title: 'Sesgos potenciales',
    content: [
      'Cobertura geográfica: los países con más presencia mediática generan más señales OSINT, lo que puede sobre-representar incidentes en esas regiones.',
      'Idioma: el análisis de sentimiento y clasificación Groq tiene mayor precisión en español e inglés. Señales en otros idiomas pueden tener menor fiabilidad.',
      'Fuentes oficiales: el MAEC y US State Departament pueden tener sesgos diplomáticos en sus recomendaciones. Cruzamos múltiples fuentes para mitigarlo.',
      'ML historical bias: el modelo Random Forest aprende de datos pasados. Si hubo patrones históricos que no se repiten, las predicciones pueden desviarse.',
      'Transparencia activa: publicamos métricas de desviación del modelo en /admin/ml y documentamos cada cambio en AGENTS.md.',
    ],
  },
  {
    id: 'filosofia',
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    title: 'Filosofía del proyecto',
    content: [
      'Viaje Inteligencia es un proyecto independiente desarrollado por Miguel Castillo en España. Sin venture capital, sin inversión externa, sin presión de crecimiento artificial.',
      'Creemos en la transparencia como valor fundamental: cada fuente, cada algoritmo, cada decisión está documentada y es auditable.',
      'No cobramos por la seguridad. Las funcionalidades básicas (mapa de riesgo, fichas de país, modo emergencia, OSINT) son gratuitas y sin registro.',
      'El modelo Premium existe para sostener el proyecto (costes de API, servidores, mantenimiento), no para maximizar beneficio. No hay publicidad ni venta de datos.',
    ],
  },
];

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Centro de Transparencia</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Cómo funcionamos, qué hacemos con tus datos, cómo usamos la IA y qué no puedes esperar de nosotros. 
            Inspirado en los transparency centers de SaaS modernos, adaptado a travel intelligence.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className={`bg-gradient-to-r ${section.bg} rounded-xl border ${section.border} p-6`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${section.bg} ${section.border} border`}>
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <h2 className={`text-lg font-bold ${section.color}`}>{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.content.map((text, i) => (
                  <p key={i} className="text-slate-300 text-sm leading-relaxed">{text}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <h3 className="text-white font-semibold text-sm mb-3">Navegación rápida</h3>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${section.bg} ${section.color} ${section.border} border hover:opacity-80 transition-opacity`}
              >
                <section.icon className="w-3 h-3" />
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-white font-semibold text-sm mb-3">Recursos relacionados</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { href: '/metodologia', label: 'Metodología', icon: BarChart3 },
              { href: '/fuentes-osint', label: 'Fuentes OSINT', icon: Globe },
              { href: '/seguridad', label: 'Seguridad', icon: Shield },
              { href: '/manifiesto', label: 'Manifiesto', icon: FileText },
              { href: '/ecosistema', label: 'Ecosistema', icon: Server },
              { href: '/precio-api', label: 'API B2B', icon: Database },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <link.icon className="w-4 h-4 text-blue-400" />
                <span className="text-white text-xs">{link.label} →</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mt-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-amber-300 font-semibold">Nota importante</h3>
          </div>
          <p className="text-amber-200/80 text-sm leading-relaxed">
            Esta web es un agregador informativo. Los niveles de riesgo son una representación de las recomendaciones oficiales del MAEC. 
            Siempre consulta fuentes oficiales antes de viajar. No nos hacemos responsables de decisiones de viaje basadas en esta información.
          </p>
        </div>
      </div>
    </div>
  );
}
