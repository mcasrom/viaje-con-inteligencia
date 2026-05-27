'use client';

import { useState } from 'react';
import { TOTAL_PAISES } from '@/lib/constants';

type LayerKey = 'sources' | 'pipelines' | 'storage' | 'ml' | 'apis' | 'frontend' | 'social' | 'external';

const layers: { key: LayerKey; title: string; emoji: string }[] = [
  { key: 'sources', title: 'Fuentes de Datos', emoji: '📡' },
  { key: 'pipelines', title: 'Pipelines (Master Cron)', emoji: '⚙️' },
  { key: 'storage', title: 'Almacenamiento', emoji: '💾' },
  { key: 'ml', title: 'Pipeline de IA', emoji: '🤖' },
  { key: 'apis', title: 'APIs REST', emoji: '🔌' },
  { key: 'frontend', title: 'Frontend', emoji: '🖥️' },
  { key: 'social', title: 'Distribución', emoji: '📱' },
  { key: 'external', title: 'Servicios Externos', emoji: '🔧' },
];

const flowOrder: LayerKey[] = ['sources', 'pipelines', 'storage', 'ml', 'apis', 'frontend', 'social'];

const items: Record<LayerKey, { name: string; desc: string; color: string }[]> = {
  sources: [
    { name: 'MAEC', desc: `Ministerio Exteriores · Riesgo viaje ${TOTAL_PAISES} países`, color: 'blue' },
    { name: 'US State Dept', desc: 'Travel Advisories · Nivel numérico riesgo', color: 'indigo' },
    { name: 'GDELT', desc: 'Sentimiento global · Tone_score cada 15min', color: 'emerald' },
    { name: 'RSS (AP, BBC, Sky)', desc: 'Noticias breaking en tiempo real', color: 'violet' },
    { name: 'Reddit', desc: 'r/travel, r/RVLiving, r/osinttools', color: 'orange' },
    { name: 'USGS', desc: 'Terremotos en tiempo real', color: 'yellow' },
    { name: 'GDACS', desc: 'Desastres naturales (ONU)', color: 'red' },
    { name: 'OpenSky', desc: 'Vuelos activos · Espacio aéreo', color: 'cyan' },
    { name: 'OpenWeather', desc: 'Datos climáticos globales', color: 'sky' },
    { name: 'Oil Price', desc: 'Precio Brent crudo (Yahoo)', color: 'amber' },
    { name: 'FlightLabs', desc: 'Retrasos y estado de vuelos', color: 'pink' },
    { name: 'WHO', desc: 'Salud · Gasto sanitario por país', color: 'rose' },
    { name: 'Wikidata', desc: 'Puntos de interés mundiales', color: 'teal' },
    { name: 'OpenStreetMap', desc: 'POIs geolocalizados', color: 'lime' },
  ],
  pipelines: [
    { name: 'MAEC Scraper', desc: 'Scrape maec.es → maec_risk_history', color: 'blue' },
    { name: 'US State Dept Scraper', desc: 'Scrape travel.state.gov → external_risk', color: 'indigo' },
    { name: 'OSINT Sensor', desc: 'GDELT + RSS + Reddit → Groq clasifica', color: 'violet' },
    { name: 'TCI + Oil', desc: 'Índice coste viaje + precio crudo', color: 'amber' },
    { name: 'Airspace OSINT', desc: 'OpenSky para países en conflicto', color: 'cyan' },
    { name: 'Feature Store', desc: '25 features por país → ml_features', color: 'emerald' },
    { name: 'Entrenamiento IA', desc: 'Random Forest 50 trees · 4 modelos', color: 'rose' },
    { name: 'Risk Predictions', desc: 'Score + probUp 7/14/30 días', color: 'red' },
    { name: 'Social Publisher', desc: 'Telegram + Bluesky + Mastodon', color: 'orange' },
    { name: 'Newsletter', desc: 'Digest semanal vía Resend', color: 'pink' },
    { name: 'Infografía Semanal', desc: 'Visualización riesgo dominical', color: 'teal' },
    { name: 'Health Check', desc: '15 endpoints verificados diariamente', color: 'slate' },
  ],
  storage: [
    { name: 'osint_signals', desc: 'Señales OSINT clasificadas por Groq', color: 'violet' },
    { name: 'incidents', desc: 'Incidentes activos por país', color: 'red' },
    { name: 'ml_features', desc: '25 features vector por país', color: 'emerald' },
    { name: 'ml_models', desc: 'Modelos RF serializados (4)', color: 'rose' },
    { name: 'risk_predictions', desc: 'Predicciones diarias', color: 'orange' },
    { name: 'maec_risk_history', desc: 'Histórico riesgo MAEC (retención 90 días)', color: 'blue' },
    { name: 'external_risk', desc: 'Riesgo US State Dept', color: 'indigo' },
    { name: 'paises', desc: `${TOTAL_PAISES} países con datos completos`, color: 'slate' },
    { name: 'indices', desc: 'GPI, GTI, HDI, IPC', color: 'teal' },
    { name: 'events', desc: 'Eventos disruptivos', color: 'yellow' },
    { name: 'trips', desc: 'Itinerarios de viaje', color: 'cyan' },
    { name: 'profiles', desc: 'Perfiles de usuario', color: 'sky' },
  ],
  ml: [
    { name: '25 Features', desc: '20 base + 5 sentimiento (May 2026)', color: 'emerald' },
    { name: 'Random Forest', desc: '50 árboles · maxDepth 8 · seed 42', color: 'rose' },
    { name: 'risk_score_rf', desc: 'Score compuesto 0-100', color: 'orange' },
    { name: 'prob_up_7d_rf', desc: 'Probabilidad subida 7 días', color: 'amber' },
    { name: 'prob_up_14d_rf', desc: 'Probabilidad subida 14 días', color: 'yellow' },
    { name: 'prob_up_30d_rf', desc: 'Probabilidad subida 30 días', color: 'lime' },
    { name: 'Trip Risk Score', desc: 'Scoring por país + mes + perfil', color: 'teal' },
    { name: 'ScoreBadge', desc: 'Badge visual de riesgo IA', color: 'indigo' },
  ],
  apis: [
    { name: '/api/maec', desc: 'Riesgo MAEC + timestamp', color: 'blue' },
    { name: '/api/osint/signals', desc: 'Señales OSINT públicas', color: 'violet' },
    { name: '/api/pois', desc: 'POIs con scoring por perfil', color: 'teal' },
    { name: '/api/indices', desc: 'GPI, GTI, HDI, IPC', color: 'indigo' },
    { name: '/api/ml/score', desc: 'Score IA por país', color: 'rose' },
    { name: '/api/pais/[codigo]', desc: 'Datos completos país', color: 'slate' },
    { name: '/api/trips/*', desc: 'CRUD viajes + comparador', color: 'cyan' },
    { name: '/api/user/*', desc: 'Preferencias + watchlist', color: 'sky' },
    { name: '/api/ai/*', desc: 'Chat + itinerario + riesgo', color: 'emerald' },
    { name: '/api/admin/*', desc: 'Health, cron, trends, paises', color: 'orange' },
    { name: '/api/aviation/*', desc: 'Airspace + estado vuelos', color: 'pink' },
    { name: '/api/alternatives', desc: 'Destinos alternativos ML', color: 'yellow' },
  ],
  frontend: [
    { name: '/', desc: 'Home · Mapa · KPIs globales', color: 'slate' },
    { name: '/pais/[codigo]', desc: 'Fichas país (riesgo, clima, POIs, OSINT)', color: 'blue' },
    { name: '/blog', desc: '112+ artículos SEO países', color: 'emerald' },
    { name: '/dashboard', desc: 'KPIs · Alertas · ML', color: 'indigo' },
    { name: '/dashboard/radar', desc: 'Monitor viajes · Timeline proyección', color: 'cyan' },
    { name: '/pulso-global', desc: 'Sentimiento global tiempo real', color: 'violet' },
    { name: '/osint', desc: 'Feed OSINT con filtros', color: 'rose' },
    { name: '/admin/*', desc: 'Panel administración completo', color: 'orange' },
    { name: '/viajes/*', desc: 'Itinerarios · Comparador · Públicos', color: 'teal' },
    { name: '/infografias', desc: 'Visualizaciones semanales riesgo', color: 'pink' },
    { name: '/comparar', desc: 'Comparador países side-by-side', color: 'amber' },
    { name: '/transparencia', desc: 'Estado fuentes + health', color: 'slate' },
  ],
  social: [
    { name: 'Telegram', desc: '@ViajeConInteligencia · Alertas + Bot', color: 'blue' },
    { name: 'Bluesky', desc: 'Posts resumen automáticos', color: 'sky' },
    { name: 'Mastodon', desc: 'Posts resumen automáticos', color: 'violet' },
    { name: 'Reddit', desc: 'Semi-auto (Groq genera · Admin revisa)', color: 'orange' },
    { name: 'Email', desc: 'Newsletter semanal vía Resend', color: 'pink' },
    { name: 'RSS Feed', desc: 'Blog + alertas sindicadas', color: 'amber' },
    { name: 'Bing IndexNow', desc: 'Indexación inmediata post-deploy', color: 'indigo' },
  ],
  external: [
    { name: 'Groq API', desc: 'Modelo llama-3.3-70b · Clasificación + generación', color: 'emerald' },
    { name: 'Supabase', desc: 'Base de datos + Auth · Hobby (gratis)', color: 'emerald' },
    { name: 'Resend', desc: 'Email transaccional · 3000/mes gratis', color: 'red' },
    { name: 'Hetzner', desc: 'Servidor dedicado CX42 · 8 vCPU 16GB RAM', color: 'slate' },
    { name: 'GitHub Actions', desc: 'Cron diario 06:00 UTC', color: 'slate' },
    { name: 'FlightLabs', desc: 'Datos vuelos · RapidAPI', color: 'pink' },
    { name: 'OpenWeather', desc: 'Clima global · Gratuito', color: 'sky' },
    { name: 'Bing IndexNow', desc: 'Indexación rápida · Gratuito', color: 'indigo' },
  ],
};

const colorClasses: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  slate:  { bg: 'bg-slate-700/50', text: 'text-slate-200', border: 'border-slate-600/50', dot: 'bg-slate-400' },
  blue:   { bg: 'bg-blue-900/30', text: 'text-blue-200', border: 'border-blue-700/50', dot: 'bg-blue-400' },
  indigo: { bg: 'bg-indigo-900/30', text: 'text-indigo-200', border: 'border-indigo-700/50', dot: 'bg-indigo-400' },
  emerald:{ bg: 'bg-emerald-900/30', text: 'text-emerald-200', border: 'border-emerald-700/50', dot: 'bg-emerald-400' },
  violet: { bg: 'bg-violet-900/30', text: 'text-violet-200', border: 'border-violet-700/50', dot: 'bg-violet-400' },
  orange: { bg: 'bg-orange-900/30', text: 'text-orange-200', border: 'border-orange-700/50', dot: 'bg-orange-400' },
  yellow: { bg: 'bg-yellow-900/30', text: 'text-yellow-200', border: 'border-yellow-700/50', dot: 'bg-yellow-400' },
  red:    { bg: 'bg-red-900/30', text: 'text-red-200', border: 'border-red-700/50', dot: 'bg-red-400' },
  cyan:   { bg: 'bg-cyan-900/30', text: 'text-cyan-200', border: 'border-cyan-700/50', dot: 'bg-cyan-400' },
  sky:    { bg: 'bg-sky-900/30', text: 'text-sky-200', border: 'border-sky-700/50', dot: 'bg-sky-400' },
  amber:  { bg: 'bg-amber-900/30', text: 'text-amber-200', border: 'border-amber-700/50', dot: 'bg-amber-400' },
  pink:   { bg: 'bg-pink-900/30', text: 'text-pink-200', border: 'border-pink-700/50', dot: 'bg-pink-400' },
  rose:   { bg: 'bg-rose-900/30', text: 'text-rose-200', border: 'border-rose-700/50', dot: 'bg-rose-400' },
  teal:   { bg: 'bg-teal-900/30', text: 'text-teal-200', border: 'border-teal-700/50', dot: 'bg-teal-400' },
  lime:   { bg: 'bg-lime-900/30', text: 'text-lime-200', border: 'border-lime-700/50', dot: 'bg-lime-400' },
};

function FlowArrow() {
  return (
    <div className="flex justify-center py-1">
      <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}

function isLinkable(route: string): boolean {
  return route.startsWith('/') && !route.includes('[') && !route.includes('*') && !route.startsWith('/api/');
}

function LayerCard({ item: { name, desc, color } }: { item: { name: string; desc: string; color: string } }) {
  const c = colorClasses[color] || colorClasses.slate;
  const linkable = isLinkable(name);
  const content = (
    <div className={`${c.bg} ${c.border} border rounded-lg px-3 py-2 text-sm hover:brightness-110 transition-all ${linkable ? 'hover:border-blue-500/50 cursor-pointer' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
        <span className={`font-semibold ${c.text} ${linkable ? 'hover:text-blue-400' : ''}`}>{name}</span>
      </div>
      <p className="text-slate-400 text-xs mt-0.5 leading-tight">{desc}</p>
    </div>
  );
  if (linkable) return <a href={name}>{content}</a>;
  return content;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

export default function EcosistemaClient() {
  const [activeLayer, setActiveLayer] = useState<LayerKey | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">🌍 Ecosistema</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Arquitectura completa de Viaje con Inteligencia — fuentes, pipelines, ML, APIs, frontend y distribución.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          <MetricCard label="Países" value={String(TOTAL_PAISES)} />
          <MetricCard label="Fuentes activas" value="14" />
          <MetricCard label="Features ML" value="25" />
          <MetricCard label="Modelos RF" value="4" />
          <MetricCard label="Health Checks" value="15" />
        </div>

        {/* Flow Diagram */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📊 Diagrama de Flujo</h2>
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6">
            {flowOrder.map((key, i) => (
              <div key={key}>
                <div className="flex flex-wrap gap-2">
                  {items[key].map((item) => (
                    <LayerCard key={item.name} item={item} />
                  ))}
                </div>
                {i < flowOrder.length - 1 && <FlowArrow />}
              </div>
            ))}
          </div>
        </div>

        {/* Layer explorer */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🔍 Explorador por Capas</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {layers.map((l) => (
              <button
                key={l.key}
                onClick={() => setActiveLayer(activeLayer === l.key ? null : l.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLayer === l.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {l.emoji} {l.title}
              </button>
            ))}
          </div>

          {activeLayer && (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {items[activeLayer].map((item) => (
                  <LayerCard key={item.name} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🔧 Servicios Externos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {items.external.map((item) => (
              <LayerCard key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Social */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📱 Distribución Social</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.social.map((item) => (
              <LayerCard key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Freemium table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🆓 vs 💎 Gratuito vs Premium</h2>
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-300">Funcionalidad</th>
                    <th className="text-center px-4 py-3 font-semibold text-emerald-400">Gratuito</th>
                    <th className="text-center px-4 py-3 font-semibold text-amber-400">Premium</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-300">Ruta</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [`Riesgo MAEC ${TOTAL_PAISES} países`, '✅', '✅', '/pais/[codigo]'],
                    ['Mapa interactivo KPIs', '✅', '✅', '/'],
                    ['Blog SEO viajes', '✅', '✅', '/blog'],
                    ['Pulso Global sentimiento', '✅', '✅', '/pulso-global'],
                    ['Feed OSINT público', '✅', '✅', '/osint'],
                    ['Chat IA viajes', '✅ llama-3.1-8b', '✅ llama-3.3-70b', '/chat'],
                    ['Radar de Viaje', '✅ 10 países', '✅ 20 países', '/dashboard/radar'],
                    ['ScoreBadge ML', '⚠️ score básico', '✅ score + probs', 'Fichas país'],
                    ['Infografías semanales', '✅ 7d delay', '✅ tiempo real', '/infografias'],
                    ['Newsletter semanal', '✅', '✅', 'Footer'],
                    ['Alertas personalizadas', '✅ web', '✅ web + Telegram', 'Dashboard'],
                    ['Comparador países', '✅', '✅', '/comparar'],
                    ['Itinerarios IA', '✅ 1 activo', '✅ ilimitados', '/viajes'],
                    ['Check-list viaje', '✅ básico', '✅ completo', '/checklist'],
                    ['Predicciones de riesgo IA', '❌', '✅', 'Dashboard premium'],
                    ['Score por perfil viajero', '❌', '✅', 'Fichas país'],
                    ['Destinos alternativos ML', '❌', '✅', 'Fichas país'],
                    ['OSINT avanzado (Groq)', '❌', '✅', '/osint'],
                    ['API pública', '⚠️ limitada', '✅ completa', '/api-endpoints'],
                    ['Modo Emergencia', '✅', '✅', 'SOS flotante'],
                    ['Planificador rutas', '✅', '✅', '/rutas/planificar'],
                    ['Proyección 12 meses radar', '✅', '✅', '/dashboard/radar'],
                    ['Catálogo seguros', '✅', '✅', '/coste/seguros'],
                    ['Análisis temporal CV', '❌', '✅', 'Dashboard premium'],
                  ].map(([name, free, premium, route]) => (
                    <tr key={name as string} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-slate-200">{name}</td>
                      <td className={`px-4 py-2.5 text-center ${free === '✅' ? 'text-emerald-400' : free === '⚠️' ? 'text-amber-400' : 'text-slate-600'}`}>{free}</td>
                      <td className={`px-4 py-2.5 text-center ${premium === '✅' ? 'text-emerald-400' : premium === '⚠️' ? 'text-amber-400' : 'text-slate-600'}`}>{premium}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs font-mono">
                        {isLinkable(route as string)
                          ? <a href={route as string} className="hover:text-blue-400 transition-colors underline decoration-slate-700 hover:decoration-blue-500">{route}</a>
                          : route}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Marketing */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📣 Claves del Ecosistema</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3">🔥 Diferenciadores únicos</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-blue-400 shrink-0">1.</span> 14 fuentes de datos vivas combinadas — MAEC + US State Dept + GDELT + OSINT en tiempo real</li>
                <li className="flex gap-2"><span className="text-blue-400 shrink-0">2.</span> IA de riesgo con sentimiento — 25 features, 4 modelos RF, actualización diaria</li>
                <li className="flex gap-2"><span className="text-blue-400 shrink-0">3.</span> 5 features de sentimiento — tono emocional de noticias como señal temprana</li>
                <li className="flex gap-2"><span className="text-blue-400 shrink-0">4.</span> Radar de Viaje con timeline — proyección ajustada por estacionalidad</li>
                <li className="flex gap-2"><span className="text-blue-400 shrink-0">5.</span> 15 health checks diarios — transparencia total del sistema</li>
                <li className="flex gap-2"><span className="text-blue-400 shrink-0">6.</span> 100% gratuito sostenible — sin anuncios, sin muros de pago agresivos</li>
              </ul>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3">📢 Argumentario outreach</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-blue-200">
                  🔍 &ldquo;Detectamos riesgos antes que MAEC usando IA + 14 fuentes OSINT.&rdquo;
                </div>
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3 text-emerald-200">
                  📊 &ldquo;25 variables por país, 4 modelos ML, actualización diaria.&rdquo;
                </div>
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-amber-200">
                  🆓 &ldquo;Todo gratis. Premium solo para IA predictiva avanzada.&rdquo;
                </div>
                <div className="bg-violet-900/20 border border-violet-700/30 rounded-lg p-3 text-violet-200">
                  🔗 &ldquo;viajeinteligencia.com/ecosistema — arquitectura pública y transparente.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="text-center text-sm text-slate-500">
          Versión: Mayo 2026 · 25 features · 14 fuentes · 4 modelos RF · 24 funcionalidades
        </div>
      </div>
    </div>
  );
}
