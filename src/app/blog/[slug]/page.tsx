import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2, AlertTriangle, CheckCircle, Plane, Globe, Shield, Lightbulbulb, FileText } from 'lucide-react';

const postsData: Record<string, {
  title: string;
  date: string;
  readTime: string;
  category: string;
  content: React.ReactNode;
}> = {
  'aduanas-aeropuerto': {
    title: 'Pasar la aduana en el aeropuerto sin problemas: guía completa para viajeros jóvenes',
    date: '17 de Abril, 2026',
    readTime: '7 min',
    category: 'Básicos',
    content: (
      <>
        <p className="text-xl text-slate-300 mb-6 leading-relaxed">
          <strong className="text-white">Viajar sin planear demasiado es parte de la gracia.</strong> Compras un vuelo, haces una mochila y te plantas en el aeropuerto con esa sensación de libertad total. Hasta que llegas a un punto clave del viaje: <strong className="text-blue-400">la aduana</strong>. Ahí todo cambia. Colas, agentes, preguntas... y empiezas a pensar: <em>"¿Llevo algo raro?" "¿Me van a parar?"</em>
        </p>
        <p className="text-slate-300 mb-6 leading-relaxed">
          La realidad es que pasar la aduana es fácil si sabes cómo funciona. Esta guía te dará todo lo que necesitas para cruzar cualquier control fronterizo sin estrés.
        </p>
        {/* ... resto del contenido del post de aduanas */}
      </>
    ),
  },
  'como-viajar-seguro-japon': {
    title: 'Guía completa para viajar seguro a Japón',
    date: '15 de Abril, 2026',
    readTime: '8 min',
    category: 'Destinos',
    content: (
      <>
        <p className="text-xl text-slate-300 mb-6 leading-relaxed">
          Japón es uno de los destinos más seguros del mundo para viajar. Con esta guía aprenderás todo lo necesario para disfrutar de tu viaje sin preocupaciones.
        </p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">🇯🇵 ¿Por qué Japón es seguro?</h2>
        <p className="text-slate-300 mb-4">
          Japón posee una de las tasas de criminalidad más bajas del mundo. Los habitantes son conocidos por su hospitalidad y respeto hacia los visitantes. Es común que dejéis objetos de valor en una mesa de cafetería y estos permanezcan ahí cuando volváis.
        </p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">⚠️ Precauciones a tomar</h2>
        <ul className="space-y-3 text-slate-300 mb-4">
          <li>🚇 <strong>Transporte público:</strong> Tened cuidado con las aglomeraciones en horas punta en Tokio.</li>
          <li>🌊 <strong>Tsunamis:</strong> Conoced las rutas de evacuación de vuestra zona.</li>
          <li>🔥 <strong>Terremotos:</strong> Son frecuentes pero generalmente de baja intensidad.</li>
          <li>🗣️ <strong>Idioma:</strong> En zonas turísticas encontraréis inglés, pero es útil aprender frases básicas.</li>
        </ul>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">📋 Checklist MAEC</h2>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <ul className="space-y-2 text-slate-300">
            <li>✅ Pasaporte con validez mínima de 6 meses</li>
            <li>✅ Visado si permaneéis más de 90 días</li>
            <li>✅ Seguro de viaje con cobertura médica</li>
            <li>✅ Registro en el programa de españoles en el exterior</li>
            <li>✅ Descargar app de emergencia del MAEC</li>
          </ul>
        </div>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">🆘 Teléfonos de emergencia</h2>
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
          <p className="text-red-300 font-medium">Emergencias generales: 110</p>
          <p className="text-red-300 font-medium">Emergencias médicas: 119</p>
          <p className="text-slate-400 text-sm mt-2">Embajada de España en Tokio: +81 3 3580 1871</p>
        </div>
      </>
    ),
  },
  'checklist-viaje-imprescindible': {
    title: 'Checklist de viaje: Los 10 errores que debes evitar',
    date: '12 de Abril, 2026',
    readTime: '5 min',
    category: 'Consejos',
    content: (
      <>
        <p className="text-xl text-slate-300 mb-6 leading-relaxed">
          Los errores más comunes que cometen los viajeros pueden arruinar incluso el mejor planificado de los viajes. Aprende a evitarlos con esta guía práctica.
        </p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">❌ Los 10 errores más comunes</h2>
        <ul className="space-y-3 text-slate-300 mb-4">
          <li>1. <strong>No verificar el pasaporte</strong> - Debe tener 6 meses de validez mínima</li>
          <li>2. <strong>Olvidar el seguro de viaje</strong> - Nunca viajes sin él</li>
          <li>3. <strong>No informar al banco</strong> - Para evitar bloqueos de tarjetas en el extranjero</li>
          <li>4. <strong>Equipaje excessivo</strong> - Menos es más</li>
          <li>5. <strong>No guardar copias</strong> - Digitaliza tus documentos importantes</li>
        </ul>
      </>
    ),
  },
  'seguro-viaje-obligatorio': {
    title: '¿Por qué un seguro de viaje es obligatorio?',
    date: '8 de Abril, 2026',
    readTime: '6 min',
    category: 'Seguros',
    content: (
      <>
        <p className="text-xl text-slate-300 mb-6 leading-relaxed">
          Un seguro de viaje puede marcar la diferencia entre un pequeño susto y una catástrofe financiera. Descubre por qué no deberías viajar sin él.
        </p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">💰 ¿Cuánto cuesta un accidente en el extranjero?</h2>
        <p className="text-slate-300 mb-4">
          Un simple traslado en ambulancia en Estados Unidos puede costar más de 1.000€. Una noche en un hospital europeo sin cobertura puede superar los 3.000€. ¿Te puedes permitir ese riesgo?
        </p>
      </>
    ),
  },
  'zonas-riesgo-mexico': {
    title: 'México: Cómo identificar zonas de riesgo',
    date: '5 de Abril, 2026',
    readTime: '7 min',
    category: 'Destinos',
    content: (
      <>
        <p className="text-xl text-slate-300 mb-6 leading-relaxed">
          México es un destino increíble, pero como cualquier país grande, tiene zonas que requieren precaución especial. Aprende a identificar dónde ir y dónde no.
        </p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">🗺️ Zonas de riesgo según MAEC</h2>
        <p className="text-slate-300 mb-4">
          El Ministerio de Asuntos Exteriores español mantiene actualizada una lista de zonas a evitar. Consulta siempre antes de planificar tu viaje.
        </p>
      </>
    ),
  },
  'documentos-viaje-internacional': {
    title: 'Documentos esenciales para viajes internacionales',
    date: '1 de Abril, 2026',
    readTime: '4 min',
    category: 'Básicos',
    content: (
      <>
        <p className="text-xl text-slate-300 mb-6 leading-relaxed">
          La documentación es la base de todo viaje internacional. Sin los papeles en orden, tu aventura puede convertirse en una pesadilla.
        </p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">📄 Documentos imprescindibles</h2>
        <ul className="space-y-2 text-slate-300">
          <li>✅ Pasaporte (con 6 meses de validez)</li>
          <li>✅ Visado (según destino)</li>
          <li>✅ Billete de avión</li>
          <li>✅ Reserva de hotel</li>
          <li>✅ Seguro de viaje</li>
          <li>✅ Carné de conducir internacional</li>
        </ul>
      </>
    ),
  },
  'bot-telegram-alertas': {
    title: 'Cómo el bot de Telegram puede salvarte en el extranjero',
    date: '28 de Marzo, 2026',
    readTime: '3 min',
    category: 'Tecnología',
    content: (
      <>
        <p className="text-xl text-slate-300 mb-6 leading-relaxed">
          El bot de Telegram de Viaje con Inteligencia ofrece alertas en tiempo real sobre riesgos de viaje, clima y mucho más.
        </p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">🤖 Funciones del bot</h2>
        <ul className="space-y-2 text-slate-300">
          <li>⚠️ Alertas de riesgo por país</li>
          <li>🌦️ Información meteorológica</li>
          <li>📋 Checklist de viaje</li>
          <li>💱 Tipos de cambio</li>
          <li>🤖 Chat con IA para preguntas</li>
        </ul>
      </>
    ),
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticuloPage({ params }: PageProps) {
  const { slug } = await params;
  const post = postsData[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post no encontrado</h1>
          <Link href="/blog" className="text-blue-400 hover:text-blue-300">
            ← Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/blog" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al blog</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article>
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-6 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-slate-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 md:p-10 border border-slate-700 mb-8">
            {post.content}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              ← Volver al blog
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>
        </article>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M.Castillo - Viaje con Inteligencia
          </p>
        </div>
      </footer>
    </div>
  );
}
