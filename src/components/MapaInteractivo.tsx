'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getTodosLosPaises, NivelRiesgo } from '@/data/paises';
import { useI18n } from '@/lib/i18n';

const riskColors: Record<NivelRiesgo, string> = {
  'sin-riesgo': '#22c55e',
  'bajo': '#eab308',
  'medio': '#f97316',
  'alto': '#dc2626',
  'muy-alto': '#991b1b',
};

const riskLabels: Record<NivelRiesgo, string> = {
  'sin-riesgo': 'Sin riesgo',
  'bajo': 'Riesgo bajo',
  'medio': 'Riesgo medio',
  'alto': 'Riesgo alto',
  'muy-alto': 'Riesgo muy alto',
};

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="h-[600px] bg-slate-800 animate-pulse" /> }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface SismoData {
  mag: number;
  place: string;
  lat: number;
  lng: number;
  time: string;
  url: string;
}

interface CountryHealthData {
  code: string;
  country: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const healthColors: Record<string, { fill: string; border: string }> = {
  low: { fill: '#22c55e', border: '#16a34a' },
  medium: { fill: '#f59e0b', border: '#d97706' },
  high: { fill: '#ef4444', border: '#dc2626' },
};

const conflictZones = [
  { lat: 48.3794, lng: 31.1656, radius: 12, label: 'Ucrania - Conflicto armado', severity: 'Crítico' },
  { lat: 31.5, lng: 34.5, radius: 6, label: 'Gaza / Palestina - Conflicto armado', severity: 'Crítico' },
  { lat: 15.5, lng: 32.5, radius: 10, label: 'Sudán - Guerra civil', severity: 'Crítico' },
  { lat: 34.8, lng: 39.0, radius: 8, label: 'Siria - Guerra civil', severity: 'Alto' },
  { lat: 15.5, lng: 48.0, radius: 6, label: 'Yemen - Guerra civil', severity: 'Alto' },
  { lat: 20.0, lng: 96.0, radius: 8, label: 'Myanmar - Golpe de estado', severity: 'Alto' },
  { lat: 27.0, lng: 17.0, radius: 10, label: 'Libia - Inestabilidad', severity: 'Alto' },
  { lat: 5.0, lng: 46.0, radius: 8, label: 'Somalia - Conflicto interno', severity: 'Alto' },
  { lat: 33.0, lng: 65.0, radius: 10, label: 'Afganistán - Talibán', severity: 'Alto' },
  { lat: -3.0, lng: 24.0, radius: 10, label: 'RDC Congo - Conflicto armado', severity: 'Alto' },
  { lat: 17.0, lng: 2.0, radius: 8, label: 'Sahel - Terrorismo y golpes', severity: 'Alto' },
  { lat: 19.0, lng: -72.0, radius: 4, label: 'Haití - Crisis institucional', severity: 'Alto' },
  { lat: 8.0, lng: 38.0, radius: 6, label: 'Etiopía - Tigray / Oromía', severity: 'Medio' },
  { lat: 6.0, lng: 20.0, radius: 5, label: 'RCA - Inestabilidad', severity: 'Medio' },
];

const conflictSeverityColors: Record<string, string> = {
  'Crítico': '#ef4444',
  'Alto': '#f97316',
  'Medio': '#eab308',
};

export default function MapaInteractivo({ fullScreen = false }: { fullScreen?: boolean }) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [layer, setLayer] = useState<'riesgo' | 'sismos' | 'conflictos' | 'salud'>('riesgo');
  const [sismos, setSismos] = useState<SismoData[]>([]);
  const [healthData, setHealthData] = useState<CountryHealthData[]>([]);
  const [loadingLayers, setLoadingLayers] = useState(false);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then((L) => {
      try {
        if ((L as any).Icon?.Default?.prototype) {
          (L as any).Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });
        }
      } catch {
        // Leaflet icon initialization is optional
      }
    });
  }, []);

  const loadLayerData = useCallback(async (layerType: string) => {
    if (layerType === 'sismos' && sismos.length === 0) {
      setLoadingLayers(true);
      try {
        const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
        const data = await res.json();
        const quakes = data.features?.map((f: any) => ({
          mag: f.properties.mag,
          place: f.properties.place,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          time: new Date(f.properties.time).toLocaleString('es-ES'),
          url: f.properties.url,
        })).filter((s: SismoData) => s.mag >= 4.5) || [];
        setSismos(quakes);
      } catch (e) {
        console.error('Error loading sismos:', e);
      } finally {
        setLoadingLayers(false);
      }
    }
    if (layerType === 'salud' && healthData.length === 0) {
      setLoadingLayers(true);
      try {
        const res = await fetch('/api/kpis/health');
        const data = await res.json();
        if (data.countries) {
          setHealthData(data.countries.map((c: any) => ({
            code: c.code2,
            country: c.country,
            riskLevel: c.riskLevel,
          })));
        }
      } catch (e) {
        console.error('Error loading health data:', e);
      } finally {
        setLoadingLayers(false);
      }
    }
  }, [sismos.length, healthData.length]);

  useEffect(() => {
    if (mounted && layer !== 'riesgo') {
      loadLayerData(layer);
    }
  }, [mounted, layer, loadLayerData]);

  if (!mounted) {
    return <div className={fullScreen ? "h-screen bg-slate-900" : "h-[600px] bg-slate-800 animate-pulse rounded-xl"} />;
  }

  const paises = getTodosLosPaises();

  const layerLabels: Record<string, string> = {
    riesgo: 'Riesgo MAEC',
    sismos: 'Sismos USGS (24h)',
    conflictos: 'Conflictos activos',
    salud: 'Salud OMS',
  };

  return (
    <div className={fullScreen ? "w-full h-full" : "relative"}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: fullScreen ? '100vh' : '600px', width: '100%', borderRadius: fullScreen ? 0 : '12px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Layer: Risk MAEC */}
        {layer === 'riesgo' && paises.map((pais) => (
          <CircleMarker
            key={pais.codigo}
            center={pais.mapaCoordenadas as [number, number]}
            pathOptions={{
              fillColor: riskColors[pais.nivelRiesgo],
              fillOpacity: 0.7,
              color: riskColors[pais.nivelRiesgo],
              weight: 1,
            }}
            radius={8}
          >
            <Popup>
              <div className="text-slate-900 min-w-[200px]">
                <h3 className="font-bold text-lg">{pais.nombre}</h3>
                <p className="text-sm text-slate-600">{pais.capital}</p>
                <div
                  className="mt-2 px-2 py-1 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: riskColors[pais.nivelRiesgo] }}
                >
                  {riskLabels[pais.nivelRiesgo]}
                </div>
                <a
                  href={`/pais/${pais.codigo}`}
                  className="block mt-2 text-blue-600 hover:underline text-sm"
                >
                  Ver detalles →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Layer: Sismos */}
        {layer === 'sismos' && sismos.map((s, i) => (
          <CircleMarker
            key={`sismo-${i}`}
            center={[s.lat, s.lng]}
            pathOptions={{
              fillColor: s.mag >= 7 ? '#ef4444' : s.mag >= 6 ? '#f97316' : '#eab308',
              fillOpacity: 0.6,
              color: s.mag >= 7 ? '#ef4444' : s.mag >= 6 ? '#f97316' : '#eab308',
              weight: 1,
            }}
            radius={Math.max(4, s.mag * 2)}
          >
            <Popup>
              <div className="text-slate-900 min-w-[200px]">
                <h3 className="font-bold text-lg">
                  <span className={`px-2 py-0.5 rounded text-sm ${
                    s.mag >= 7 ? 'bg-red-100 text-red-700' : s.mag >= 6 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    M{s.mag.toFixed(1)}
                  </span>
                </h3>
                <p className="text-sm text-slate-600 mt-1">{s.place}</p>
                <p className="text-xs text-slate-500 mt-1">{s.time}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-600 hover:underline text-sm">
                  Ver en USGS →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Layer: Conflictos */}
        {layer === 'conflictos' && conflictZones.map((c, i) => (
          <CircleMarker
            key={`conflict-${i}`}
            center={[c.lat, c.lng]}
            pathOptions={{
              fillColor: conflictSeverityColors[c.severity],
              fillOpacity: 0.4,
              color: conflictSeverityColors[c.severity],
              weight: 2,
            }}
            radius={c.radius}
          >
            <Popup>
              <div className="text-slate-900 min-w-[200px]">
                <h3 className="font-bold text-sm">{c.label}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                  c.severity === 'Crítico' ? 'bg-red-100 text-red-700' :
                  c.severity === 'Alto' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {c.severity}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Layer: Salud OMS */}
        {layer === 'salud' && healthData.map((c, i) => {
          const pais = paises.find(p => p.codigo.toLowerCase() === c.code.toLowerCase());
          if (!pais) return null;
          const hc = healthColors[c.riskLevel];
          return (
            <CircleMarker
              key={`health-${i}`}
              center={pais.mapaCoordenadas as [number, number]}
              pathOptions={{
                fillColor: hc.fill,
                fillOpacity: 0.7,
                color: hc.border,
                weight: 2,
              }}
              radius={8}
            >
              <Popup>
                <div className="text-slate-900 min-w-[200px]">
                  <h3 className="font-bold text-lg">{pais.nombre}</h3>
                  <div
                    className="mt-2 px-2 py-1 rounded text-white text-sm font-medium"
                    style={{ backgroundColor: hc.fill }}
                  >
                    Riesgo sanitario: {c.riskLevel === 'low' ? 'Bajo' : c.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Fuente: WHO Global Health Observatory</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Layer Switcher */}
      <div className="absolute bottom-20 left-4 z-[1000] bg-slate-900/90 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-1 shadow-xl">
        {(['riesgo', 'sismos', 'conflictos', 'salud'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              layer === l
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {layerLabels[l]}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
        <div className="font-medium mb-2">{layerLabels[layer]}</div>
        {layer === 'riesgo' && Object.entries(riskLabels).map(([level, label]) => (
          <div key={level} className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors[level as NivelRiesgo] }} />
            <span>{label}</span>
          </div>
        ))}
        {layer === 'sismos' && (
          <>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-red-500" /> M7+ (Mayor)</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> M6-7 (Fuerte)</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> M4.5-6 (Moderado)</div>
          </>
        )}
        {layer === 'conflictos' && (
          <>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Crítico</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> Alto</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Medio</div>
          </>
        )}
        {layer === 'salud' && (
          <>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Riesgo bajo</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> Riesgo medio</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Riesgo alto</div>
          </>
        )}
      </div>

      {loadingLayers && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-3 text-white text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Cargando capa...
        </div>
      )}
    </div>
  );
}
