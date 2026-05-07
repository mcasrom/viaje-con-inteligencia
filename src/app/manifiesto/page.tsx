import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, TrendingUp, Zap, Target, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manifiesto | Miguel Castillo - Viaje con Inteligencia',
  description: 'Por qué creé Viaje con Inteligencia. Mi historia, mi compromiso contigo y lo que puedes esperar de esta plataforma.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/manifiesto',
  },
};

export default function ManifiestoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-400">M</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Miguel Castillo</h1>
              <p className="text-slate-400">Fundador de Viaje con Inteligencia</p>
            </div>
          </div>
        </div>

        {/* Founder letter */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-10">
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Esto no es un boletín corporativo. Creé esta plataforma porque me cansé de consultar diez webs distintas antes de cada viaje: alertas del MAEC por un lado, precios de vuelos cambiando cada día, noticias sobre conflictos internacionales en otra página y experiencias dispersas en distintos foros.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Mientras aumentan las tensiones entre Irán, Estados Unidos e Israel, los precios del petróleo y de los vuelos vuelven a dispararse, generando incertidumbre para millones de viajeros.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Por eso decidí construir un sistema que reuniera información útil, contexto y datos reales en un solo lugar. Cada semana recibirás señales claras sobre riesgos, estabilidad, clima geopolítico, evolución de precios y destinos que todavía merecen la pena.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mt-6">
            <p className="text-white text-lg font-semibold leading-relaxed">
              El compromiso es sencillo: transparencia total, sin publicidad invasiva y sin venderte viajes.
            </p>
            <p className="text-blue-400 text-lg font-semibold mt-2">
              Solo inteligencia aplicada al viaje.
            </p>
          </div>
        </div>

        {/* The problem */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">El problema</h2>
          <div className="space-y-4">
            {[
              { emoji: '🔍', title: 'Información fragmentada', desc: 'Riesgo MAEC en una web, precios de vuelos en otra, noticias de conflictos en otra, experiencias en Reddit.' },
              { emoji: '📊', title: 'Datos sin contexto', desc: 'Un nivel de riesgo "medio" no dice si afecta a turistas. Un precio de vuelo no explica por qué subió.' },
              { emoji: '⏰', title: 'Decisiones reactivas', desc: 'Cancelamos vuelos cuando ya hay noticias de crisis. Deberíamos saber antes.' },
              { emoji: '📱', title: 'Sobrecarga informativa', desc: 'Demasiados datos, poca accionabilidad. Abrimos 10 pestañas y seguimos sin saber si debemos viajar.' },
            ].map((item) => (
              <div key={item.title} className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The solution */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">La solución</h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            Un sistema que recolecta, procesa y convierte datos dispersos en recomendaciones claras. Cada mañana a las 06:00 UTC:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Shield, label: '26 países MAEC escaneados', desc: 'Riesgo actualizado diariamente' },
              { icon: Eye, label: '73+ fuentes OSINT analizadas', desc: 'GDELT, USGS, Reddit, RSS' },
              { icon: TrendingUp, label: '107 países con TCI calculado', desc: 'Coste real ajustado a petróleo' },
              { icon: Zap, label: 'Incidentes detectados automáticamente', desc: '10 tipos, recomendaciones claras' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <item.icon className="w-5 h-5 text-blue-400 mb-2" />
                <h3 className="text-white font-semibold text-sm mb-1">{item.label}</h3>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commitments */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Mi compromiso contigo</h2>
          <div className="space-y-4">
            {[
              {
                icon: Eye,
                title: 'Transparencia total',
                desc: 'Los algoritmos son públicos. Las fuentes de datos están citadas en cada análisis. Si un dato viene del MAEC, lo dice. Si viene de Reddit, lo dice. Si es un cálculo propio, está documentado.',
              },
              {
                icon: Target,
                title: 'Sin publicidad invasiva',
                desc: 'No vendo tu atención a anunciantes. No hay pop-ups de "¡Reserva ahora!" ni banners de agencias. Si en el futuro hay modelos de monetización, serán opcionales y transparentes.',
              },
              {
                icon: Shield,
                title: 'Sin venderte viajes',
                desc: 'No soy una agencia. No gano comisión por convencerte de ir a un destino o de otro. Las recomendaciones se basan en datos, no en intereses comerciales.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">¿Deberías viajar a este destino ahora?</h2>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              Esta es la pregunta que responde Viaje con Inteligencia. Con datos reales, no opiniones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/osint" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Ver inteligencia en vivo
              </Link>
              <Link href="/decidir" className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                ¿A dónde voy?
              </Link>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="text-center border-t border-slate-700 pt-8">
          <p className="text-slate-500 text-sm">
            Solo inteligencia aplicada al viaje.
          </p>
          <p className="text-slate-600 text-xs mt-2">
            — Miguel Castillo, Mayo 2026
          </p>
        </div>
      </div>
    </div>
  );
}
