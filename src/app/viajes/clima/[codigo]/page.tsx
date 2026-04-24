'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Cloud, Plane, Thermometer, Wind, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface WeatherData {
  country: string;
  city: string;
  current: { code: number; desc: string; icon: string; temp: number };
  forecast: Array<{
    date: string;
    code: number;
    desc: string;
    icon: string;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    windMax: number;
  }>;
}

interface MetarData {
  icao: string;
  name: string;
  flightCategory: string;
  temp: number;
  wind: { speed: number; gust: number | null; dir: number };
  visibility: number;
  raw: string;
  source: string;
}

const FLIGHT_RISK: Record<string, { label: string; color: string; desc: string }> = {
  VFR: { label: 'VFR', color: 'green', desc: 'Visual Flight Rules -Condiciones óptimas de vuelo' },
  MVFR: { label: 'MVFR', color: 'blue', desc: 'Marginal VFR - Condiciones aceptables' },
  IFR: { label: 'IFR', color: 'red', desc: 'Instrument Flight Rules - Condiciones limitadas' },
  LIFR: { label: 'LIFR', color: 'purple', desc: 'Low IFR - Condiciones difíciles de vuelo' },
};

const BEST_SEASON: Record<string, { months: number[]; label: string; temp: string }> = {
  es: { months: [5, 6, 9, 10], label: 'Primavera/Otoño', temp: '18-25°C' },
  fr: { months: [5, 6, 9, 10], label: 'Primavera/Otoño', temp: '15-22°C' },
  it: { months: [4, 5, 9, 10], label: 'Primavera/Otoño', temp: '18-25°C' },
  gb: { months: [5, 6, 7, 8], label: 'Verano', temp: '15-20°C' },
  us: { months: [5, 6, 9, 10], label: 'Primavera/Otoño', temp: '18-28°C' },
  mx: { months: [11, 12, 1, 2, 3, 4], label: 'Invierno/Primavera', temp: '20-30°C' },
 jp: { months: [4, 5, 10, 11], label: 'Primavera/Otoño', temp: '15-22°C' },
  au: { months: [11, 12, 1, 2, 3], label: 'Verano (hemisferio sur)', temp: '20-30°C' },
};

export default function ViajeClimaPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const code = codigo?.toLowerCase() || 'es';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [w, m] = await Promise.all([
          fetch(`/api/weather?code=${code}&days=7`).then(r => r.json()),
          fetch(`/api/metar?code=${code}`).then(r => r.json()).catch(() => null),
        ]);
        if (w.error) setError(w.error);
        else setWeather(w);
        if (m && !m.error) setMetar(m);
      } catch (e) {
        setError('Error cargando datos');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [code]);

  const getRiskLevel = () => {
    if (!weather?.forecast?.length) return 'unknown';
    const rainy = weather.forecast.filter(f => f.precipitation > 5).length;
    if (metar?.flightCategory === 'VFR' && rainy < 2) return 'good';
    if (metar?.flightCategory === 'IFR' || rainy >= 4) return 'poor';
    return 'moderate';
  };

  const season = BEST_SEASON[code] || BEST_SEASON.es;
  const currentMonth = new Date().getMonth() + 1;
  const isBestSeason = season.months.includes(currentMonth);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Cloud className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando clima...</p>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-blue-400 hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/pais/${code}`} className="flex items-center gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a {weather?.country || code}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Clima Viaje</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Clima y Condiciones de Vuelo
          </h1>
          <p className="text-slate-400">
            Análisis práctico para planificar tu viaje
          </p>
        </div>

        {metar && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Plane className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Condiciones Aéreas</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                metar.flightCategory === 'VFR' ? 'bg-green-500/20 text-green-400' :
                metar.flightCategory === 'MVFR' ? 'bg-blue-500/20 text-blue-400' :
                metar.flightCategory === 'IFR' ? 'bg-red-500/20 text-red-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {metar.flightCategory}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Aeropuerto</p>
                <p className="text-white font-medium">{metar.name}</p>
                <p className="text-slate-500 text-xs">{metar.icao}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Temperatura</p>
                <p className="text-white font-medium">{metar.temp}°C</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Viento</p>
                <p className="text-white font-medium">{metar.wind.speed} km/h</p>
                {metar.wind.gust && <p className="text-slate-500 text-xs">ráfagas: {metar.wind.gust}</p>}
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Visibilidad</p>
                <p className="text-white font-medium">{metar.visibility} km</p>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-3 font-mono">{metar.raw}</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Mejor Época para Visitar</h2>
            {isBestSeason && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" /> Ahora
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <p className="text-white font-medium">{season.label}</p>
              <p className="text-slate-400">{season.temp}</p>
            </div>
            <div className="flex gap-2">
              {season.months.map(m => (
                <span key={m} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
                  m === currentMonth ? 'bg-blue-500 text-white font-bold' : 'bg-slate-700 text-slate-400'
                }`}>
                  {['E','F','M','A','M','J','Jl','A','S','O','N','D'][m-1]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Pronóstico 7 Días</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {weather?.forecast.map((day, i) => (
              <div key={day.date} className={`bg-slate-700/50 rounded-lg p-3 text-center ${i === 0 ? 'border-2 border-blue-500/50' : ''}`}>
                <p className="text-slate-400 text-xs mb-1">
                  {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                </p>
                <span className="text-2xl mb-2 block">{day.icon}</span>
                <p className="text-white text-sm font-medium">{day.tempMax.toFixed(0)}°</p>
                <p className="text-slate-500 text-xs">{day.tempMin.toFixed(0)}°</p>
                {day.precipitation > 0 && (
                  <p className="text-blue-400 text-xs mt-1">💧 {day.precipitation}mm</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <Link href={`/pais/${code}`} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            Ver país completo
          </Link>
          <Link href={`/comparar?a=${code}`} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
            Comparar destinos
          </Link>
        </div>
      </main>
    </div>
  );
}