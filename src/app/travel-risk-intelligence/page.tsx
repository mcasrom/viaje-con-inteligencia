import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Globe, Brain, AlertTriangle, BarChart3, FileText, Database, TrendingUp, Bell, Map, Plane, Users, ArrowRight, CheckCircle, BookOpen, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Travel Risk Intelligence | Inteligencia de Riesgo para Viajes',
  description: 'Plataforma de inteligencia de riesgo de viaje que combina datos oficiales MAEC, OSINT, Machine Learning y análisis predictivo para viajeros conscientes.',
  openGraph: {
    title: 'Travel Risk Intelligence | Viaje con Inteligencia',
    description: 'Datos oficiales, señales OSINT y análisis predictivo combinados en una plataforma para viajar informado.',
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
  keywords: ['travel risk intelligence', 'inteligencia riesgo viaje', 'seguridad viajera', 'análisis riesgo destino', 'MAEC viajeros', 'OSINT turismo'],
};

const SECTIONS = [
  {
    id: 'que-es',
    title: '¿Qué es Travel Risk Intelligence?',
    content: `Travel Risk Intelligence (TRI) es la disciplina que combina datos oficiales de seguridad, señales de fuentes abiertas (OSINT) y análisis predictivo para evaluar y anticipar los riesgos asociados a un destino de viaje.

A diferencia de las recomendaciones genéricas, TRI aplica un enfoque multicapa que cruza fuentes diplomáticas, indicadores sociopolíticos, patrones históricos y datos en tiempo real. Cada destino se evalúa no solo por su nivel de riesgo actual, sino por su tendencia, estacionalidad y contexto geopolítico.`,
  },
  {
    id: 'fuentes',
    title: 'Fuentes de datos',
    content: `Nuestra plataforma integra tres capas de datos que se cruzan y validan mutuamente:

La capa diplomática incluye las recomendaciones oficiales del Ministerio de Asuntos Exteriores de España (MAEC) y los Travel Advisories del Departamento de Estado de EE.UU. Esta doble validación permite detectar discrepancias entre fuentes oficiales y ofrecer una visión más completa.

La capa OSINT agrega señales de 14 fuentes abiertas: GDELT para sentimiento global, RSS de agencias internacionales (AP, BBC, Sky News), Reddit para experiencias de primera mano de viajeros, USGS para actividad sísmica, GDACS para desastres naturales y OpenSky para monitoreo de espacio aéreo.

La capa analítica procesa estas señales con algoritmos de clasificación y modelos predictivos para generar alertas tempranas y proyecciones de riesgo.`,
  },
  {
    id: 'metodologia',
    title: 'Metodología de análisis',
    content: `Cada país se evalúa en cuatro dimensiones principales:

El riesgo de seguridad se calcula a partir del nivel MAEC y US State Dept, ajustado por estacionalidad turística y eventos disruptivos activos. No es una foto fija: el riesgo evoluciona con cada nueva señal OSINT.

El índice de coste (TCI) combina el precio real del petróleo Brent, cierres de espacio aéreo, demanda turística estacional e inflación local. Se actualiza diariamente.

El índice de saturación turística (IST) mide la presión turística sobre cada destino usando datos de llegadas, pernoctaciones y estancia media.

El score de viaje personalizado cruza estas dimensiones con el perfil del viajero (mochilero, familiar, aventura, lujo o negocios) para recomendar destinos compatibles.`,
  },
  {
    id: 'ml',
    title: 'Análisis predictivo con IA',
    content: `Nuestro sistema entrena modelos Random Forest por país con 25 features que incluyen: nivel de riesgo MAEC, tendencias a 7 y 30 días, índices globales (GPI, GTI, HDI, IPC), señales OSINT, incidentes activos, sentimiento GDELT y estacionalidad.

Cada modelo genera cuatro predicciones: score de riesgo compuesto (0-100) y probabilidad de aumento de riesgo a 7, 14 y 30 días. Los modelos se reentrenan diariamente y sus predicciones se comparan con el modelo heurístico para detectar desviaciones.

El sistema no reemplaza el juicio humano: las predicciones son una herramienta de apoyo que se complementa con el análisis de fuentes oficiales y el criterio del viajero.`,
  },
  {
    id: 'aplicaciones',
    title: 'Aplicaciones prácticas',
    content: `Travel Risk Intelligence tiene aplicaciones directas para distintos perfiles de viajero:

Para el mochilero o viajero independiente, el sistema ofrece fichas de país actualizadas con nivel de riesgo, contactos de emergencia, visados y recomendaciones prácticas. El radar de viaje permite monitorizar varios destinos con proyección de riesgo a 12 meses.

Para la agencia de viajes o touroperador, la API pública B2B permite integrar datos de riesgo, predicciones e incidentes en sistemas propios, con diferentes niveles de acceso según el plan contratado.

Para el viajero de negocios o expatriado, las alertas personalizadas vía Telegram y el dashboard con KPIs globales ofrecen información actualizada sobre los países de interés.`,
  },
];

const FEATURES = [
  { icon: Shield, title: '120 países monitorizados', desc: 'Cada destino con ficha completa, riesgo MAEC+US, contactos y visados' },
  { icon: Bell, title: 'Alertas en tiempo real', desc: 'Cambios de riesgo, incidentes OSINT y notificaciones personalizadas' },
  { icon: Brain, title: 'Predicciones por IA', desc: 'Modelos Random Forest que anticipan cambios de riesgo a 7/14/30 días' },
  { icon: Globe, title: '14 fuentes OSINT', desc: 'GDELT, Reddit, RSS, USGS, GDACS, OpenSky y más en una sola plataforma' },
  { icon: BarChart3, title: 'KPIs y comparativas', desc: 'Índices de paz, terrorismo, desarrollo, inflación y coste lado a lado' },
  { icon: Map, title: 'Radar de viaje', desc: 'Monitoriza tus destinos con proyección de riesgo y ajuste estacional' },
];

const QUICK_LINKS = [
  { href: '/metodologia', label: 'Metodología detallada', desc: 'Cómo calculamos cada indicador paso a paso' },
  { href: '/fuentes-osint', label: 'Fuentes OSINT', desc: 'Listado completo de las 14 fuentes abiertas' },
  { href: '/transparencia', label: 'Centro de transparencia', desc: 'Limitaciones, privacidad y estado del sistema' },
  { href: '/predicciones', label: 'Predicciones por país', desc: 'Score y probabilidades de cambio de riesgo' },
  { href: '/ecosistema', label: 'Arquitectura del sistema', desc: 'Diagrama completo del pipeline de datos' },
  { href: '/precio-api', label: 'API para empresas', desc: 'Integra datos de riesgo en tus sistemas' },
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

        <div className="grid md:grid-cols-3 gap-6 mb-12">
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
              {section.content.split('\n\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0">{p}</p>
              ))}
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
