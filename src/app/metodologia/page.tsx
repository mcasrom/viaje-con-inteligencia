import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, BarChart3, FileText, Globe, Database, TrendingUp, Brain, MessageSquare, Bell, ArrowRight, Heart, RefreshCw } from 'lucide-react';
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Metodología</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cómo analizamos y clasificamos el riesgo de viaje. Explicación completa del pipeline: fuentes, IA, alertas y presentación.
          </p>
        </div>

        {/* Pipeline visual */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Cómo funciona el sistema</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { step: '1', title: 'Ingesta de datos', desc: 'MAEC · US State Dept · UK FCDO · WHO DON · ReliefWeb · USGS · GDACS · GDELT · RSS · Reddit · OpenSky · ACLED · Open-Meteo · OSM', icon: Database, color: 'text-blue-400' },
              { step: '2', title: 'Normalización', desc: 'Estandarizamos formatos, códigos ISO, coordenadas y categorías de todas las fuentes', icon: FileText, color: 'text-indigo-400' },
              { step: '3', title: 'IA y análisis', desc: 'Groq clasifica señales OSINT. ML Random Forest predice cambios de riesgo', icon: Brain, color: 'text-purple-400' },
              { step: '4', title: 'Alertas', desc: 'Detección de incidentes, clusterización, sentimiento, Early Bird digest, notificaciones Telegram', icon: Bell, color: 'text-amber-400' },
              { step: '5', title: 'Para el viajero', desc: 'Mapa interactivo, fichas de país, radar, chat IA con itinerarios + análisis de riesgo integrado, dashboard, newsletter, infografías', icon: Globe, color: 'text-green-400' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-700/30 rounded-xl p-4 h-full border border-slate-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-blue-600/80 rounded-full flex items-center justify-center text-white font-bold text-[10px]">{item.step}</span>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <h3 className="text-white text-sm font-semibold mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
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

        {/* Fuentes Secundarias: US State Dept + UK FCDO */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Fuentes secundarias: US State Dept + UK FCDO</h2>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Complementamos los datos del MAEC con dos fuentes gubernamentales internacionales para una <strong>triple validación</strong> del nivel de riesgo:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-700/20 rounded-lg p-4">
              <h3 className="text-white font-semibold text-sm mb-2">🇺🇸 US State Department</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong>Travel Advisories</strong> con niveles numéricos 1-4 desde la perspectiva estadounidense. 
                Permite cruzar datos y detectar divergencias con la valoración europea.
              </p>
              <a
                href="https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2"
              >
                <Globe className="w-3 h-3" /> Ver advisories →
              </a>
            </div>
            <div className="bg-slate-700/20 rounded-lg p-4">
              <h3 className="text-white font-semibold text-sm mb-2">🇬🇧 UK FCDO</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong>Foreign Travel Advice</strong> del gobierno británico. Cubre países donde el MAEC o US no tienen datos actualizados, 
                rellenando huecos y añadiendo una tercera perspectiva al análisis de riesgo.
              </p>
              <a
                href="https://www.gov.uk/foreign-travel-advice"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2"
              >
                <Globe className="w-3 h-3" /> Ver FCDO advice →
              </a>
            </div>
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
              { step: '1', title: 'Recopilación de datos', desc: 'Se scrapean las recomendaciones oficiales del MAEC, US State Dept y UK FCDO para cada país. Los tres fuentes se normalizan a un esquema común (source, country_code, risk_level 1-4, risk_label, summary, raw_data JSONB).' },
              { step: '2', title: 'Clasificación automática', desc: 'Los países se clasifican en 5 niveles de riesgo según el texto oficial. Se mapean códigos ISO2 para compatibilidad con datos internacionales.' },
              { step: '3', title: 'Análisis complementario', desc: 'Se cruzan datos de índices globales (GPI, GTI, HDI), fuentes OSINT y las tres fuentes gubernamentales para ofrecer contexto adicional. Si una fuente no tiene datos, otra puede cubrir el hueco.' },
              { step: '4', title: 'Índice TCI', desc: 'Se calcula el Travel Cost Index combinando demanda, precio del petróleo, estacionalidad, inflación, índice de riesgo y cierres de espacio aéreo.' },
              { step: '5', title: 'Actualización continua', desc: 'Los datos se refrescan diariamente a las 06:00 UTC mediante cron maestro. Las alertas se publican en Telegram. El digest "Early Bird" se envía a las 07:00 UTC.' },
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

        {/* Data retention */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-600/30 p-5 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Política de retención de datos</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            El histórico de riesgo MAEC se almacena en <strong className="text-white">maec_risk_history</strong> durante <strong className="text-white">90 días</strong>. 
            Cada día se guarda el nivel de riesgo de cada país en una fila (país + fecha). 
            Los registros anteriores a 90 días se eliminan automáticamente en el ciclo diario del cron maestro (fase 7c/8).
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Esta ventana de 90 días permite análisis de tendencias, detección temprana de patrones y entrenamiento del modelo ML. 
            El histórico completo no persiste para minimizar almacenamiento y alinearse con la utilidad práctica de los datos.
          </p>
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

        {/* WHO Health Risk */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Riesgo sanitario OMS</h2>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            El nivel de riesgo sanitario se calcula exclusivamente con datos de la <strong>Organización Mundial de la Salud</strong> (Global Health Observatory). Evalúa 4 indicadores por país:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm">🫁 Tuberculosis</h4>
              <p className="text-slate-400 text-xs mt-1">Incidencia por 100.000 hab. &gt;100 → +3, &gt;50 → +2, &gt;20 → +1</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm">🧬 VIH</h4>
              <p className="text-slate-400 text-xs mt-1">Prevalencia en adultos &gt;5% → +3, &gt;1% → +1</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm">💉 Vacunación DTP3</h4>
              <p className="text-slate-400 text-xs mt-1">Cobertura infantil &lt;70% → +2, &lt;85% → +1</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm">💰 Gasto sanitario</h4>
              <p className="text-slate-400 text-xs mt-1">$ per cápita/año &lt;100 → +2, &lt;500 → +1</p>
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
            <h4 className="text-white font-semibold text-sm mb-2">Umbrales de riesgo</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-emerald-500/10 rounded p-2 border border-emerald-500/20">
                <span className="text-emerald-400 font-bold">Bajo</span>
                <p className="text-slate-400 mt-0.5">avgScore &lt; 0.75</p>
              </div>
              <div className="bg-amber-500/10 rounded p-2 border border-amber-500/20">
                <span className="text-amber-400 font-bold">Medio</span>
                <p className="text-slate-400 mt-0.5">avgScore ≥ 0.75</p>
              </div>
              <div className="bg-rose-500/10 rounded p-2 border border-rose-500/20">
                <span className="text-rose-400 font-bold">Alto</span>
                <p className="text-slate-400 mt-0.5">avgScore ≥ 1.5</p>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2">Validación cruzada con HDI: países con HDI &lt; 0.6 no pueden ser "Bajo".</p>
            <p className="text-slate-500 text-xs mt-1">Recalibrado 21 May 2026: umbral "Alto" bajado de ≥2.0 a ≥1.5, gasto sanitario de $3/$6 a $100/$500.</p>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Análisis de sentimiento OSINT</h2>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Cada señal de OSINT (redes sociales, RSS, GDELT) lleva un <strong>tone_score</strong> que mide el tono emocional del mensaje. Este valor se conserva al clusterizar señales en incidentes y alimenta el modelo de Machine Learning.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Escala: −10 a +10</h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-red-500/10 rounded p-2 border border-red-500/20">
                  <span className="text-red-400 font-bold">−10 a −5</span>
                  <p className="text-slate-400 mt-0.5">Muy negativo: pánico, alarma, emergencia confirmada</p>
                </div>
                <div className="bg-orange-500/10 rounded p-2 border border-orange-500/20">
                  <span className="text-orange-400 font-bold">−5 a 0</span>
                  <p className="text-slate-400 mt-0.5">Negativo: precaución, incidente en desarrollo</p>
                </div>
                <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                  <span className="text-green-400 font-bold">+5 a +10</span>
                  <p className="text-slate-400 mt-0.5">Positivo: informativo, resuelto, tranquilidad</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-2">Los valores entre −5 y +5 se consideran neutros o de tono mixto.</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Cómo se calcula</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold text-sm flex-shrink-0 w-14">GDELT</span>
                  <p className="text-slate-400 text-xs">El motor GKG de GDELT asigna un <em>tone</em> automático mediante análisis de sentimiento por bolsa de palabras. Además, Groq (LLaMA 3.1 8B) clasifica semánticamente cada señal para mayor precisión.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold text-sm flex-shrink-0 w-14">Reddit/RSS</span>
                  <p className="text-slate-400 text-xs">Usamos Groq (LLaMA 3.1 8B) para clasificar semánticamente cada señal. El prompt pide explícitamente un sentimiento de −10 a +10 basado en el contenido y tono del mensaje. Groq no ve el tone_score de GDELT — su análisis es independiente.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold text-sm flex-shrink-0 w-14">GDACS/USGS</span>
                  <p className="text-slate-400 text-xs">Fuentes autoritativas (alertas oficiales de desastres) no llevan análisis de sentimiento. Su tone_score es <code className="text-purple-300">null</code>.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Propagación a incidentes</h4>
              <p className="text-slate-400 text-xs">
                Cuando el sistema clusteriza varias señales en un incidente, calcula la <strong>media aritmética</strong> de los tone_score de todas las señales del cluster (ignorando nulls). 
                Ese valor medio se almacena en el incidente y se muestra como badge de color en la tarjeta del incidente.
              </p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Machine Learning</h4>
              <p className="text-slate-400 text-xs">
                El tone_score alimenta 5 features del modelo Random Forest: <strong>avgTone7d</strong>, <strong>avgTone30d</strong>, <strong>toneTrend7d</strong>, <strong>negativeRatio7d</strong> y <strong>toneVolatility7d</strong>. 
                Estas features permiten al modelo detectar cambios de clima informativo que preceden a cambios de riesgo. 
                Se necesita al menos 7 días de datos de sentimiento para que estas features sean significativas.
              </p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Limitaciones</h4>
              <ul className="text-slate-400 text-xs space-y-1.5 list-disc list-inside">
                <li>El sentimiento de Groq es subjetivo y depende del prompt y del modelo. No es un análisis clínico.</li>
                <li>GDELT usa un diccionario genérico que puede malinterpretar sarcasmo o contexto local.</li>
                <li>Señales en idiomas distintos al español o inglés pueden tener menor precisión.</li>
                <li>El tone_score de un incidente refleja el tono de las fuentes, no necesariamente la gravedad objetiva del evento.</li>
                <li>La ausencia de tone_score (null) en fuentes autoritativas no implica neutralidad — es simplemente que no aplicamos análisis de sentimiento a alertas oficiales.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Machine Learning Algorithm */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Algoritmo ML: Random Forest</h2>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Entrenamos un modelo <strong>Random Forest</strong> por país con <strong>25 features</strong> que predicen la evolución del riesgo. 
            El modelo se reentrena diariamente y sus predicciones se comparan con el modelo heurístico para detectar desviaciones.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Parámetros del modelo</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-600/20 rounded p-2">
                  <span className="text-purple-400 font-bold">Árboles</span>
                  <p className="text-slate-400 mt-0.5">50 (n_estimators)</p>
                </div>
                <div className="bg-slate-600/20 rounded p-2">
                  <span className="text-purple-400 font-bold">Profundidad</span>
                  <p className="text-slate-400 mt-0.5">8 (max_depth)</p>
                </div>
                <div className="bg-slate-600/20 rounded p-2">
                  <span className="text-purple-400 font-bold">Semilla</span>
                  <p className="text-slate-400 mt-0.5">42 (random_state)</p>
                </div>
                <div className="bg-slate-600/20 rounded p-2">
                  <span className="text-purple-400 font-bold">Librería</span>
                  <p className="text-slate-400 mt-0.5">ml-random-forest</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">4 modelos por país</h4>
              <div className="space-y-2 text-xs">
                <div className="flex gap-3">
                  <code className="text-purple-300 bg-slate-600/20 px-2 py-0.5 rounded flex-shrink-0">risk_score_rf</code>
                  <span className="text-slate-400">Predice el score de riesgo (0–100) basado en las 25 features actuales</span>
                </div>
                <div className="flex gap-3">
                  <code className="text-purple-300 bg-slate-600/20 px-2 py-0.5 rounded flex-shrink-0">prob_up_7d_rf</code>
                  <span className="text-slate-400">Probabilidad de que el riesgo suba en los próximos 7 días</span>
                </div>
                <div className="flex gap-3">
                  <code className="text-purple-300 bg-slate-600/20 px-2 py-0.5 rounded flex-shrink-0">prob_up_14d_rf</code>
                  <span className="text-slate-400">Probabilidad de subida de riesgo a 14 días</span>
                </div>
                <div className="flex gap-3">
                  <code className="text-purple-300 bg-slate-600/20 px-2 py-0.5 rounded flex-shrink-0">prob_up_30d_rf</code>
                  <span className="text-slate-400">Probabilidad de subida de riesgo a 30 días</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-2">Si el modelo RF no está disponible para un país, se usa el modelo heurístico como fallback.</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">25 features por país</h4>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 mb-1 font-medium">Riesgo</p>
                  <ul className="space-y-1 text-slate-400">
                    <li><code className="text-purple-300">risk_level</code> — nivel MAEC numérico</li>
                    <li><code className="text-purple-300">risk_score</code> — score compuesto 0–100</li>
                    <li><code className="text-purple-300">risk_trend_7d</code> — tendencia 7 días</li>
                    <li><code className="text-purple-300">risk_trend_30d</code> — tendencia 30 días</li>
                  </ul>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 font-medium">Índices globales</p>
                  <ul className="space-y-1 text-slate-400">
                    <li><code className="text-purple-300">gpi_score</code> — Global Peace Index</li>
                    <li><code className="text-purple-300">gti_score</code> — Global Terrorism Index</li>
                    <li><code className="text-purple-300">hdi_score</code> — Human Development Index</li>
                    <li><code className="text-purple-300">ipc_score</code> — inflación</li>
                  </ul>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 font-medium">Coste y demanda</p>
                  <ul className="space-y-1 text-slate-400">
                    <li><code className="text-purple-300">tci_score</code> — Travel Cost Index</li>
                    <li><code className="text-purple-300">tci_trend</code> — tendencia de coste</li>
                    <li><code className="text-purple-300">demand_index</code> — demanda turística</li>
                    <li><code className="text-purple-300">seasonality_index</code> — estacionalidad</li>
                  </ul>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 font-medium">OSINT</p>
                  <ul className="space-y-1 text-slate-400">
                    <li><code className="text-purple-300">signal_count_7d</code> — señales OSINT 7d</li>
                    <li><code className="text-purple-300">incident_count_7d</code> — incidentes 7d</li>
                  </ul>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 font-medium">Geopolítica</p>
                  <ul className="space-y-1 text-slate-400">
                    <li><code className="text-purple-300">airspace_closure_active</code> — espacio aéreo</li>
                    <li><code className="text-purple-300">route_disruption_active</code> — rutas</li>
                    <li><code className="text-purple-300">us_risk_score</code> — US State Dept</li>
                    <li><code className="text-purple-300">events_30d</code> / <code className="text-purple-300">high_impact_events_30d</code></li>
                  </ul>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 font-medium">Sentimiento (5)</p>
                  <ul className="space-y-1 text-slate-400">
                    <li><code className="text-purple-300">avg_tone_7d</code> — sentimiento medio 7d</li>
                    <li><code className="text-purple-300">avg_tone_30d</code> — sentimiento medio 30d</li>
                    <li><code className="text-purple-300">tone_trend_7d</code> — tendencia de tono</li>
                    <li><code className="text-purple-300">negative_ratio_7d</code> — ratio negativo</li>
                    <li><code className="text-purple-300">tone_volatility_7d</code> — volatilidad</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 bg-slate-600/20 rounded p-2">
                <p className="text-slate-500 text-xs">Además: <code className="text-purple-300">safety_composite</code>, <code className="text-purple-300">cost_composite</code>, <code className="text-purple-300">cluster_label</code>, <code className="text-purple-300">model_version</code></p>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Evaluación del modelo</h4>
              <p className="text-slate-400 text-xs mb-2">
                Comparamos las predicciones del Random Forest contra el modelo heurístico cada día. Las métricas se publican en el panel de administración.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-600/20 rounded p-2">
                  <span className="text-purple-400 font-bold">MAE riskScore</span>
                  <p className="text-slate-400 mt-0.5">Diferencia media entre RF y heurístico (0–100). ~0.8 típico</p>
                </div>
                <div className="bg-slate-600/20 rounded p-2">
                  <span className="text-purple-400 font-bold">MAE probUp</span>
                  <p className="text-slate-400 mt-0.5">Error medio en probabilidades 7/14/30d. ~0.5% típico</p>
                </div>
                <div className="bg-slate-600/20 rounded p-2">
                  <span className="text-purple-400 font-bold">Desviación máxima</span>
                  <p className="text-slate-400 mt-0.5">País donde RF y heurístico más difieren. Se monitoriza diariamente</p>
                </div>
                <div className="bg-slate-600/20 rounded p-2">
                  <span className="text-purple-400 font-bold">R²</span>
                  <p className="text-slate-400 mt-0.5">Coeficiente de determinación. Se calcula por modelo tras cada entrenamiento</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2">Limitaciones</h4>
              <ul className="text-slate-400 text-xs space-y-1.5 list-disc list-inside">
                <li>El modelo RF se entrena contra predicciones heurísticas, no contra datos reales de riesgo. La validación real requiere &ge;30 días de historial.</li>
                <li>Random Forest no puede predecir eventos sin precedentes históricos (golpes de estado, guerras relámpago, desastres naturales imprevistos).</li>
                <li>Las features de sentimiento necesitan al menos 7 días de datos para ser significativas.</li>
                <li>Países con pocas señales OSINT tienen menos precisión en las predicciones a corto plazo.</li>
                <li>El modelo se reentrena diariamente, pero los cambios de riesgo real pueden tardar horas en reflejarse en las features.</li>
              </ul>
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
