import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Mail, AlertTriangle, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aviso Legal | Viaje con Inteligencia',
  description: 'Aviso legal, términos de uso y política de privacidad de Viaje con Inteligencia.',
  openGraph: {
    title: 'Aviso Legal | Viaje con Inteligencia',
    url: 'https://www.viajeinteligencia.com/legal',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/legal',
  },
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Aviso Legal</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Términos de uso, política de privacidad y condiciones legales de Viaje con Inteligencia.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {/* Identity */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Datos identificativos</h2>
            </div>
            <div className="space-y-2 text-slate-300 text-sm">
              <p><strong className="text-white">Titular:</strong> M. Castillo</p>
              <p><strong className="text-white">Sitio web:</strong> www.viajeinteligencia.com</p>
              <p><strong className="text-white">Email:</strong> info@viajeinteligencia.com</p>
              <p><strong className="text-white">Actividad:</strong> Agregador de información de viaje y análisis de riesgo</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Descargo de responsabilidad</h2>
            </div>
            <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
              <p>
                <strong className="text-white">Información orientativa:</strong> Los datos y análisis presentados en este sitio web tienen carácter puramente informativo y orientativo. No constituyen asesoramiento legal, médico ni de seguridad profesional.
              </p>
              <p>
                <strong className="text-white">Fuentes externas:</strong> Los niveles de riesgo se basan en las recomendaciones publicadas por el MAEC. No garantizamos que la información esté actualizada en todo momento. Consulta siempre las fuentes oficiales antes de tomar decisiones de viaje.
              </p>
              <p>
                <strong className="text-white">Responsabilidad:</strong> El titular no se hace responsable de los daños o perjuicios derivados del uso de la información contenida en este sitio web. Cada viajero es responsable de su propia seguridad y debe consultar fuentes oficiales.
              </p>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Política de privacidad</h2>
            </div>
            <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
              <p>
                <strong className="text-white">Datos recopilados:</strong> Este sitio puede recopilar datos de uso (analytics) y, si te registras, tu email y preferencias de viaje. No vendemos ni compartemos datos personales con terceros con fines comerciales.
              </p>
              <p>
                <strong className="text-white">Cookies:</strong> Utilizamos cookies técnicas necesarias para el funcionamiento del sitio y, opcionalmente, cookies analíticas para mejorar la experiencia del usuario.
              </p>
              <p>
                <strong className="text-white">Derechos:</strong> Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad contactando a info@viajeinteligencia.com.
              </p>
              <p>
                <strong className="text-white">Base legal:</strong> El tratamiento de datos se basa en tu consentimiento y en el interés legítimo de mejorar nuestros servicios.
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Términos de uso</h2>
            </div>
            <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
              <p>
                <strong className="text-white">Uso permitido:</strong> Puedes consultar y utilizar la información de este sitio para planificación personal de viajes. No se permite la reproducción masiva, scraping comercial o redistribución sin autorización.
              </p>
              <p>
                <strong className="text-white">Propiedad intelectual:</strong> El contenido original (análisis, textos, diseño) es propiedad del titular. Los datos de fuentes externas pertenecen a sus respectivos propietarios.
              </p>
              <p>
                <strong className="text-white">Enlaces externos:</strong> Este sitio contiene enlaces a webs de terceros (MAEC, WHO, etc.). No nos responsabilizamos del contenido de sitios externos.
              </p>
              <p>
                <strong className="text-white">Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos desde su publicación.
              </p>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Suscripción Premium</h2>
            </div>
            <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
              <p>
                <strong className="text-white">Pagos:</strong> Los pagos de la suscripción Premium se procesan a través de Stripe. Se facturará automáticamente al finalizar el periodo de prueba o el ciclo de facturación vigente.
              </p>
              <p>
                <strong className="text-white">Cancelación:</strong> Puedes cancelar tu suscripción en cualquier momento desde tu dashboard. No hay permanencia ni penalización. Se mantendrá el acceso hasta el final del periodo pagado.
              </p>
              <p>
                <strong className="text-white">Reembolsos:</strong> Si no estás satisfecho en los primeros 7 días, contacta para solicitar reembolso completo.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Para cualquier consulta legal o ejercicio de derechos: <a href="mailto:info@viajeinteligencia.com" className="text-blue-400 hover:underline">info@viajeinteligencia.com</a>
          </p>
          <p className="text-slate-600 text-xs mt-4">
            Última actualización: Mayo 2026
          </p>
        </div>
      </div>
    </div>
  );
}
