'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPaisPorCodigo } from '@/data/paises';
import { 
  ArrowLeft, MapPin, Phone, Mail, Clock, FileText, 
  AlertTriangle, DollarSign, Globe, Newspaper, 
  ExternalLink, Building2, CheckCircle2, XCircle, 
  Plane, Info, Flag, Users, Clock3, Zap, Car, MapPinned
} from 'lucide-react';
import { notFound } from 'next/navigation';
import Reviews from '@/components/Reviews';
import WeatherWidget from '@/components/WeatherWidget';

export default function DetallePais() {
  const params = useParams();
  const router = useRouter();
  const codigo = params.codigo as string;
  const pais = getPaisPorCodigo(codigo);

  if (!pais) {
    notFound();
  }

  const riesgoConfig = {
    'sin-riesgo': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', description: 'No existen riesgos específicos. Puede viajarse con normalidad.' },
    'bajo': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', description: 'Riesgo bajo. Se recomienda tomar precauciones normales.' },
    'medio': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', description: 'Riesgo moderado. Se recomienda extremar precauciones.' },
    'alto': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', description: 'Riesgo alto. Se desaconsejan los viajes no esenciales.' },
    'muy-alto': { bg: 'bg-red-900', text: 'text-red-400', border: 'border-red-900', description: 'Riesgo muy alto. Se desaconsejan todos los viajes.' }
  };

  const config = riesgoConfig[pais.nivelRiesgo];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className={`bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl p-8 mb-8 border-2 ${config.border}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-7xl">{pais.bandera}</span>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">{pais.nombre}</h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Capital: {pais.capital} • {pais.continente}
                </p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-xl ${config.bg} text-white font-bold text-lg`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                <span>{config.text.split('-')[0].replace('text-', '').charAt(0).toUpperCase() + config.text.split('-')[0].replace('text-', '').slice(1)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm">
              <Info className="w-4 h-4 inline mr-2" />
              {config.description}
            </p>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Actualizado según MAEC: {pais.ultimoInforme}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPinned className="w-5 h-5 text-blue-400" />
              Información General
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Flag className="w-4 h-4" />Idioma</span>
                <span className="text-white">{pais.idioma}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Users className="w-4 h-4" />Población</span>
                <span className="text-white">{pais.poblacion}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><DollarSign className="w-4 h-4" />PIB</span>
                <span className="text-white">{pais.pib}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Economía
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Moneda</span>
                <span className="text-white">{pais.moneda}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tipo cambio</span>
                <span className="text-white">{pais.tipoCambio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">IPC</span>
                <span className="text-white">{pais.indicadores.ipc}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Índice precios</span>
                <span className="text-white">{pais.indicadores.indicePrecios}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Localización
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Clock3 className="w-4 h-4" />Zona horaria</span>
                <span className="text-white">{pais.zonaHoraria}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Prefijo</span>
                <span className="text-white">{pais.prefijoTelefono}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Car className="w-4 h-4" />Conducción</span>
                <span className="text-white">{pais.conduccion === 'derecha' ? '↱ Derecha' : '↰ Izquierda'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Zap className="w-4 h-4" />Voltaje</span>
                <span className="text-white">{pais.voltaje}</span>
              </div>
            </div>
          </div>
        </div>

        <WeatherWidget 
          lat={pais.mapaCoordenadas[0]} 
          lon={pais.mapaCoordenadas[1]} 
          countryName={pais.nombre}
        />

        <div className="grid lg:grid-cols-2 gap-8 mb-8 mt-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-400" />
              Embajadas y Consulados de España
            </h2>
            <div className="space-y-4">
              {pais.contactos.map((contacto, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                      {contacto.tipo}
                    </span>
                    <h4 className="text-white font-medium">{contacto.nombre}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-400 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {contacto.direccion}
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <a href={`tel:${contacto.telefono}`} className="hover:text-blue-400 transition-colors">
                        {contacto.telefono}
                      </a>
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <a href={`mailto:${contacto.email}`} className="hover:text-blue-400 transition-colors">
                        {contacto.email}
                      </a>
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      {contacto.horario}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-400" />
              Requisitos de Entrada
            </h2>
            <div className="space-y-4">
              {pais.requerimientos.map((req, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <span className="text-xl">{req.icon}</span>
                    {req.categoria}
                  </h4>
                  <ul className="space-y-2">
                    {req.items.map((item, i) => (
                      <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-green-900/20 rounded-xl p-6 border border-green-800/30">
            <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Qué Hacer
            </h2>
            <ul className="space-y-3">
              {pais.queHacer.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-900/20 rounded-xl p-6 border border-red-800/30">
            <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              Qué NO Hacer
            </h2>
            <ul className="space-y-3">
              {pais.queNoHacer.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-orange-400" />
              Diarios de Mayor Difusión
            </h2>
            <div className="space-y-3">
              {pais.diarios.map((diario, index) => (
                <a
                  key={index}
                  href={diario.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  <span className="text-slate-300">{diario.nombre}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ExternalLink className="w-6 h-6 text-cyan-400" />
              Enlaces Útiles
            </h2>
            <div className="space-y-3">
              {pais.urlsUtiles.map((url, index) => (
                <a
                  key={index}
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  <span className="text-slate-300">{url.nombre}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Recomendación Final
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Antes de viajar a <strong className="text-white">{pais.nombre}</strong>, asegúrese de verificar los 
            requisitos actualizados en la página oficial del MAEC. Los niveles de riesgo pueden cambiar según 
            la situación geopolítica y sanitaria del momento. Se recomienda contratar un seguro de viaje con 
            cobertura médica completa y revisar las recomendaciones de viaje del Ministerio de Asuntos Exteriores.
          </p>
        </div>

        <Reviews countryCode={codigo} countryName={pais.nombre} />
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al Mapa Mundial
          </Link>
          <p className="text-slate-500 text-sm mt-4">
            © {new Date().getFullYear()} <a href="mailto:mybloggingnotes@gmail.com" className="text-slate-400 hover:text-blue-400">M.Castillo</a> - 
            Información basada en datos oficiales del MAEC español
          </p>
        </div>
      </footer>
    </div>
  );
}
