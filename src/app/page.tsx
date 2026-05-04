import MapaMundial from '@/components/MapaMundial';
import NewsletterSignup from '@/components/NewsletterSignup';
import Link from 'next/link';
import { Shield, Route, Search, ArrowRight, Map, Globe, Clock, TrendingUp, Star, CheckCircle2, Sparkles, Radio, MapPinned } from 'lucide-react';

export const dynamic = 'force-dynamic';

const quickActions = [
  {
    icon: <Shield className="w-8 h-8" />,
    emoji: '🛡️',
    title: '¿Es seguro mi destino?',
    subtitle: 'Consulta riesgos oficiales MAEC',
    description: 'Nivel de riesgo, alertas en tiempo real y recomendaciones para 100+ países.',
    href: '/',
    label: 'Ver Mapa de Riesgos',
    color: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-400/50',
  },
  {
    icon: <Route className="w-8 h-8" />,
    emoji: '🛣️',
    title: '¿Qué ruta me recomiendas?',
    subtitle: 'Rutas temáticas con IA',
    description: 'Molinos, Faros, Vino, Pirineos, Costa... Rutas curadas con scoring de seguridad.',
    href: '/rutas',
    label: 'Explorar Rutas',
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hover: 'hover:border-emerald-400/50',
  },
  {
    icon: <Search className="w-8 h-8" />,
    emoji: '🤖',
    title: 'Planifica mi viaje con IA',
    subtitle: 'Itinerario en 30 segundos',
    description: 'Dinos destino, días y presupuesto. La IA genera tu viaje perfecto al instante.',
    href: '/clustering',
    label: 'Usar Planificador IA',
    color: 'from-purple-600 to-violet-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    hover: 'hover:border-purple-400/50',
  },
];

const features = [
  { icon: <Globe className="w-5 h-5" />, text: '100+ países con datos actualizados' },
  { icon: <Clock className="w-5 h-5" />, text: 'Alertas en tiempo real MAEC' },
  { icon: <TrendingUp className="w-5 h-5" />, text: 'ML Coste & Clustering IA' },
  { icon: <Star className="w-5 h-5" />, text: 'Rutas premium España' },
];

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">IA + Datos Oficiales MAEC</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Viaja con{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Inteligencia
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Riesgos oficiales, rutas con IA y planificación inteligente. 
              Todo lo que necesitas para viajar seguro y con confianza.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 DECISIONES CLAVE */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className={`group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border ${action.border} ${action.hover} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className={`w-14 h-14 ${action.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{action.emoji}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
                <p className={`text-sm bg-gradient-to-r ${action.color} bg-clip-text text-transparent font-medium mb-3`}>
                  {action.subtitle}
                </p>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{action.description}</p>
                <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${action.color} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                  {action.label}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MAPA DE RIESGOS */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Mapa de Riesgos Global</h2>
          <p className="text-slate-400">Datos oficiales del Ministerio de Asuntos Exteriores (MAEC)</p>
        </div>
        <MapaMundial />
      </section>

      {/* NOVEDADES / FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        {/* Radio Inteligente */}
        <Link href="/radius" className="group block bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <MapPinned className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">Radio Inteligente</h3>
                  <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 text-xs font-bold rounded-full">NUEVO</span>
                </div>
                <p className="text-slate-400 text-sm">Descubre destinos cerca de ti con scoring IA: seguridad, clima y proximidad</p>
              </div>
            </div>
            <span className="text-purple-400 font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Explorar <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* KPIs Dashboard */}
        <Link href="/dashboard/kpis" className="group block bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">KPIs de Seguridad</h3>
                <p className="text-slate-400 text-sm">Riesgo político, aéreo, restricciones y recomendaciones IA en gráficos interactivos</p>
              </div>
            </div>
            <span className="text-blue-400 font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Ver Dashboard <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Estimador de Coste ML */}
        <Link href="/coste" className="group block bg-gradient-to-r from-amber-900/40 to-orange-900/40 rounded-2xl p-6 border border-amber-500/30 hover:border-amber-400/50 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">Estimador de Coste ML</h3>
                  <span className="px-2 py-0.5 bg-amber-500/30 text-amber-200 text-xs font-bold rounded-full">ML</span>
                </div>
                <p className="text-slate-400 text-sm">Machine Learning analiza precios reales para estimar tu presupuesto por destino</p>
              </div>
            </div>
            <span className="text-amber-400 font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Calcular coste <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* NEWSLETTER */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <NewsletterSignup variant="blog" />
      </section>
    </>
  );
}
