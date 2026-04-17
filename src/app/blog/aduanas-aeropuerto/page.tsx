'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2, AlertTriangle, CheckCircle, Plane, Globe, Shield, Lightbulb, XCircle, FileText } from 'lucide-react';

const postsData: Record<string, any> = {
  'aduanas-aeropuerto': {
    slug: 'aduanas-aeropuerto',
    title: 'Pasar la aduana en el aeropuerto sin problemas: guía completa para viajeros jóvenes',
    excerpt: 'Aprende cómo pasar la aduana en el aeropuerto sin problemas. Consejos reales, errores comunes y recomendaciones prácticas para viajeros.',
    date: '17 de Abril, 2026',
    readTime: '7 min',
    category: 'Básicos',
    image: '🛃',
    keywords: 'aduana aeropuerto, pasar aduana, control aduanero consejos, viajar sin problemas aeropuerto, que declarar aduana, viajar extranjero consejos, aduana equipaje, control fronterizo',
    author: 'M. Castillo',
  },
};

export default function AduanasPost() {
  const params = useParams();
  const slug = params.slug as string;
  const post = postsData[slug] || postsData['aduanas-aeropuerto'];

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
            <p className="text-xl text-slate-300 mb-6 leading-relaxed">
              <strong className="text-white">Viajar sin planear demasiado es parte de la gracia.</strong> Compras un vuelo, haces una mochila y te plantas en el aeropuerto con esa sensación de libertad total. Hasta que llegas a un punto clave del viaje: <strong className="text-blue-400">la aduana</strong>. Ahí todo cambia. Colas, agentes, preguntas... y empiezas a pensar: <em>"¿Llevo algo raro?" "¿Me van a parar?"</em>
            </p>
            <p className="text-slate-300 mb-6 leading-relaxed">
              La realidad es que pasar la aduana es fácil si sabes cómo funciona. Esta guía te dará todo lo que necesitas para cruzar cualquier control fronterizo sin estrés.
            </p>

            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/30 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Resumen rápido
              </h2>
              <p className="text-slate-300 text-sm">
                Esta guía cubre: diferencias entre control de pasaportes y aduana, qué revisan los agentes, errores comunes, y los mejores consejos para pasar sin problemas.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Diferencia entre control de pasaportes y aduana
            </h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Antes de nada, algo básico para evitar confusiones. Son dos procesos distintos y puedes tener problemas en uno aunque el otro vaya perfecto:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" />
                  Control de Pasaportes
                </h3>
                <p className="text-slate-400 text-sm">Verifica tu identidad. Confirma que eres quien dices ser y que tienes permiso para entrar en el país.</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-400" />
                  Aduana
                </h3>
                <p className="text-slate-400 text-sm">Revisa lo que llevas. Controla mercancías, dinero, alimentos y productos que entran o salen del país.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-400" />
              Cómo funciona la aduana en el aeropuerto
            </h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              <strong>No revisan a todos los viajeros.</strong> Los controles se basan en perfiles de riesgo, comportamiento e inspecciones aleatorias. Esto significa que tu actitud importa tanto como tu equipaje.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">🎯 Factores que influyen en ser seleccionado para revisión:</h3>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• País de origen y destino</li>
                <li>• Frecuencia de viajes</li>
                <li>• Comportamiento ante los agentes</li>
                <li>• Equipaje incongruente con el viaje declarado</li>
                <li>• Inspección aleatoria</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Qué cosas revisa la aduana (y dónde la gente falla)
            </h2>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">💶 Dinero en efectivo</h3>
            <p className="text-slate-300 mb-2">Si llevas grandes cantidades de dinero en efectivo:</p>
            <ul className="text-slate-400 space-y-1 mb-6">
              <li>• <strong>Más de 10.000€ → obligatorio declarar</strong> (en la UE)</li>
              <li>• No declararlo puede implicar sanciones importantes</li>
              <li>• Incluye todas las monedas y traveller cheques</li>
            </ul>

            <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 text-sm">
                <strong>⚠️ Importante:</strong> Aunque lleves menos de 10.000€, si te preguntan, sé honesto. Mentir sobre el dinero puede ser peor que no declararlo.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">🍖 Comida en el equipaje</h3>
            <p className="text-slate-300 mb-4">
              <strong>Uno de los errores más comunes.</strong> Muchos viajeros no saben que ciertos alimentos están prohibidos o restringidos:
            </p>
            <ul className="text-slate-400 space-y-1 mb-4">
              <li>• <XCircle className="w-4 h-4 inline text-red-400" /> Carne y productos cárnicos</li>
              <li>• <XCircle className="w-4 h-4 inline text-red-400" /> Frutas frescas</li>
              <li>• <XCircle className="w-4 h-4 inline text-red-400" /> Embutidos y quesos</li>
              <li>• <XCircle className="w-4 h-4 inline text-red-400" /> Productos lácteos</li>
              <li>• <CheckCircle className="w-4 h-4 inline text-green-400" /> Alimentos procesados y sellados industrialmente</li>
            </ul>
            <p className="text-slate-400 text-sm mb-6">
              <strong>Especialmente problemático fuera de la Unión Europea.</strong> Muchos países tienen regulaciones muy estrictas sobre productos agrícolas.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">🛍️ Compras en el extranjero</h3>
            <p className="text-slate-300 mb-2">
              Si has comprado productos durante tu viaje:
            </p>
            <ul className="text-slate-400 space-y-1 mb-6">
              <li>• Hay límites de valor para libre de impuestos</li>
              <li>• Pueden cobrar impuestos de importación</li>
              <li>• <strong>Guarda siempre los tickets de compra</strong></li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">💻 Tecnología y gadgets</h3>
            <p className="text-slate-300 mb-4">
              Viajar con electrónica no es ilegal, pero en cantidad puede parecer actividad comercial:
            </p>
            <ul className="text-slate-400 space-y-1 mb-6">
              <li>• Portátiles adicionales</li>
              <li>• Múltiples cámaras</li>
              <li>• Drones</li>
              <li>• Tablets</li>
              <li>• Consolas de videojuegos</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">💊 Medicamentos y sustancias</h3>
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">
                <strong>⚠️ Consejo crítico:</strong> Algunos productos legales en tu país pueden no serlo en otro. <strong>Consulta antes de viajar</strong> especialmente para:
              </p>
              <ul className="text-slate-400 text-sm mt-2 space-y-1">
                <li>• Medicamentos con receta</li>
                <li>• Sustancias psicotrópicas</li>
                <li>• Productos derivados del cannabis</li>
                <li>• Hierbas medicinales</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <Plane className="w-6 h-6 text-green-400" />
              Cómo pasar la aduana sin problemas (guía práctica)
            </h2>

            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Ten claro tu plan de viaje</h3>
                  <p className="text-slate-400 text-sm">Aunque improvises, necesitas: destino claro, duración aproximada y alojamiento. Si no tienes nada reservado, ten al menos una idea coherente.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Lleva la documentación organizada</h3>
                  <p className="text-slate-400 text-sm">Ten a mano: pasaporte o DNI, tarjeta de embarque, reservas de hotel si tienes, seguro de viaje, y cualquier documento relevante para tu viaje.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Equipaje lógico</h3>
                  <p className="text-slate-400 text-sm">Evita incoherencias: viaje corto = equipaje ligero. Viaje largo = equipaje adecuado. Un viaje de 3 días con maleta enorme levanta sospechas.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">4</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Declara si tienes dudas</h3>
                  <p className="text-slate-400 text-sm">Si no estás seguro sobre algo que llevas, <strong>decláralo</strong>. Siempre es mejor prevenir que ser sancionado por omisión.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Mantén una actitud normal</h3>
                  <p className="text-slate-400 text-sm"><strong>Esto es clave.</strong> Responde claro, no te pongas nervioso, no des explicaciones innecesarias. Un "Sí, solo llevo ropa y objetos personales" es perfectamente válido.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-400" />
              Errores comunes al pasar la aduana
            </h2>
            <div className="bg-red-900/10 border border-red-800/30 rounded-xl p-6 mb-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Llevar comida sin saberlo</strong> - Muchos no revisan que su equipaje de mano tiene restos de alimentos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>No declarar dinero</strong> - Asumir que "no me van a preguntar" es un error.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Improvisar respuestas</strong> - Si no sabes algo, di "no lo sé" no inventes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Actitud sospechosa</strong> - Nerviosismo excesivo, evitar contacto visual, movimiento nervioso.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Exceso de equipaje sin lógica</strong> - Viaje corto con maleta gigante = preguntas.</span>
                </li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-purple-400" />
              Diferencias entre viajar dentro y fuera de la UE
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🇪🇺</span> Dentro de la Unión Europea
                </h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li><CheckCircle className="w-4 h-4 inline text-green-400" /> Controles mínimos</li>
                  <li><CheckCircle className="w-4 h-4 inline text-green-400" /> Menos restricciones de productos</li>
                  <li><CheckCircle className="w-4 h-4 inline text-green-400" /> Libre circulación de mercancías</li>
                  <li><CheckCircle className="w-4 h-4 inline text-green-400" /> Proceso generalmente rápido</li>
                </ul>
              </div>
              <div className="bg-orange-900/20 border border-orange-800/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌍</span> Fuera de la Unión Europea
                </h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li><AlertTriangle className="w-4 h-4 inline text-orange-400" /> Controles más estrictos</li>
                  <li><AlertTriangle className="w-4 h-4 inline text-orange-400" /> Más preguntas sobre el viaje</li>
                  <li><AlertTriangle className="w-4 h-4 inline text-orange-400" /> Mayor probabilidad de revisión</li>
                  <li><AlertTriangle className="w-4 h-4 inline text-orange-400" /> Restricciones según país de destino</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Qué pasa si te paran en la aduana
            </h2>
            <p className="text-slate-300 mb-4">
              <strong>No significa que hayas hecho algo mal.</strong> Las inspecciones aleatorias son comunes y no implican ninguna acusación.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-3">Proceso habitual:</h3>
              <ol className="space-y-2">
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm">1</span>
                  Preguntas básicas sobre tu viaje
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm">2</span>
                  Revisión de equipaje
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm">3</span>
                  Verificación de documentación
                </li>
              </ol>
            </div>
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mb-8">
              <p className="text-blue-300 font-medium">
                <strong>💡 Consejo clave:</strong> Mantén la calma y coopera. Los agentes appreciate la honestidad y la transparencia.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              Consejos finales para viajeros jóvenes
            </h2>
            <p className="text-slate-300 mb-4">
              Si eres de los que viajan sin plan cerrado: <strong>perfecto</strong>. La espontaneidad es parte de la aventura. Pero añade esto a tu lista mental:
            </p>
            <ul className="text-slate-300 space-y-2 mb-8">
              <li><CheckCircle className="w-5 h-5 inline text-green-400 mr-2" />Infórmate mínimamente sobre las restricciones del país</li>
              <li><CheckCircle className="w-5 h-5 inline text-green-400 mr-2" />Lleva todo en orden</li>
              <li><CheckCircle className="w-5 h-5 inline text-green-400 mr-2" />No improvises respuestas en el aeropuerto</li>
              <li><CheckCircle className="w-5 h-5 inline text-green-400 mr-2" />Descarga la app del MAEC si vas fuera de Europa</li>
              <li><CheckCircle className="w-5 h-5 inline text-green-400 mr-2" />Ten a mano el número de tu embajada</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Conclusión
            </h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Pasar la aduana en el aeropuerto <strong>no es complicado</strong>. Solo necesitas:
            </p>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li><CheckCircle className="w-5 h-5 inline text-green-400 mr-2" /><strong>Sentido común</strong></li>
              <li><CheckCircle className="w-5 h-5 inline text-green-400 mr-2" /><strong>Preparación básica</strong></li>
              <li><CheckCircle className="w-5 h-5 inline text-green-400 mr-2" /><strong>Actitud tranquila</strong></li>
            </ul>
            <p className="text-xl text-blue-400 font-medium mt-6 mb-8">
              Viajar libre está bien. Viajar sin problemas... mejor.
            </p>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">🎯 Regla rápida</h3>
              <p className="text-white/90 text-lg">
                Si algo te hace <strong>dudar</strong>: probablemente debas declararlo.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
            <h3 className="text-white font-semibold mb-4">📚 Artículos relacionados</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/pais/es" className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <p className="text-blue-400 text-sm mb-1">Guía del país</p>
                <p className="text-white font-medium">Requisitos para entrar en España</p>
              </Link>
              <Link href="/checklist" className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <p className="text-blue-400 text-sm mb-1">Herramienta</p>
                <p className="text-white font-medium">Checklist completo para tu viaje</p>
              </Link>
            </div>
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
    </div>
  );
}
