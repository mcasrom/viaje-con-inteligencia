'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Sun, Moon, Globe, ArrowLeft, MapPin, Calendar } from 'lucide-react';

interface City {
  name: string;
  timezone: string;
  pais: string;
  bandera: string;
  hora?: string;
  fecha?: string;
}

const CAPITALES: City[] = [
  { name: 'Madrid', timezone: 'Europe/Madrid', pais: 'España', bandera: '🇪🇸' },
  { name: 'Londres', timezone: 'Europe/London', pais: 'Reino Unido', bandera: '🇬🇧' },
  { name: 'Nueva York', timezone: 'America/New_York', pais: 'EE.UU.', bandera: '🇺🇸' },
  { name: 'Los Ángeles', timezone: 'America/Los_Angeles', pais: 'EE.UU.', bandera: '🇺🇸' },
  { name: 'Tokio', timezone: 'Asia/Tokyo', pais: 'Japón', bandera: '🇯🇵' },
  { name: 'Sídney', timezone: 'Australia/Sydney', pais: 'Australia', bandera: '🇦🇺' },
  { name: 'Dubái', timezone: 'Asia/Dubai', pais: 'Emiratos Árabes', bandera: '🇦🇪' },
  { name: 'Singapur', timezone: 'Asia/Singapur', pais: 'Singapur', bandera: '🇸🇬' },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo', pais: 'Brasil', bandera: '🇧🇷' },
  { name: 'Ciudad de México', timezone: 'America/Mexico_City', pais: 'México', bandera: '🇲🇽' },
  { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', pais: 'Argentina', bandera: '🇦🇷' },
  { name: 'Paris', timezone: 'Europe/Paris', pais: 'Francia', bandera: '🇫🇷' },
  { name: 'Berlin', timezone: 'Europe/Berlin', pais: 'Alemania', bandera: '🇩🇪' },
  { name: 'Roma', timezone: 'Europe/Rome', pais: 'Italia', bandera: '🇮🇹' },
  { name: 'Bangkok', timezone: 'Asia/Bangkok', pais: 'Tailandia', bandera: '🇹🇭' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', pais: 'Hong Kong', bandera: '🇭🇰' },
  { name: 'Mumbai', timezone: 'Asia/Kolkata', pais: 'India', bandera: '🇮🇳' },
  { name: 'El Cairo', timezone: 'Africa/Cairo', pais: 'Egipto', bandera: '🇪🇬' },
  { name: 'Johannesburgo', timezone: 'Africa/Johannesburg', pais: 'Sudáfrica', bandera: '🇿🇦' },
  { name: 'Moscú', timezone: 'Europe/Moscow', pais: 'Rusia', bandera: '🇷🇺' },
];

export default function WorldClocksPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockTimes, setClockTimes] = useState<City[]>(CAPITALES);
  const [isDay, setIsDay] = useState(true);
  const [sunPosition, setSunPosition] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const updatedTimes = CAPITALES.map(city => {
        try {
          const cityDate = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));
          return {
            ...city,
            hora: cityDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
            fecha: cityDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
          };
        } catch {
          return { ...city, hora: '--:--:--', fecha: '--' };
        }
      });
      setClockTimes(updatedTimes);
      
      calculateDayNight(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateDayNight = (date: Date) => {
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
    setIsDay(hour >= 6 && hour < 18);
  };

  const getTimeOfDay = (timezone: string): string => {
    try {
      const cityDate = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
      const hour = cityDate.getHours();
      if (hour >= 6 && hour < 12) return '🌅 Mañana';
      if (hour >= 12 && hour < 18) return '☀️ Tarde';
      if (hour >= 18 && hour < 22) return '🌆 Atardecer';
      return '🌙 Noche';
    } catch {
      return '❓';
    }
  };

  const isNightTime = (timezone: string): boolean => {
    try {
      const cityDate = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
      const hour = cityDate.getHours();
      return hour < 6 || hour >= 20;
    } catch {
      return false;
    }
  };

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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Relojes Mundiales
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
           🌍 Hora Mundial en Directo
          </h1>
          <p className="text-slate-400">
            Relojes en tiempo real de las principales capitales del mundo
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8 p-6 bg-slate-800 rounded-2xl border border-slate-700">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
            <div className="text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className={`text-4xl ${isDay ? 'text-yellow-400' : 'text-blue-400'}`}>
            {isDay ? '☀️' : '🌙'}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clockTimes.map((city, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all ${
                isNightTime(city.timezone) 
                  ? 'bg-slate-800/50 border-slate-700' 
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{city.bandera}</span>
                <span className={`text-xs ${isNightTime(city.timezone) ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {getTimeOfDay(city.timezone)}
                </span>
              </div>
              <div className="text-sm text-slate-400 mb-1">{city.name}</div>
              <div className="text-xs text-slate-500 mb-2">{city.pais}</div>
              <div className="text-2xl font-bold text-white">
                {city.hora || '--:--:--'}
              </div>
              <div className="text-xs text-slate-500">
                {city.fecha}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            🌐 ¿Tu ciudad favorita?
          </h3>
          <p className="text-white/80 mb-6">
            SolicitaAñadir más ciudades a los relojes mundiales.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-100 transition-colors"
          >
            Contactar
          </Link>
        </div>
      </main>
    </div>
  );
}