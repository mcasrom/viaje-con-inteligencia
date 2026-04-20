import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Shield, FileText, Scale, Mail } from 'lucide-react';

export default function LegalPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 font-medium mb-6">
            <Scale className="w-5 h-5" />
            <span>Información Legal</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Aviso Legal y Disclaimer</h1>
          <p className="text-xl text-slate-400">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8">
          <section className="bg-red-900/20 border border-red-800/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h2 className="text-2xl font-bold text-red-400">Advertencia Importante</h2>
            </div>
            <div className="text-slate-300 space-y-4">
              <p>
                <strong className="text-white">Viaje con Inteligencia</strong> es una herramienta informativa 
                que recopila y presenta datos de fuentes públicas, principalmente del 
                <strong className="text-amber-400"> MAEC (Ministerio de Asuntos Exteriores, Unión Europea y Cooperación)</strong> 
                de España.
              </p>
              <p>
                <strong className="text-white">Esta aplicación NO es un sustituto</strong> de la información oficial 
                proporcionada por las autoridades gubernamentales. Los datos presentados son orientativos y pueden 
                <strong className="text-red-400"> no reflejar cambios recientes</strong> en las condiciones de viaje.
              </p>
              <p className="bg-slate-800/50 p-4 rounded-lg border-l-4 border-red-500">
                <strong>⚠️ RESPONSABILIDAD:</strong> El usuario es el único responsable de verificar la 
                información actualizada antes de realizar cualquier viaje internacional. Ni Viaje con Inteligencia 
                ni su creador asumen responsabilidad alguna por decisiones tomadas basándose en esta información.
              </p>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              Fuentes de Información
            </h2>
            <div className="text-slate-300 space-y-4">
              <p>
                Los datos de riesgos de viaje se basan principalmente en:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Recomendaciones del MAEC español (exteriores.gob.es)</li>
                <li>Información de embajadas y consulados</li>
                <li>Datos públicos de organizaciones internacionales</li>
                <li>Fuentes periodísticas verificadas</li>
              </ul>
              <p>
                Los niveles de riesgo (Sin riesgo, Bajo, Medio, Alto, Muy alto) son una 
                <strong className="text-amber-400"> interpretación simplificada</strong> de los 
                informes oficiales y pueden variar respecto a las clasificaciones originales.
              </p>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" />
              Limitaciones del Servicio
            </h2>
            <div className="text-slate-300 space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Los datos pueden no estar actualizados en tiempo real</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>No garantizamos la exactitud de información de terceros</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Los requisitos de visado y entrada pueden cambiar sin previo aviso</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Las condiciones de seguridad son dinámicas y contextuales</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Esta app no puede predecir eventos imprevisibles (desastres naturales, conflictos, etc.)</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Recomendaciones de Uso</h2>
            <div className="text-slate-300 space-y-4">
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-bold mb-2">✓ Antes de viajar:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Consultar siempre la web oficial del MAEC</li>
                  <li>• Verificar requisitos de visado en la embajada</li>
                  <li>• Contratar seguro de viaje con cobertura médica</li>
                  <li>• Registrarte en el Registro de Viajeros del MAEC</li>
                </ul>
              </div>
              <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4">
                <h3 className="text-amber-400 font-bold mb-2">⚠️ Durante el viaje:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Mantener documentos de identidad seguros</li>
                  <li>• Seguir las indicaciones de autoridades locales</li>
                  <li>• Mantener informada a tu embajada/consulado</li>
                  <li>• Tener números de emergencia local</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Propiedad Intelectual</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                El contenido, diseño y código de <strong className="text-white">Viaje con Inteligencia</strong> 
                está protegido por derechos de autor. Queda prohibida la reproducción total o parcial sin 
                autorización expresa.
              </p>
              <p>
                Las marcas, logos y nombres de países son propiedad de sus respectivos titulares.
              </p>
            </div>
          </section>

          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Contacto</h2>
            <div className="text-slate-300">
              <p className="mb-4">
                Para consultas sobre este aviso legal:
              </p>
              <a 
                href="mailto:info@viajeinteligencia.com" 
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <Mail className="w-4 h-4" />
                info@viajeinteligencia.com
              </a>
            </div>
          </section>
        </div>
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
