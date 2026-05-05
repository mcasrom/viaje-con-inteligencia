'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Globe, Sun, Moon, MapPin } from 'lucide-react';

interface WorldClock {
  city: string;
  country: string;
  flag: string;
  timezone: string;
  region: string;
}

const CLOCKS: WorldClock[] = [
  { city: 'Madrid', country: 'España', flag: '🇪🇸', timezone: 'Europe/Madrid', region: 'Europa' },
  { city: 'Londres', country: 'Reino Unido', flag: '🇬🇧', timezone: 'Europe/London', region: 'Europa' },
  { city: 'París', country: 'Francia', flag: '🇫🇷', timezone: 'Europe/Paris', region: 'Europa' },
  { city: 'Berlín', country: 'Alemania', flag: '🇩🇪', timezone: 'Europe/Berlin', region: 'Europa' },
  { city: 'Roma', country: 'Italia', flag: '🇮🇹', timezone: 'Europe/Rome', region: 'Europa' },
  { city: 'Nueva York', country: 'EE.UU.', flag: '🇺🇸', timezone: 'America/New_York', region: 'América' },
  { city: 'Los Ángeles', country: 'EE.UU.', flag: '🇺🇸', timezone: 'America/Los_Angeles', region: 'América' },
  { city: 'Ciudad de México', country: 'México', flag: '🇲🇽', timezone: 'America/Mexico_City', region: 'América' },
  { city: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', timezone: 'America/Argentina/Buenos_Aires', region: 'América' },
  { city: 'São Paulo', country: 'Brasil', flag: '🇧🇷', timezone: 'America/Sao_Paulo', region: 'América' },
  { city: 'Tokio', country: 'Japón', flag: '🇯🇵', timezone: 'Asia/Tokyo', region: 'Asia' },
  { city: 'Bangkok', country: 'Tailandia', flag: '🇹🇭', timezone: 'Asia/Bangkok', region: 'Asia' },
  { city: 'Dubái', country: 'EAU', flag: '🇦🇪', timezone: 'Asia/Dubai', region: 'Asia' },
  { city: 'Mumbai', country: 'India', flag: '🇮🇳', timezone: 'Asia/Kolkata', region: 'Asia' },
  { city: 'Shanghái', country: 'China', flag: '🇨🇳', timezone: 'Asia/Shanghai', region: 'Asia' },
  { city: 'Sídney', country: 'Australia', flag: '🇦🇺', timezone: 'Australia/Sydney', region: 'Oceanía' },
  { city: 'El Cairo', country: 'Egipto', flag: '🇪🇬', timezone: 'Africa/Cairo', region: 'África' },
  { city: 'Moscú', country: 'Rusia', flag: '🇷🇺', timezone: 'Europe/Moscow', region: 'Europa' },
];

function getTimeInZone(timezone: string): { time: string; date: string; offset: string; isDay: boolean } {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-ES', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const dateStr = now.toLocaleDateString('es-ES', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const offset = now.toLocaleTimeString('es-ES', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  }).split(' ').pop() || '';
  const hour = parseInt(now.toLocaleTimeString('es-ES', { timeZone: timezone, hour: '2-digit', hour12: false }));
  const isDay = hour >= 6 && hour < 20;
  return { time: timeStr, date: dateStr, offset, isDay };
}

export default function RelojesClient() {
  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState<string>('Todas');

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const regions = ['Todas', ...Array.from(new Set(CLOCKS.map(c => c.region)))];
  const filtered = filter === 'Todas' ? CLOCKS : CLOCKS.filter(c => c.region === filter);
  const grouped = filtered.reduce((acc, clock) => {
    if (!acc[clock.region]) acc[clock.region] = [];
    acc[clock.region].push(clock);
    return acc;
  }, {} as Record<string, WorldClock[]>);

  const madridTime = getTimeInZone('Europe/Madrid');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Globe className="w-8 h-8 text-cyan-400" />Horario Mundial
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Hora actual en las principales ciudades del mundo. Organiza llamadas y viajes sin confusiones de huso horario.
          </p>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Tu hora local (Madrid)</span>
          </div>
          <div className="text-5xl font-mono font-bold text-white mb-1">{madridTime.time}</div>
          <div className="text-slate-400 text-sm">{madridTime.date} · {madridTime.offset}</div>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-800/60 rounded-lg p-1.5 border border-slate-700/50 overflow-x-auto">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setFilter(region)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === region ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([region, clocks]) => (
            <div key={region}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                {region}
                <span className="text-slate-500 text-sm font-normal">({clocks.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {clocks.map(clock => {
                  const timeInfo = getTimeInZone(clock.timezone);
                  return (
                    <div
                      key={clock.city}
                      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{clock.flag}</span>
                          <div>
                            <h3 className="text-white font-bold text-sm">{clock.city}</h3>
                            <p className="text-slate-500 text-xs">{clock.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400 text-xs">{timeInfo.offset}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {timeInfo.isDay ? (
                          <Sun className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-indigo-400" />
                        )}
                        <span className="text-2xl font-mono font-bold text-white">{timeInfo.time}</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">{timeInfo.date}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay ciudades en esta región.</p>
          </div>
        )}
      </div>
    </div>
  );
}
