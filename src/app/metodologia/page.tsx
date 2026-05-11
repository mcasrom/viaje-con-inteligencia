import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, BarChart3, FileText, Globe, Database, TrendingUp } from 'lucide-react';
import { TOTAL_PAISES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Metodología MAEC | Cómo calculamos el riesgo de viaje - Viaje con Inteligencia',
  description: 'Explicación detallada de la metodología de análisis de riesgo MAEC. Fuentes, criterios de evaluación y niveles de riesgo.',
  openGraph: {
    title: 'Metodología MAEC | Viaje con Inteligencia',
    url: 'https://www.viajeinteligencia.com/metodologia',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/metodologia',
  },
};

const RISK_LEVELS = [
  {
    level: 'sin-riesgo',
    label: 'Sin riesgo',
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    emoji: '🟢',
    desc: 'Destino seguro para viajeros españoles. Precauciones normales de cualquier viaje internacional.',
    criteria: ['Estabilidad política consolidada', 'Sin conflictos armados activos', 'Criminalidad baja contra turistas', 'Sistema sanitario accesible'],
  },
  {
    level: 'bajo',
    label: 'Riesgo bajo',
    color: 'from-yellow-500/20 to-yellow-600/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    emoji: '🟡',
    desc: 'Precauciones habituales reforzadas. Posibles manifestaciones o delitos menores en zonas turísticas.',
    criteria: ['Tensiones políticas puntuales', 'Pequeños delitos en zonas turísticas', 'Posibles fenómenos meteorológicos', 'Recomendaciones de vigilancia general'],
  },
  {
    level: 'medio',
    label: 'Riesgo medio',
    color: 'from-orange-500/20 to-orange-600/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    emoji: '🟠',
    desc: 'Riesgo significativo. Se recomienda extremar precauciones y evitar zonas específicas.',
    criteria: ['Inestabilidad política o social', 'Amenaza terrorista moderada', 'Zonas a evitar identificadas', 'Posibles disturbios o protestas violentas'],
  },
  {
    level: 'alto',
    label: 'Riesgo alto',
    color: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    emoji: '🔴',
    desc: 'Viajes no esenciales desaconsejados. Situación de conflicto o inestabilidad grave.',
    criteria: ['Conflictos armados o civiles', 'Terrorismo activo', 'Secuestros o violencia generalizada', 'Infraestructura sanitaria comprometida'],
  },
  {
    level: 'muy-alto',
    label: 'Riesgo muy alto',
    color: 'from-red-700/30 to-red-900/20',
    border: 'border-red-800/50',
    text: 'text-red-300',
    emoji: '⛔',
    desc: 'NO viajar. Riesgo extremo para la vida. Zona de guerra, colapso estatal o catástrofe.',
    criteria: ['Zona de guerra activa', 'Colapso de servicios básicos', 'Presencia de grupos terroristas activos', 'Riesgo de detención arbitraria o violencia extrema'],
  },
];

export default function MetodologiaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Metodología MAEC</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cómo analizamos y clasificamos el riesgo de {TOTAL_PAISES} países para viajeros españoles. Basado en las recomendaciones oficiales del Ministerio de Asuntos Exteriores.
          </p>
        </div>

        {/* Source */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Fuente oficial</h2>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Los niveles de riesgo se extraen directamente de las <strong>recomendaciones de viaje del MAEC</strong> (Ministerio de Asuntos Exteriores, Unión Europea y Cooperación de España). 
            Esta información se actualiza periódicamente y es la referencia oficial para viajeros españoles.
          </p>
          <div className="mt-4">
            <a
              href="https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              <Globe className="w-4 h-4" />
              Ver recomendaciones oficiales MAEC →
            </a>
          </div>
        </div>

        {/* US State Dept */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Fuente secundaria: US State Department</h2>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Complementamos los datos del MAEC con los <strong>Travel Advisories</strong> del Departamento de Estado de EE.UU. 
            Esta fuente asigna niveles de riesgo del 1 al 4 a cada país desde la perspectiva estadounidense, 
            permitiendo una <strong>doble validación</strong> del nivel de riesgo.
          </p>
          <div className="mt-4">
            <a
              href="https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              <Globe className="w-4 h-4" />
              Ver Travel Advisories oficiales →
            </a>
          </div>
        </div>

        {/* Risk Levels */}
        <h2 className="text-2xl font-bold text-white mb-6">Niveles de riesgo</h2>
        <div className="space-y-4 mb-10">
          {RISK_LEVELS.map((level, idx) => (
            <div key={level.level} className={`bg-gradient-to-r ${level.color} rounded-xl border ${level.border} p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{level.emoji}</span>
                <h3 className={`text-lg font-bold ${level.text}`}>{level.label}</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">{level.desc}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {level.criteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Shield className="w-3 h-3" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Process */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Proceso de análisis</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Recopilación de datos', desc: 'Se scrapean las recomendaciones oficiales del MAEC para cada país, incluyendo nivel de riesgo, alertas activas y fecha de actualización.' },
              { step: '2', title: 'Clasificación automática', desc: 'Los países se clasifican en 5 niveles de riesgo según el texto oficial. Se mapean códigos ISO2 para compatibilidad con datos internacionales.' },
              { step: '3', title: 'Análisis complementario', desc: 'Se cruzan datos de índices globales (GPI, GTI, HDI) y datos OSINT para ofrecer contexto adicional al nivel de riesgo.' },
              { step: '4', title: 'Índice TCI', desc: 'Se calcula el Travel Cost Index combinando demanda, precio del petróleo, estacionalidad, inflación e índice de riesgo.' },
              { step: '5', title: 'Actualización continua', desc: 'Los datos se refrescan automáticamente cada hora. Las alertas se publican en el canal de Telegram para notificaciones en tiempo real.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indices used */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Índices complementarios</h2>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Además del riesgo MAEC, utilizamos estos índices internacionales para ofrecer análisis más completo:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm">🕊️ GPI - Global Peace Index</h4>
              <p className="text-slate-400 text-xs mt-1">Nivel de paz y seguridad por país (Institute for Economics & Peace)</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm">⚠️ GTI - Global Terrorism Index</h4>
              <p className="text-slate-400 text-xs mt-1">Impacto del terrorismo en cada país</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm">📊 HDI - Human Development Index</h4>
              <p className="text-slate-400 text-xs mt-1">Desarrollo humano: salud, educación, nivel de vida (UNDP)</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm">💰 IPC - Índice de Precios al Consumo</h4>
              <p className="text-slate-400 text-xs mt-1">Inflación y coste de vida por país</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
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
