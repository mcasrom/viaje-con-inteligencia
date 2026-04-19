import Link from 'next/link';
import { ArrowLeft, BookOpen, MapPin, AlertTriangle, Shield, Globe, FileText, CheckCircle, Scale, Smartphone, Download } from 'lucide-react';

import InstallPWA from '@/components/InstallPWA';

export default function MetodologiaPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 font-medium mb-6">
            <BookOpen className="w-5 h-5" />
            <span>Metodología</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Metodología MAEC</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Cómo recopilamos, clasificamos y presentamos la información de riesgos de viaje
          </p>
        </div>

        <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Globe className="w-10 h-10 text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-blue-400 mb-2">¿Qué es el MAEC?</h2>
              <p className="text-slate-300">
                El <strong className="text-white">MAEC (Ministerio de Asuntos Exteriores, Unión Europea y Cooperación)</strong> 
                es el organismo oficial del Gobierno de España responsable de la política exterior, las relaciones 
                internacionales y la protección de los ciudadanos españoles en el extranjero.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-400" />
              Niveles de Riesgo - Clasificación Original MAEC
            </h2>
            <div className="grid gap-4">
              <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-green-400">Normalidad</h3>
                </div>
                <p className="text-slate-300 mb-3">
                  <strong className="text-white">MAEC:</strong> &ldquo;Viajar con las precauciones normales de un viaje al extranjero&rdquo;
                </p>
                <p className="text-slate-400 text-sm">
                  No existen riesgos específicos relevantes. Los viajes pueden realizarse con normalidad.
                </p>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-400">Precaución Especial</h3>
                </div>
                <p className="text-slate-300 mb-3">
                  <strong className="text-white">MAEC:</strong> &ldquo;Extremar las precauciones normales&rdquo;
                </p>
                <p className="text-slate-400 text-sm">
                  Riesgo bajo. Se recomienda vigilance y tomar precauciones adicionales.
                </p>
              </div>

              <div className="bg-orange-900/20 border border-orange-800/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-orange-400">Evitar Viajes No Esenciales</h3>
                </div>
                <p className="text-slate-300 mb-3">
                  <strong className="text-white">MAEC:</strong> &ldquo;Desaconsejar los viajes que no sean esenciales&rdquo;
                </p>
                <p className="text-slate-400 text-sm">
                  Riesgo medio-alto. Solo viajar si es estrictamente necesario.
                </p>
              </div>

              <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h3 className="text-xl font-bold text-red-400">No Viajar</h3>
                </div>
                <p className="text-slate-300 mb-3">
                  <strong className="text-white">MAEC:</strong> &ldquo;Desaconsejar todos los viajes&rdquo;
                </p>
                <p className="text-slate-400 text-sm">
                  Riesgo muy alto. Condiciones extremadamente危险 (peligrosas).
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-400" />
              Cómo Recopilamos la Información
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-3">📊 Fuentes Primarias</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Web oficial MAEC (exteriores.gob.es)</li>
                  <li>• Informes de embajadas</li>
                  <li>• Alertas de viaje oficiales</li>
                  <li>• Notas diplomáticas</li>
                </ul>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-3">🔍 Fuentes Secundarias</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Organizaciones internacionales (OMS, ONU)</li>
                  <li>• Medios de comunicación verificados</li>
                  <li>• Blogs de viajeros confiables</li>
                  <li>• Datos turísticos oficiales</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Scale className="w-6 h-6 text-amber-400" />
              Simplificación de Clasificaciones
            </h2>
            <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4 mb-6">
              <p className="text-amber-300 font-medium mb-2">
                ⚠️ Nota importante sobre nuestra simplificación
              </p>
              <p className="text-slate-300 text-sm">
                Para hacer la información más accesible y fácil de entender, hemos simplificado 
                la clasificación original del MAEC a <strong className="text-white">5 categorías</strong> 
                (antes 4 + subniveles). Esta adaptación es nuestra interpretación y puede variar 
                respecto al lenguaje oficial.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">MAEC &ldquo;Normalidad&rdquo;</span>
                <span className="text-slate-400">→</span>
                <span className="bg-green-500 px-3 py-1 rounded-full text-white text-sm font-medium">Sin riesgo</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">MAEC &ldquo;Precaución Especial&rdquo;</span>
                <span className="text-slate-400">→</span>
                <span className="bg-yellow-500 px-3 py-1 rounded-full text-white text-sm font-medium">Riesgo bajo</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">MAEC &ldquo;Precaución Elevada&rdquo;</span>
                <span className="text-slate-400">→</span>
                <span className="bg-orange-500 px-3 py-1 rounded-full text-white text-sm font-medium">Riesgo medio</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">MAEC &ldquo;Evitar No Esenciales&rdquo;</span>
                <span className="text-slate-400">→</span>
                <span className="bg-red-500 px-3 py-1 rounded-full text-white text-sm font-medium">Riesgo alto</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">MAEC &ldquo;No Viajar&rdquo;</span>
                <span className="text-slate-400">→</span>
                <span className="bg-red-900 px-3 py-1 rounded-full text-white text-sm font-medium">Muy alto</span>
              </div>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Factores Considerados en la Evaluación
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Seguridad ciudadana</h3>
                    <p className="text-slate-400 text-sm">Tasa de criminalidad, terrorismo, inseguridad</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Estabilidad política</h3>
                    <p className="text-slate-400 text-sm">Conflictos, protestas, situación geopolítica</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Salud pública</h3>
                    <p className="text-slate-400 text-sm">Epidemias, calidad sanitaria, acceso médico</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Infraestructura</h3>
                    <p className="text-slate-400 text-sm">Transporte, comunicaciones, servicios</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Desastres naturales</h3>
                    <p className="text-slate-400 text-sm">Sismos, huracanes, inundaciones</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Marco legal</h3>
                    <p className="text-slate-400 text-sm">Derechos humanos, corrupción, seguridad jurídica</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              Nuestro Compromiso
            </h2>
            <div className="text-slate-300 space-y-4">
              <p>
                <strong className="text-white">Viaje con Inteligencia</strong> se compromete a:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Actualizar la información periódicamente (mínimo mensual)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Señalar claramente las fuentes de cada dato</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Incluir disclaimers prominentes sobre limitaciones</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Redirigir siempre a fuentes oficiales para decisiones críticas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Ser transparentes sobre nuestra metodología</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3">📚 Enlaces Oficiales MAEC</h3>
            <div className="space-y-2">
              <a 
                href="https://www.exteriores.gob.es/Embajadas" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
              >
                Embajadas y Consulados →
              </a>
              <a 
                href="https://www.exteriores.gob.es/es/areas-de-actividades/consulares/ultima-hora" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
              >
                Alertas de viaje →
              </a>
              <a 
                href="https://www.exteriores.gob.es/es/servicios/al-registro-de-viajeros" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
              >
                Registro de viajeros →
              </a>
            </div>
          </div>

        <section className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-blue-400" />
            {"App Móvil - Instala Nuestra PWA"}
          </h2>
            <p className="text-slate-300 mb-6">
              Añade <strong className="text-white">Viaje con Inteligencia</strong> a tu pantalla de inicio para acceder rápidamente como una app nativa.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-3">📱 En Android</h3>
                <ol className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-medium">1.</span>
                    Abre este sitio en Chrome
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-medium">2.</span>
                    Toca los tres puntos (arriba derecha)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-medium">3.</span>
                    Selecciona "Añadir a pantalla inicio"
                  </li>
                </ol>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-3">🍎 En iOS (iPhone)</h3>
                <ol className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-medium">1.</span>
                    Abre este sitio en Safari
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-medium">2.</span>
                    Toca el botón compartir (⬆️)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-medium">3.</span>
                    Selecciona "Añadir a pantalla inicio"
                  </li>
                </ol>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
              <h3 className="font-bold text-green-400 mb-2">✅ Instalada</h3>
              <p className="text-slate-300 text-sm">
                Una vez instalada, funcionará como app independiente. Podrás acceder desde tu pantalla de inicio sin abrir el navegador.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M.Castillo - Viaje con Inteligencia | 
            <Link href="/legal" className="text-blue-400 hover:text-blue-300 ml-2">Aviso Legal</Link>
          </p>
        </div>
      </footer>
      <InstallPWA />
    </div>
  );
}
