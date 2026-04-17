'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { getWeatherForecast, WeatherForecast, getWeatherIcon, getWeatherDescription, getWeatherRecommendation } from '@/lib/weather';

interface WeatherWidgetProps {
  lat: number;
  lon: number;
  countryName: string;
  compact?: boolean;
}

export default function WeatherWidget({ lat, lon, countryName, compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        const data = await getWeatherForecast(lat, lon, compact ? 3 : 7);
        if (data) {
          setWeather(data);
        } else {
          setError('No se pudo obtener el clima');
        }
      } catch {
        setError('Error al cargar');
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [lat, lon, compact]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="w-5 h-5 text-slate-500" />
          <span className="text-slate-400 text-sm">Cargando clima...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">Clima no disponible</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getWeatherIcon(weather.current.weatherCode)}</span>
            <div>
              <p className="text-white font-bold text-lg">{weather.current.temp}°C</p>
              <p className="text-slate-400 text-sm">{getWeatherDescription(weather.current.weatherCode)}</p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p className="flex items-center gap-1"><Wind className="w-3 h-3" /> {weather.current.windSpeed} km/h</p>
            <p className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {weather.current.humidity}%</p>
          </div>
        </div>
        {weather.daily[0] && (
          <p className="mt-2 text-xs text-slate-500">
            Máx: {weather.daily[0].tempMax}° / Mín: {weather.daily[0].tempMin}°
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-400" />
          Clima - {countryName}
        </h3>
        <span className="text-xs text-slate-500">Fuente: Open-Meteo</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <span className="text-4xl block mb-1">{getWeatherIcon(weather.current.weatherCode)}</span>
          <p className="text-2xl font-bold text-white">{weather.current.temp}°C</p>
          <p className="text-slate-400 text-sm">{getWeatherDescription(weather.current.weatherCode)}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Wind className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Viento:</span>
            <span className="text-white ml-auto">{weather.current.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Humedad:</span>
            <span className="text-white ml-auto">{weather.current.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Sensación:</span>
            <span className="text-white ml-auto">{weather.current.temp}°</span>
          </div>
        </div>
      </div>

      {weather.daily[0] && (
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-300">
            {getWeatherRecommendation(weather.current.weatherCode, weather.daily[0].tempMin, weather.daily[0].tempMax)}
          </p>
        </div>
      )}

      <div className="border-t border-slate-700 pt-4">
        <p className="text-sm text-slate-400 mb-3">Próximos días:</p>
        <div className="grid grid-cols-4 gap-2">
          {weather.daily.slice(0, 4).map((day, i) => (
            <div key={i} className="bg-slate-700/30 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-500 mb-1">
                {i === 0 ? 'Hoy' : new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
              </p>
              <p className="text-lg">{getWeatherIcon(day.weatherCode)}</p>
              <p className="text-xs text-white">
                <span className="text-orange-400">{day.tempMax}°</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-blue-400">{day.tempMin}°</span>
              </p>
              {day.precipitation > 0 && (
                <p className="text-xs text-blue-400 flex items-center justify-center gap-1">
                  <CloudRain className="w-3 h-3" /> {day.precipitation}mm
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
