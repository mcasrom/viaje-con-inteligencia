import MapaMundial from '@/components/MapaMundial';
import NewsletterSignup from '@/components/NewsletterSignup';
import Link from 'next/link';
import { Shield, Sparkles, Bell, Crown, ArrowRight, Globe, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

// ============================================================
// BLOQUE 1: HERO + MAPA (Dominante)
// ============================================================
function HeroMapa() {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/90 to-transparent pointer-events-none z-10" />
      
      <div className="relative z-20 max-w-6xl mx-auto px-6 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
          <Globe className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">107 países · Datos oficiales MAEC</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          ¿Es seguro tu{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            destino
          </span>
          ?
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Haz clic en cualquier país del mapa. Riesgos, alertas y recomendaciones al instante.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <MapaMundial />
      </div>
    </section>
  );
}

// ============================================================
// BLOQUE 2: STATS RÁPIDOS (Una sola fila)
// ============================================================
function StatsRapidos() {
  const stats = [
    { label: 'Países analizados', value: '107', icon: '🌍' },
    { label: 'Destinos seguros', value: '92', icon: '✅' },
    { label: 'KPIs en tiempo real', value: '16', icon: '📊' },
    { label: 'Idiomas disponibles', value: '3', icon: '🌐' },
  ];

  return (
    <section className="border-y border-slate-800 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
              <div className="text-slate-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// BLOQUE 3: PLANIFICADOR IA 30s
// ============================================================
function PlanificadorIA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="bg-gradient-to-r from-purple-900/40 to-violet-900/40 rounded-2xl p-8 border border-purple-500/30">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-xs font-bold">INTELIGENCIA ARTIFICIAL</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Planifica tu viaje en 30 segundos
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Sin registro. Dinos destino y presupuesto. La IA genera tu viaje ideal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="¿A dónde quieres ir?"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
          <Link
            href="/clustering"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Sparkles className="w-5 h-5" />
            Planificar
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sin registro
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> ML Clustering K-means
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 107 países
          </span>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// BLOQUE 4: ALERTAS MAEC (Feed en vivo)
// ============================================================
function AlertasFeed() {
  const alerts = [
    { country: '🇲🇽 México', type: 'Recomendación', text: 'Precaución por situación de seguridad en varios estados', level: 'warning' },
    { country: '🇹🇭 Tailandia', type: 'Alerta', text: 'Temporada de monzones activa — previsión de lluvias intensas', level: 'info' },
    { country: '🇫🇷 Francia', type: 'Aviso', text: 'Huelgas de transporte en París — alternativas disponibles', level: 'info' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-amber-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Alertas MAEC en Tiempo Real</h2>
            <p className="text-slate-500 text-sm">Fuente oficial Ministerio de Asuntos Exteriores</p>
          </div>
        </div>
        <Link href="/alertas" className="text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center gap-1">
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.map((a, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">{a.country.split(' ')[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  a.level === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {a.type}
                </span>
                <span className="text-white font-medium">{a.country.slice(2)}</span>
              </div>
              <p className="text-slate-400 text-sm">{a.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// BLOQUE 5: CTA PREMIUM
// ============================================================
function PremiumCTA() {
  const features = [
    { icon: '💬', text: 'Chat IA de viajes con contexto de país' },
    { icon: '📁', text: 'Memoria de viaje 100% local' },
    { icon: '📝', text: 'Reclamaciones IA (AESA, aerolíneas)' },
    { icon: '📊', text: 'Viajes guardados + alertas personalizadas' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-2xl p-8 border border-orange-500/30">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Premium</h2>
            </div>
            <p className="text-slate-400 mb-6">
              Todo lo que necesitas para viajar con inteligencia. 
              Prueba gratuita de 7 días.
            </p>
            <ul className="space-y-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Link
              href="/premium"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-center"
            >
              Empezar prueba gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-center text-slate-500 text-xs">7 días gratis · Cancela cuando quieras</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HOME PRINCIPAL (Solo 5 bloques)
// ============================================================
export default function Home() {
  return (
    <>
      {/* 1. Hero + Mapa */}
      <HeroMapa />

      {/* 2. Stats */}
      <StatsRapidos />

      {/* 3. Planificador IA */}
      <PlanificadorIA />

      {/* 4. Alertas */}
      <AlertasFeed />

      {/* 5. CTA Premium */}
      <PremiumCTA />

      {/* Newsletter minimal */}
      <section className="max-w-xl mx-auto px-6 py-8">
        <NewsletterSignup variant="blog" />
      </section>
    </>
  );
}
