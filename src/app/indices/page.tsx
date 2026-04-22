import type { Metadata } from 'next';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Search, Globe, Shield, TrendingUp, TrendingDown, 
  Activity, Info, Layers as LayersIcon, Map as MapIcon, Table, RefreshCw, ExternalLink,
  AlertTriangle, DollarSign, Heart, Eye, Clock, Zap
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Índices Globales Interactivo | Viaje con Inteligencia',
    description: 'Mapa interactivo con índices de riesgo: Paz Global (GPI), Terrorismo (GTI), Desarrollo Humano (HDI), Inflación, Terremotos en tiempo real y riesgo MAEC. Datos actualizados 2026.',
    keywords: ['índice paz global', 'GPI', 'terrorism index', 'HDI', 'terremotos tiempo real', 'USGS', 'riesgo viaje', 'comparar países'],
    openGraph: {
      title: '🗺️ Índices Globales Interactivo',
      description: 'Visualiza GPI, GTI, HDI, Inflación y terremotos en tiempo real. La herramienta más completa para análisis de riesgo travel.',
      type: 'website',
    },
  };
}
import { 
  LAYERS, LayerId, GPI_DATA, GTI_DATA, HDI_DATA, IPC_DATA, getLayerValue 
} from '@/data/indices';
import { paisesData, NivelRiesgo } from '@/data/paises';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="h-[500px] bg-slate-800 animate-pulse rounded-xl" /> }
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

const REGIONS = ['Todas', 'Europa', 'Asia', 'Norteamérica', 'Latinoamérica', 'África', 'Oceanía', 'Oriente Medio'];

const layerConfig: Record<LayerId, { 
  getLevel: (value: number) => string;
  getColor: (value: number) => string;
  getLabel: (value: number) => string;
  format: (value: number) => string;
  unit: string;
}> = {
  gpi: {
    getLevel: (v) => v < 1.5 ? 'Muy Alto' : v < 2.0 ? 'Alto' : v < 2.5 ? 'Medio' : v < 3.0 ? 'Bajo' : 'Muy Bajo',
    getColor: (v) => v < 1.5 ? '#22c55e' : v < 2.0 ? '#4ade80' : v < 2.5 ? '#eab308' : v < 3.0 ? '#f97316' : '#dc2626',
    getLabel: (v) => v < 1.5 ? 'Muy Seguro' : v < 2.0 ? 'Seguro' : v < 2.5 ? 'Moderado' : v < 3.0 ? 'Peligroso' : 'Muy Peligroso',
    format: (v) => v.toFixed(2),
    unit: 'pts',
  },
  gti: {
    getLevel: (v) => v < 2 ? 'Muy Bajo' : v < 4 ? 'Bajo' : v < 6 ? 'Medio' : v < 8 ? 'Alto' : 'Muy Alto',
    getColor: (v) => v < 2 ? '#22c55e' : v < 4 ? '#4ade80' : v < 6 ? '#eab308' : v < 8 ? '#f97316' : '#dc2626',
    getLabel: (v) => v < 2 ? 'Muy Bajo' : v < 4 ? 'Bajo' : v < 6 ? 'Medio' : v < 8 ? 'Alto' : 'Muy Alto',
    format: (v) => v.toFixed(1),
    unit: 'pts',
  },
  hdi: {
    getLevel: (v) => v < 0.7 ? 'Bajo' : v < 0.8 ? 'Medio' : v < 0.9 ? 'Alto' : 'Muy Alto',
    getColor: (v) => v < 0.7 ? '#dc2626' : v < 0.8 ? '#f97316' : v < 0.9 ? '#eab308' : '#22c55e',
    getLabel: (v) => v < 0.7 ? 'Bajo' : v < 0.8 ? 'Medio' : v < 0.9 ? 'Alto' : 'Muy Alto',
    format: (v) => v.toFixed(3),
    unit: '',
  },
  ipc: {
    getLevel: (v) => v < 2 ? 'Muy Bajo' : v < 4 ? 'Bajo' : v < 6 ? 'Medio' : v < 10 ? 'Alto' : 'Extremo',
    getColor: (v) => v < 2 ? '#22c55e' : v < 4 ? '#4ade80' : v < 6 ? '#eab308' : v < 10 ? '#f97316' : '#dc2626',
    getLabel: (v) => v < 2 ? 'Muy Bajo' : v < 4 ? 'Bajo' : v < 6 ? 'Medio' : v < 10 ? 'Alto' : 'Extremo',
    format: (v) => v.toFixed(1),
    unit: '%',
  },
  sismo: {
    getLevel: (v) => v < 4 ? 'Bajo' : v < 5 ? 'Medio' : v < 6 ? 'Alto' : 'Muy Alto',
    getColor: (v) => v < 4 ? '#22c55e' : v < 5 ? '#eab308' : v < 6 ? '#f97316' : '#dc2626',
    getLabel: (v) => v < 4 ? 'Bajo' : v < 5 ? 'Medio' : v < 6 ? 'Alto' : 'Muy Alto',
    format: (v) => v.toFixed(1),
    unit: 'M',
  },
  maec: {
    getLevel: (v) => v === 0 ? 'Sin Riesgo' : v === 1 ? ' Bajo' : v === 2 ? 'Medio' : v === 3 ? 'Alto' : 'Muy Alto',
    getColor: (v) => v === 0 ? '#22c55e' : v === 1 ? '#4ade80' : v === 2 ? '#eab308' : v === 3 ? '#f97316' : '#dc2626',
    getLabel: (v) => v === 0 ? 'Sin Riesgo' : v === 1 ? 'Bajo' : v === 2 ? 'Medio' : v === 3 ? 'Alto' : 'Muy Alto',
    format: (v) => v.toString(),
    unit: '',
  },
};

function getPaisCoord(codigo: string): [number, number] | null {
  const coords: Record<string, [number, number]> = {
    ES: [40.0, -3.0], FR: [46.0, 2.0], DE: [51.0, 10.0], IT: [42.0, 12.0], GB: [54.0, -2.0],
    PT: [39.0, -8.0], US: [38.0, -97.0], CA: [56.0, -106.0], MX: [23.0, -102.0],
    JP: [36.0, 138.0], CN: [35.0, 105.0], IN: [20.0, 77.0], KR: [35.0, 128.0],
    BR: [-14.0, -51.0], AR: [-34.0, -64.0], CL: [-30.0, -71.0], CO: [4.0, -72.0],
    AU: [-25.0, 133.0], NZ: [-41.0, 174.0], RU: [60.0, 100.0], TR: [39.0, 35.0],
    EG: [26.0, 30.0], ZA: [-30.0, 25.0], KE: [1.0, 38.0], MA: [32.0, -5.0],
    NL: [52.0, 5.0], BE: [50.0, 4.0], CH: [47.0, 8.0], AT: [47.0, 13.0],
    SE: [62.0, 15.0], NO: [62.0, 10.0], DK: [56.0, 10.0], FI: [64.0, 26.0],
    PL: [52.0, 19.0], CZ: [49.0, 15.0], HU: [47.0, 19.0], RO: [46.0, 24.0],
    GR: [39.0, 21.0], HR: [45.0, 15.0], SI: [46.0, 15.0], SK: [48.0, 19.0],
    IE: [53.0, -8.0], IS: [65.0, -18.0], SG: [1.0, 103.0], TW: [23.0, 121.0],
    TH: [15.0, 100.0], VN: [14.0, 108.0], PH: [12.0, 121.0], MY: [4.0, 101.0],
    ID: [-5.0, 120.0], AZ: [40.0, 47.0], GE: [42.0, 43.0], AM: [40.0, 45.0],
    CR: [10.0, -83.0], PA: [9.0, -80.0], GT: [15.0, -90.0], CU: [21.0, -77.0],
    IN: [20.0, 77.0], PK: [30.0, 69.0], BD: [23.0, 90.0], NP: [28.0, 84.0],
    LK: [7.0, 80.0], MM: [21.0, 95.0], KH: [12.0, 105.0], LA: [18.0, 102.0],
    DO: [18.0, -70.0], HN: [15.0, -86.0], SV: [13.0, -88.0], NI: [12.0, -85.0],
    UY: [-32.0, -55.0], PY: [-23.0, -58.0], BO: [-16.0, -63.0], PE: [-9.0, -75.0],
    EC: [-2.0, -77.0], VE: [8.0, -66.0], BH: [25.0, 50.0],
    KW: [29.0, 47.0], QA: [25.0, 51.0], SA: [25.0, 45.0], AE: [23.0, 53.0],
    IL: [31.0, 34.0], JO: [31.0, 36.0], LB: [33.0, 35.0], CY: [35.0, 33.0],
  };
  return coords[codigo] || null;
}

function getLayerData(layerId: LayerId) {
  switch (layerId) {
    case 'gpi': return GPI_DATA;
    case 'gti': return GTI_DATA;
    case 'hdi': return HDI_DATA;
    case 'ipc': return HDI_DATA; // We'll use HDI structure
    default: return [];
  }
}

export default function IndicesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerId>('gpi');
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('Todas');
  const [showTable, setShowTable] = useState(true);
  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  const [loadingQuakes, setLoadingQuakes] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (activeLayer === 'sismo') {
      setLoadingQuakes(true);
      fetch('/api/earthquakes?timeframe=month&minMagnitude=4&limit=50')
        .then(res => res.json())
        .then(data => {
          setEarthquakes(data.earthquakes || []);
          setLastUpdate(data.updated || new Date().toISOString());
        })
        .catch(console.error)
        .finally(() => setLoadingQuakes(false));
    }
  }, [activeLayer]);

  const config = layerConfig[activeLayer];
  
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    if (activeLayer === 'gpi') data = [...GPI_DATA];
    else if (activeLayer === 'gti') data = [...GTI_DATA];
    else if (activeLayer === 'hdi') data = [...HDI_DATA];
    else if (activeLayer === 'ipc') data = [...IPC_DATA];
    else if (activeLayer === 'maec') {
      data = Object.values(paisesData).map(p => ({
        country: p.nombre,
        code: p.codigo,
        score: { 'sin-riesgo': 0, 'bajo': 1, 'medio': 2, 'alto': 3, 'muy-alto': 4 }[p.nivelRiesgo] || 2,
        region: p.continente,
      }));
    }
    
    if (search) {
      data = data.filter((d: any) => 
        d.country?.toLowerCase().includes(search.toLowerCase()) ||
        d.code?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (region !== 'Todos') {
      data = data.filter((d: any) => d.region === region);
    }
    
    return data;
  }, [activeLayer, search, region]);

  const currentLayerInfo = LAYERS.find(l => l.id === activeLayer);
  const top5 = filteredData.slice(0, 5);
  const bottom5 = filteredData.slice(-5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <LayersIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Índices Globales</h1>
          </div>
          <p className="text-slate-400">Mapa interactivo con datos en tiempo real • Actualizado: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* LAYER SELECTOR */}
        <div className="bg-slate-800 rounded-xl p-2 mb-6 border border-slate-700">
          <div className="flex flex-wrap gap-2">
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as LayerId)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLayer === layer.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  {layer.id === 'gpi' && <Shield className="w-4 h-4" />}
                  {layer.id === 'gti' && <AlertTriangle className="w-4 h-4" />}
                  {layer.id === 'hdi' && <Heart className="w-4 h-4" />}
                  {layer.id === 'ipc' && <DollarSign className="w-4 h-4" />}
                  {layer.id === 'sismo' && <Activity className="w-4 h-4" />}
                  {layer.id === 'maec' && <Eye className="w-4 h-4" />}
                  {layer.shortName}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 px-2">
            <span className="text-xs text-slate-400">
              {currentLayerInfo?.description} • {currentLayerInfo?.source}
            </span>
            <button
              onClick={() => setShowTable(!showTable)}
              className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                showTable ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              <Table className="w-3 h-3" /> {showTable ? 'Ocultar' : 'Mostrar'} tabla
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar país..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  region === r 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs mb-1">Países</div>
            <div className="text-2xl font-bold text-white">{filteredData.length}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs mb-1">Mejor ranking</div>
            <div className="text-2xl font-bold text-green-400">{top5[0]?.country || '-'}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs mb-1">Valor {currentLayerInfo?.shortName}</div>
            <div className="text-2xl font-bold text-blue-400">
              {top5[0] ? config.format(top5[0].score || 0) + config.unit : '-'}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs mb-1">Fuente</div>
            <div className="text-lg font-medium text-slate-300">{currentLayerInfo?.source}</div>
          </div>
        </div>

        {/* MAP */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-bold text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-blue-400" /> Mapa interactivo
            </h2>
            <div className="flex items-center gap-2">
              {activeLayer === 'sismo' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                  <Zap className="w-3 h-3" /> Tiempo real
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {loadingQuakes ? 'Actualizando...' : new Date(lastUpdate).toLocaleString('es-ES', { 
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                })}
              </span>
              {activeLayer === 'sismo' && (
                <button
                  onClick={() => setEarthquakes([])}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingQuakes ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>
          
          {mounted && (
            <div className="h-[400px] rounded-xl overflow-hidden">
              <MapContainer
                center={[30, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {activeLayer === 'sismo' ? (
                  earthquakes.map((eq: any) => (
                    <CircleMarker
                      key={eq.id}
                      center={[eq.lat, eq.lng]}
                      pathOptions={{
                        color: eq.magnitude >= 6 ? '#dc2626' : eq.magnitude >= 5 ? '#f97316' : '#eab308',
                        fillColor: eq.magnitude >= 6 ? '#dc2626' : eq.magnitude >= 5 ? '#f97316' : '#eab308',
                        fillOpacity: 0.7,
                      }}
                      radius={eq.magnitude * 3}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong className="text-red-600">{eq.place}</strong>
                          <br />
                          Magnitud: {eq.magnitude}
                          <br />
                          Profundidad: {eq.depth} km
                          <br />
                          <a href={eq.url} target="_blank" rel="noopener" className="text-blue-500 underline">
                            Más información
                          </a>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))
                ) : (
                  filteredData.map((item: any) => {
                    const coords = getPaisCoord(item.code);
                    if (!coords) return null;
                    const value = item.score ?? getLayerValue(activeLayer, item.code);
                    if (value === null) return null;
                    
                    return (
                      <CircleMarker
                        key={item.code}
                        center={coords}
                        pathOptions={{
                          color: config.getColor(value),
                          fillColor: config.getColor(value),
                          fillOpacity: 0.7,
                          weight: 2,
                        }}
                        radius={8}
                      >
                        <Popup>
                          <div className="text-sm">
                            <strong>{item.country}</strong>
                            <br />
                            {currentLayerInfo?.shortName}: {config.format(value)} {config.unit}
                            <br />
                            Nivel: {config.getLabel(value)}
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })
                )}
              </MapContainer>
            </div>
          )}

          {/* LEGEND */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-slate-700">
            {activeLayer === 'sismo' ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400" />
                  <span className="text-xs text-slate-400">4-5 M</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500" />
                  <span className="text-xs text-slate-400">5-6 M</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-600" />
                  <span className="text-xs text-slate-400">6+ M</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-400">{activeLayer === 'hdi' ? 'Alto' : 'Bajo riesgo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400" />
                  <span className="text-xs text-slate-400">Medio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600" />
                  <span className="text-xs text-slate-400">{activeLayer === 'hdi' ? 'Bajo' : 'Alto riesgo'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TABLE */}
        {showTable && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">País</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">Región</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">{currentLayerInfo?.shortName}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 50).map((item: any, i: number) => {
                    const value = item.score ?? getLayerValue(activeLayer, item.code);
                    if (value === null) return null;
                    return (
                      <tr key={item.code} className="border-t border-slate-700 hover:bg-slate-700/50">
                        <td className="px-4 py-2 text-sm text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2">
                          <Link href={`/pais/${item.code?.toLowerCase()}`} className="text-white hover:text-blue-400 text-sm">
                            {item.country}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-slate-400 text-sm">{item.region}</td>
                        <td className="px-4 py-2 text-white font-mono text-sm">
                          {config.format(value)} {config.unit}
                        </td>
                        <td className="px-4 py-2">
                          <span 
                            className="px-2 py-0.5 rounded-full text-xs text-white"
                            style={{ backgroundColor: config.getColor(value) }}
                          >
                            {config.getLabel(value)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredData.length > 50 && (
              <div className="p-3 text-center text-slate-400 text-sm border-t border-slate-700">
                Mostrando 50 de {filteredData.length} países
              </div>
            )}
          </div>
        )}

        {/* INFO BOX */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Acerca de {currentLayerInfo?.name}
          </h3>
          <p className="text-slate-400 text-sm mb-2">
            {currentLayerInfo?.description}. Fuente: {currentLayerInfo?.source}.
          </p>
          <a 
            href={activeLayer === 'gpi' ? 'https://www.visionofhumanity.org' : 
                  activeLayer === 'gti' ? 'https://www.economicsandpeace.org' :
                  activeLayer === 'hdi' ? 'https://hdr.undp.org' :
                  activeLayer === 'sismo' ? 'https://earthquake.usgs.gov' :
                  '#'}
            target="_blank"
            rel="noopener"
            className="text-blue-400 text-sm flex items-center gap-1 hover:underline"
          >
            Visitar fuente oficial <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}