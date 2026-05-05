'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Search, Navigation, MapPin, Loader2, AlertTriangle, Sun, Cloud, CloudRain, Star, ArrowLeft, Globe, BarChart3, Route, DollarSign, Sparkles } from 'lucide-react';

// Dynamic import for the map - only loads on client side
const RadiusMap = dynamic(() => import('./RadiusMap'), { ssr: false });

export interface PlaceResult {
  id: string;
  name: string;
  type: string;
  country_code: string;
  country_name: string;
  lat: number;
  lon: number;
  description: string;
  risk_level: string;
  distance: number;
  weather: { temp: number; description: string; icon: string } | null;
  poiCount: number;
  score: number;
}

const RISK_COLORS: Record<string, string> = {
  'sin-riesgo': '#22c55e',
  'bajo': '#eab308',
  'medio': '#f97316',
  'alto': '#ef4444',
  'muy-alto': '#7f1d1d',
};

const RISK_LABELS: Record<string, string> = {
  'sin-riesgo': 'Sin riesgo',
  'bajo': 'Riesgo bajo',
  'medio': 'Riesgo medio',
  'alto': 'Riesgo alto',
  'muy-alto': 'Riesgo muy alto',
};

const TYPE_LABELS: Record<string, string> = {
  'city': 'Ciudad',
  'town': 'Pueblo',
  'poi': 'Punto de interés',
  'beach': 'Playa',
  'museum': 'Museo',
  'heritage': 'Patrimonio',
};

function SearchResults({ places, onSelect, loading }: { places: PlaceResult[]; onSelect: (place: PlaceResult) => void; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        <span className="ml-2 text-slate-400">Analizando destinos...</span>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Selecciona una ubicación y radio para descubrir destinos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
      {places.map((place) => {
        const riskColor = RISK_COLORS[place.risk_level] || '#6b7280';
        const scoreColor = place.score >= 80 ? 'text-green-400' : place.score >= 60 ? 'text-yellow-400' : 'text-orange-400';

        return (
          <button
            key={place.id}
            onClick={() => onSelect(place)}
            className="w-full text-left p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-semibold truncate">{place.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {TYPE_LABELS[place.type] || place.type}
                  </span>
                </div>
                <p className="text-slate-400 text-sm truncate">{place.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {place.distance} km
                  </span>
                  {place.weather && (
                    <span className="flex items-center gap-1">
                      {place.weather.icon.includes('01') || place.weather.icon.includes('02') ? (
                        <Sun className="w-3 h-3 text-yellow-400" />
                      ) : place.weather.icon.includes('10') || place.weather.icon.includes('09') ? (
                        <CloudRain className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Cloud className="w-3 h-3" />
                      )}
                      {place.weather.temp}°C
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {place.poiCount} POIs
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl font-bold ${scoreColor}`}>{place.score}</div>
                <div className="text-xs text-slate-500 mt-1">puntos</div>
                <div
                  className="w-3 h-3 rounded-full mx-auto mt-2"
                  style={{ backgroundColor: riskColor }}
                  title={RISK_LABELS[place.risk_level]}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function RadiusExplorer() {
  const [center, setCenter] = useState<[number, number]>([40.4168, -3.7038]);
  const [radius, setRadius] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapZoom, setMapZoom] = useState(6);

  const handleSearch = useCallback(async (lat: number, lon: number, currentRadius: number) => {
    setLoading(true);
    setError(null);
    setPlaces([]);

    try {
      const res = await fetch('/api/radius-recommender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, radius: currentRadius }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPlaces(data.places || []);
      }
    } catch (err) {
      setError('Error conectando con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGeolocate = () => {
    setUseMyLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setCenter(newCenter);
          setMapZoom(10);
          handleSearch(pos.coords.latitude, pos.coords.longitude, radius);
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
            .then(res => res.json())
            .then(data => {
              setSearchQuery(data.display_name || 'Mi ubicación');
            })
            .catch(() => setSearchQuery('Mi ubicación'));
        },
        () => {
          setError('No se pudo obtener tu ubicación. Permite el acceso a la geolocalización.');
          setUseMyLocation(false);
        }
      );
    }
  };

  const handlePlaceSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const newCenter: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setCenter(newCenter);
          setMapZoom(10);
          setUseMyLocation(false);
          handleSearch(parseFloat(data[0].lat), parseFloat(data[0].lon), radius);
        } else {
          setError('No se encontró la ubicación');
        }
      })
      .catch(() => setError('Error buscando la ubicación'));
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      handleSearch(center[0], center[1], newRadius);
    }, 500);
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    setCenter([place.lat, place.lon]);
    setMapZoom(12);
  };

  const scoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Muy bueno';
    if (score >= 40) return 'Bueno';
    return 'Regular';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al mapa</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/15 rounded-full border border-purple-500/30">
              <Navigation className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-semibold">Radio Inteligente</span>
            </div>
          </div>
          <div className="flex items-center gap-1 pb-2 overflow-x-auto">
            {[
              { href: '/', label: 'Mapa', icon: <Globe className="w-3 h-3" /> },
              { href: '/decidir', label: 'Decidir', icon: <Sparkles className="w-3 h-3" /> },
              { href: '/coste', label: 'Coste', icon: <DollarSign className="w-3 h-3" /> },
              { href: '/analisis', label: 'Análisis', icon: <BarChart3 className="w-3 h-3" /> },
              { href: '/rutas', label: 'Rutas', icon: <Route className="w-3 h-3" /> },
              { href: '/radius', label: 'Radius', icon: <Navigation className="w-3 h-3" />, active: true },
              { href: '/indices', label: 'KPIs', icon: <BarChart3 className="w-3 h-3" /> },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  link.active
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search bar */}
        <div className="flex gap-2">
          <form onSubmit={handlePlaceSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ciudad o lugar..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </form>
          <button
            onClick={handleGeolocate}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
              useMyLocation
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span className="hidden sm:inline">Mi ubicación</span>
          </button>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-slate-700 h-[500px] relative">
          <RadiusMap
            center={center}
            radius={radius}
            zoom={mapZoom}
            places={places}
            onPlaceClick={handleSelectPlace}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Radius selector */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            Radio de búsqueda
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{radius} km</span>
              <span className="text-slate-500 text-xs">~{Math.round(radius / 50)}h conducción</span>
            </div>
            <input
              type="range"
              min={25}
              max={500}
              step={25}
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>25 km</span>
              <span>500 km</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 200, 300].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRadiusChange(r)}
                  className={`py-1.5 rounded text-xs font-medium transition-all ${
                    radius === r
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected place detail */}
        {selectedPlace && (
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-800/50 rounded-xl p-4 border border-purple-500/30">
            <h3 className="text-white font-bold text-lg mb-2">{selectedPlace.name}</h3>
            <p className="text-slate-300 text-sm mb-3">{selectedPlace.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-800/80 rounded-lg p-2">
                <div className="text-slate-500 text-xs">País</div>
                <div className="text-white">{selectedPlace.country_name}</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2">
                <div className="text-slate-500 text-xs">Distancia</div>
                <div className="text-white">{selectedPlace.distance} km</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2">
                <div className="text-slate-500 text-xs">Riesgo</div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[selectedPlace.risk_level] }}
                  />
                  <span className="text-white">{RISK_LABELS[selectedPlace.risk_level]}</span>
                </div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2">
                <div className="text-slate-500 text-xs">Score</div>
                <div className={`font-bold ${selectedPlace.score >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {selectedPlace.score} - {scoreLabel(selectedPlace.score)}
                </div>
              </div>
            </div>
            {selectedPlace.weather && (
              <div className="mt-3 bg-slate-800/80 rounded-lg p-2 flex items-center gap-3">
                {selectedPlace.weather.icon.includes('01') || selectedPlace.weather.icon.includes('02') ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : selectedPlace.weather.icon.includes('10') || selectedPlace.weather.icon.includes('09') ? (
                  <CloudRain className="w-5 h-5 text-blue-400" />
                ) : (
                  <Cloud className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <span className="text-white font-medium">{selectedPlace.weather.temp}°C</span>
                  <span className="text-slate-400 text-sm ml-2">{selectedPlace.weather.description}</span>
                </div>
              </div>
            )}
            <div className="mt-3 text-xs text-slate-500">
              {selectedPlace.poiCount} puntos de interés en la zona
            </div>
          </div>
        )}

        {/* Results list */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Destinos encontrados</h3>
            <span className="text-purple-400 text-sm font-medium">{places.length}</span>
          </div>
          <SearchResults
            places={places}
            onSelect={handleSelectPlace}
            loading={loading}
          />
        </div>

        {/* Methodology */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-xs text-slate-500">
          <h4 className="text-slate-400 font-medium mb-2">¿Cómo se calcula el score?</h4>
          <ul className="space-y-1">
            <li>• Seguridad (MAEC): 35%</li>
            <li>• Proximidad: 25%</li>
            <li>• Puntos de interés: 20%</li>
            <li>• Clima actual: 20%</li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
}
