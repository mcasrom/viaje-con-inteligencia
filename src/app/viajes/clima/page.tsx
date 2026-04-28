'use client';
import Link from 'next/link';
import { ArrowLeft, Cloud, MapPin, Globe } from 'lucide-react';

const paisesClima = [
  { code: 'es', nombre: 'España', flag: '🇪🇸' },
  { code: 'fr', nombre: 'Francia', flag: '🇫🇷' },
  { code: 'it', nombre: 'Italia', flag: '🇮🇹' },
  { code: 'pt', nombre: 'Portugal', flag: '🇵🇹' },
  { code: 'gb', nombre: 'Reino Unido', flag: '🇬🇧' },
  { code: 'de', nombre: 'Alemania', flag: '🇩🇪' },
  { code: 'us', nombre: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'mx', nombre: 'México', flag: '🇲🇽' },
  { code: 'jp', nombre: 'Japón', flag: '🇯🇵' },
  { code: 'th', nombre: 'Tailandia', flag: '🇹🇭' },
];

export default function ClimaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          🗺️ Volver al mapa
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <Cloud className="w-8 h-8 text-blue-500" />
          🌤️ Clima en Tiempo Real
        </h1>
        <p className="text-slate-600 mt-2">
          Pronóstico de 7 días con datos de Open-Meteo
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {paisesClima.map((pais) => (
          <Link
            key={pais.code}
            href={`/viajes/clima/${pais.code}`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <span className="text-2xl">{pais.flag}</span>
            <span className="font-medium text-slate-700">{pais.nombre}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <h2 className="font-bold text-blue-900 flex items-center gap-2">
          <Globe className="w-5 h-5" />
         Fuente: Open-Meteo API
        </h2>
        <p className="text-sm text-blue-700 mt-1">
          Datos meteorológicos en tiempo real para planificación de viajes.
          Temperatura, precipitación y viento para los próximos 7 días.
        </p>
      </div>
    </div>
  );
}