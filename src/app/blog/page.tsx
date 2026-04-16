import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react';

const articulos = [
  {
    slug: 'como-viajar-seguro-japon',
    title: 'Guía completa para viajar seguro a Japón',
    excerpt: 'Todo lo que necesitas saber sobre seguridad, cultura y precauciones para tu viaje a Japón.',
    date: '15 de Abril, 2026',
    readTime: '8 min',
    category: 'Destinos',
    image: '🇯🇵',
  },
  {
    slug: ' checklist-viaje-imprescindible',
    title: 'Checklist de viaje: Los 10 errores que debes evitar',
    excerpt: 'Los errores más comunes que cometen los viajeros y cómo evitarlos para un viaje sin problemas.',
    date: '12 de Abril, 2026',
    readTime: '5 min',
    category: 'Consejos',
    image: '✈️',
  },
  {
    slug: 'seguro-viaje-obligatorio',
    title: '¿Por qué un seguro de viaje es obligatorio?',
    excerpt: 'Casos reales donde un seguro de viaje marcó la diferencia entre un susto y una tragedia.',
    date: '8 de Abril, 2026',
    readTime: '6 min',
    category: 'Seguros',
    image: '🛡️',
  },
  {
    slug: 'zonas-riesgo-mexico',
    title: 'México: Cómo identificar zonas de riesgo',
    excerpt: 'Mapa actualizado de zonas a evitar y recomendaciones del MAEC para viajar seguro.',
    date: '5 de Abril, 2026',
    readTime: '7 min',
    category: 'Destinos',
    image: '🇲🇽',
  },
  {
    slug: 'documentos-viaje-internacional',
    title: 'Documentos esenciales para viajes internacionales',
    excerpt: 'Pasaporte, visados, seguros y más: todo lo que necesitas documentar antes de partir.',
    date: '1 de Abril, 2026',
    readTime: '4 min',
    category: 'Básicos',
    image: '📄',
  },
  {
    slug: 'bot-telegram-alertas',
    title: 'Cómo el bot de Telegram puede salvarte en el extranjero',
    excerpt: 'Funciones secretas del bot que muy pocos conocen y que pueden ser cruciales en emergencias.',
    date: '28 de Marzo, 2026',
    readTime: '3 min',
    category: 'Tecnología',
    image: '🤖',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Blog de Viaje con Inteligencia
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Artículos para viajar smarter
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Consejos prácticos, guías de destinos y análisis de riesgos para planificar tus viajes con seguridad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articulos.map((articulo) => (
            <Link
              key={articulo.slug}
              href={`/blog/${articulo.slug}`}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-blue-500 transition-colors group"
            >
              <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <span className="text-6xl">{articulo.image}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                    {articulo.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {articulo.title}
                </h2>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {articulo.excerpt}
                </p>
                <div className="flex items-center gap-4 text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {articulo.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {articulo.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            ¿Quieres recibir alertas de seguridad?
          </h3>
          <p className="text-white/80 mb-6">
            Únete a nuestro canal de Telegram para recibir actualizaciones en tiempo real sobre riesgos de viaje.
          </p>
          <a
            href="https://t.me/AlertasViajero"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Unirse al Canal
          </a>
        </div>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M.Castillo - Viaje con Inteligencia
          </p>
        </div>
      </footer>
    </div>
  );
}
