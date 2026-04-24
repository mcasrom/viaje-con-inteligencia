import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Shield, Plane, Train, Ship, MapPin, Calendar, DollarSign, Thermometer, AlertTriangle, CheckCircle, Building2, Phone, Clock, ExternalLink } from 'lucide-react';

interface DossierData {
  metadata: {
    codigo: string;
    nombre: string;
    bandera: string;
    capital: string;
    continente: string;
    ultimoInforme: string;
  };
  seguridad: {
    nivelRiesgo: string;
    ultimoInforme: string;
    recomendaciones: string[];
    contactosEmergencia: any[];
  };
  informacionGeneral: {
    idioma: string;
    moneda: string;
    zonaHoraria: string;
    voltaje: string;
    prefijoTelefono: string;
    conduccion: string;
  };
  economia: {
    pib: string;
    pibPerCapita: string;
    poblacion: string;
    ipc: string;
  };
  turismo: {
    turistasAnio: string;
    ingresosTurismo: string;
    estanciaMedia: string;
    temporadaAlta: string[];
    destinosPopulares: string[];
  };
  transporte: {
    conduccion: string;
    licencias: string;
    viasFerreas: string;
    metro: boolean;
    altaVelocidad: boolean;
    peajes: boolean;
    airports: any[];
    puertos: any[];
  };
  requisitos: {
    visaSchengen: string;
    pasaporteMinMeses: number;
    vacunas: string;
    seguro: string;
  };
  clima: {
    actual: any;
    forecast: any[];
    mejorEpoca: string;
  };
  queHacer: string[];
  urlsUtiles: { nombre: string; url: string }[];
}

async function getDossier(countryCode: string): Promise<DossierData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'https://viaje-con-inteligencia.vercel.app'}/api/dossier/${countryCode}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const { codigo } = await params;
  return {
    title: `Dossier Premium: ${codigo.toUpperCase()} | Viaje con Inteligencia`,
    description: 'Informe completo de inteligencia de viaje para este destino.',
  };
}

export default async function DossierPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const dossier = await getDossier(codigo);

  if (!dossier) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Dossier no disponible</h1>
          <p className="text-slate-400 mb-6">No se pudo cargar el dossier para este país.</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Volver al mapa</Link>
        </div>
      </div>
    );
  }

  const { metadata, seguridad, informacionGeneral, economia, turismo, transporte, requisitos, clima, queHacer, urlsUtiles } = dossier;

  const riesgoColors: Record<string, string> = {
    'sin-riesgo': 'bg-green-500',
    'bajo': 'bg-yellow-500',
    'medio': 'bg-orange-500',
    'alto': 'bg-red-500',
    'muy-alto': 'bg-red-900',
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 mb-8 border border-blue-500/30">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <span className="text-7xl">{metadata.bandera}</span>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{metadata.nombre}</h1>
              <p className="text-slate-400 flex items-center gap-4">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {metadata.capital}</span>
                <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {metadata.continente}</span>
              </p>
            </div>
            <div className={`px-6 py-3 rounded-xl ${riesgoColors[seguridad.nivelRiesgo] || 'bg-slate-500'} text-white font-bold text-lg`}>
              {seguridad.nivelRiesgo.toUpperCase().replace('-', ' ')}
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* INFORMACIÓN GENERAL */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Información General
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Idioma</span><span className="text-white">{informacionGeneral.idioma}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Moneda</span><span className="text-white">{informacionGeneral.moneda}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Zona Horaria</span><span className="text-white">{informacionGeneral.zonaHoraria}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Voltaje</span><span className="text-white">{informacionGeneral.voltaje}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Prefijo</span><span className="text-white">{informacionGeneral.prefijoTelefono}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Conducción</span><span className="text-white">{informacionGeneral.conduccion === 'derecha' ? 'Derecha ⬆️' : 'Izquierda ⬆️'}</span></div>
            </div>
          </div>

          {/* ECONOMÍA */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Economía
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">PIB</span><span className="text-white font-medium">{economia.pib}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">PIB per cápita</span><span className="text-white">{economia.pibPerCapita}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Población</span><span className="text-white">{economia.poblacion}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Inflación</span><span className="text-white">{economia.ipc}</span></div>
            </div>
          </div>

          {/* TURISMO */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Turismo
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Turistas/año</span><span className="text-white font-medium">{turismo.turistasAnio}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Ingresos</span><span className="text-white">{turismo.ingresosTurismo}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Estancia media</span><span className="text-white">{turismo.estanciaMedia}</span></div>
              <div className="mt-3">
                <span className="text-slate-400 text-sm">Temporada alta:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {turismo.temporadaAlta?.map((m: string) => (
                    <span key={m} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TRANSPORTE */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-cyan-400" />
              Transporte
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {transporte.metro && <CheckCircle className="w-4 h-4 text-green-400" />}
                <span className="text-slate-400">Metro:</span>
                <span className="text-white">{transporte.metro ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                {transporte.altaVelocidad && <CheckCircle className="w-4 h-4 text-green-400" />}
                <span className="text-slate-400">Alta velocidad:</span>
                <span className="text-white">{transporte.altaVelocidad ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex justify-between"><span className="text-slate-400">Vías férreas</span><span className="text-white">{transporte.viasFerreas}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Peajes</span><span className="text-white">{transporte.peajes ? 'Sí' : 'No'}</span></div>
            </div>
            {transporte.airports && transporte.airports.length > 0 && (
              <div className="mt-4">
                <span className="text-slate-400 text-sm">Aeropuertos principales:</span>
                <div className="mt-2 space-y-1">
                  {transporte.airports.slice(0, 3).map((a: any, i: number) => (
                    <div key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      <Plane className="w-3 h-3" /> {a.iata} - {a.ciudad}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CLIMA */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-400" />
              Clima
            </h2>
            {clima.actual && (
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-white">{clima.actual.temperatura}°C</span>
                <div className="text-slate-400">
                  <div>Humedad: {clima.actual.humedad}%</div>
                </div>
              </div>
            )}
            <div className="mt-3">
              <span className="text-slate-400 text-sm">Mejor época:</span>
              <p className="text-white mt-1">{clima.mejorEpoca || 'Primavera y Otoño'}</p>
            </div>
            {clima.forecast && clima.forecast.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {clima.forecast.slice(0, 5).map((d: any, i: number) => (
                  <div key={i} className="flex-shrink-0 bg-slate-700/50 rounded-lg p-2 text-center min-w-[60px]">
                    <div className="text-xs text-slate-400">{new Date(d.fecha).toLocaleDateString('es', { weekday: 'short' })}</div>
                    <div className="text-white font-bold">{d.tempMax}°</div>
                    <div className="text-slate-400 text-xs">{d.tempMin}°</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REQUISITOS */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Requisitos
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-slate-400">Visa Schengen</span><span className="text-white">{requisitos.visaSchengen}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Pasaporte válido</span><span className="text-white">{requisitos.pasaporteMinMeses} meses</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Vacunas</span><span className="text-white">{requisitos.vacunas}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Seguro</span><span className="text-white">{requisitos.seguro}</span></div>
            </div>
          </div>

        </div>

        {/* QUÉ HACER */}
        {queHacer && queHacer.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Qué hacer en {metadata.nombre}
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {queHacer.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACTOS DE EMERGENCIA */}
        {seguridad.contactosEmergencia && seguridad.contactosEmergencia.length > 0 && (
          <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/30 mb-8">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contactos de Emergencia
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seguridad.contactosEmergencia.map((c: any, i: number) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="font-bold text-white">{c.nombre}</div>
                  <div className="text-slate-400 text-sm">{c.tipo}</div>
                  <div className="text-slate-300 mt-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {c.telefono}
                  </div>
                  <div className="text-slate-500 text-xs mt-1">{c.horario}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENLACES ÚTILES */}
        {urlsUtiles && urlsUtiles.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-400" />
              Enlaces Útiles
            </h2>
            <div className="flex flex-wrap gap-3">
              {urlsUtiles.map((u: any, i: number) => (
                <a
                  key={i}
                  href={u.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {u.nombre} <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Datos actualizados: {metadata.ultimoInforme}</p>
          <p className="mt-1">Fuentes: MAEC, World Bank, Open-Meteo</p>
        </div>

      </main>
    </div>
  );
}