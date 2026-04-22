'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Search, Shield, Activity, Info, Layers as LayersIcon, Table, 
  AlertTriangle, DollarSign, Heart, Eye, Clock, Zap, RefreshCw
} from 'lucide-react';
import { 
  LAYERS, LayerId, GPI_DATA, GTI_DATA, HDI_DATA, IPC_DATA 
} from '@/data/indices';

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
  format: (value: any) => string;
  unit: string;
  colorScale: Record<string, string>;
}> = {
  gpi: {
    getLevel: (v) => v < 1.5 ? 'Muy Alto' : v < 2.0 ? 'Alto' : v < 2.5 ? 'Medio' : v < 3.0 ? 'Bajo' : 'Muy Bajo',
    getColor: (v) => v < 1.5 ? '#22c55e' : v < 2.0 ? '#4ade80' : v < 2.5 ? '#eab308' : v < 3.0 ? '#f97316' : '#dc2626',
    getLabel: (v) => v < 1.5 ? 'Muy Seguro' : v < 2.0 ? 'Seguro' : v < 2.5 ? 'Moderado' : v < 3.0 ? 'Peligroso' : 'Muy Peligroso',
    format: (v) => (v || 0).toFixed(2),
    unit: 'pts',
    colorScale: { '0': '#22c55e', '1': '#4ade80', '2': '#eab308', '3': '#f97316', '4': '#dc2626' },
  },
  gti: {
    getLevel: (v) => v < 2 ? 'Muy Bajo' : v < 4 ? 'Bajo' : v < 6 ? 'Medio' : v < 8 ? 'Alto' : 'Muy Alto',
    getColor: (v) => v < 2 ? '#22c55e' : v < 4 ? '#4ade80' : v < 6 ? '#eab308' : v < 8 ? '#f97316' : '#dc2626',
    getLabel: (v) => v < 2 ? 'Muy Bajo' : v < 4 ? 'Bajo' : v < 6 ? 'Medio' : v < 8 ? 'Alto' : 'Muy Alto',
    format: (v) => (v || 0).toFixed(1),
    unit: 'pts',
    colorScale: { '0': '#22c55e', '1': '#4ade80', '2': '#eab308', '3': '#f97316', '4': '#dc2626' },
  },
  hdi: {
    getLevel: (v) => v < 0.7 ? 'Bajo' : v < 0.8 ? 'Medio' : v < 0.9 ? 'Alto' : 'Muy Alto',
    getColor: (v) => v < 0.7 ? '#dc2626' : v < 0.8 ? '#f97316' : v < 0.9 ? '#eab308' : '#22c55e',
    getLabel: (v) => v < 0.7 ? 'Bajo' : v < 0.8 ? 'Medio' : v < 0.9 ? 'Alto' : 'Muy Alto',
    format: (v) => (v || 0).toFixed(3),
    unit: '',
    colorScale: { '0': '#dc2626', '1': '#f97316', '2': '#eab308', '3': '#4ade80', '4': '#22c55e' },
  },
  ipc: {
    getLevel: (v) => v < 2 ? 'Muy Bajo' : v < 4 ? 'Bajo' : v < 6 ? 'Medio' : v < 10 ? 'Alto' : 'Extremo',
    getColor: (v) => v < 2 ? '#22c55e' : v < 4 ? '#4ade80' : v < 6 ? '#eab308' : v < 10 ? '#f97316' : '#dc2626',
    getLabel: (v) => v < 2 ? 'Muy Bajo' : v < 4 ? 'Bajo' : v < 6 ? 'Medio' : v < 10 ? 'Alto' : 'Extremo',
    format: (v) => (v || 0).toFixed(1),
    unit: '%',
    colorScale: { '0': '#22c55e', '1': '#4ade80', '2': '#eab308', '3': '#f97316', '4': '#dc2626' },
  },
  sismo: {
    getLevel: (v) => v < 4 ? 'Bajo' : v < 5 ? 'Medio' : v < 6 ? 'Alto' : 'Muy Alto',
    getColor: (v) => v < 4 ? '#22c55e' : v < 5 ? '#eab308' : v < 6 ? '#f97316' : '#dc2626',
    getLabel: (v) => v < 4 ? 'Bajo' : v < 5 ? 'Medio' : v < 6 ? 'Alto' : 'Muy Alto',
    format: (v) => (v || 0).toFixed(1),
    unit: 'M',
    colorScale: { '0': '#22c55e', '1': '#eab308', '2': '#f97316', '3': '#dc2626' },
  },
  maec: {
    getLevel: (v) => v === 0 ? 'Sin Riesgo' : v === 1 ? 'Bajo' : v === 2 ? 'Medio' : v === 3 ? 'Alto' : 'Muy Alto',
    getColor: (v) => v === 0 ? '#22c55e' : v === 1 ? '#4ade80' : v === 2 ? '#eab308' : v === 3 ? '#f97316' : '#dc2626',
    getLabel: (v) => v === 0 ? 'Sin Riesgo' : v === 1 ? 'Bajo' : v === 2 ? 'Medio' : v === 3 ? 'Alto' : 'Muy Alto',
    format: (v) => String(v || 0),
    unit: '',
    colorScale: { '0': '#22c55e', '1': '#4ade80', '2': '#eab308', '3': '#f97316', '4': '#dc2626' },
  },
};

const PAIS_COORDS: Record<string, [number, number]> = {
  ES: [40.4637, -3.7492], FR: [46.2276, 2.2137], DE: [51.1657, 10.4515], IT: [41.8719, 12.5674], GB: [54.7024, -3.2766],
  PT: [39.3999, -8.2245], US: [37.0902, -95.7129], CA: [56.1304, -106.3468], MX: [23.6345, -102.5528],
  JP: [36.2048, 138.2529], CN: [35.8617, 104.1954], KR: [35.9078, 127.7669], IN: [20.5937, 78.9629],
  BR: [-14.2350, -51.9253], AR: [-38.4161, -63.6167], CL: [-35.6751, -71.5430], CO: [4.5709, -74.2973],
  AU: [-25.2744, 133.7751], NZ: [-40.9006, 174.8860], RU: [61.5240, 105.3188], TR: [38.9637, 35.2433],
  EG: [26.8206, 30.8025], ZA: [-30.5595, 22.9375], KE: [-0.0236, 37.9062], MA: [31.7917, -7.0926],
  NL: [52.1326, 5.2913], BE: [50.5039, 4.4699], CH: [46.8182, 8.2275], AT: [47.5162, 14.5501],
  SE: [60.1282, 18.6435], NO: [60.4720, 8.4689], DK: [56.2639, 9.5018], FI: [61.9241, 25.7482],
  PL: [51.9194, 19.1451], CZ: [49.8175, 15.4730], HU: [47.1625, 19.5033], RO: [45.9432, 24.9668],
  GR: [39.0742, 21.8243], HR: [45.1000, 15.2000], SI: [46.1512, 14.9955], SK: [48.6690, 19.6990],
  IE: [53.1424, -7.6921], IS: [64.9631, -19.0208], SG: [1.3521, 103.8198], TW: [23.6978, 120.9605],
  TH: [15.8700, 100.9925], VN: [14.0583, 108.2772], PH: [12.8797, 121.7740], MY: [4.2105, 101.9758],
  ID: [-0.7893, 113.9213], AZ: [40.1431, 47.5769], GE: [42.3155, 43.3569], AM: [40.0691, 45.0382],
  CR: [9.7489, -83.7534], PA: [8.5380, -80.7821], CU: [21.5218, -77.7812],
  LB: [33.8547, 35.8623], CY: [35.1264, 33.4299],
  MT: [35.9375, 14.3754], AE: [23.4241, 53.8478], UY: [-32.5228, -55.7652], AF: [33.9391, 67.7100],
  HK: [22.3193, 114.1694], NG: [9.0820, 8.6753], SD: [15.8628, 30.2176], IQ: [33.3152, 44.3661],
  BG: [42.6199, 25.3935], LT: [55.1694, 23.8799], SY: [34.8021, 38.9968], YE: [15.5527, 48.9934],
  SO: [5.1521, 46.1996], RS: [44.0166, 21.0059],
};

function getDataForLayer(layerId: LayerId) {
  switch (layerId) {
    case 'gpi': return GPI_DATA;
    case 'gti': return GTI_DATA;
    case 'hdi': return HDI_DATA;
    case 'ipc': return IPC_DATA;
    case 'sismo': return [];
    case 'maec': return [];
    default: return [];
  }
}

export default function IndicesPage() {
  const [activeLayer, setActiveLayer] = useState<LayerId>('gpi');
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('Todas');
  const [showTable, setShowTable] = useState(true);
  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  const [loadingQuakes, setLoadingQuakes] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

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
  const baseData = getDataForLayer(activeLayer);
  
  const filteredData = useMemo(() => {
    let data = [...baseData];
    if (search) {
      data = data.filter(d => 
        d.country?.toLowerCase().includes(search.toLowerCase()) ||
        d.code?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (region !== 'Todos') {
      data = data.filter(d => d.region === region);
    }
    return data;
  }, [baseData, search, region]);

  const currentLayerInfo = LAYERS.find(l => l.id === activeLayer);
  const top5 = filteredData.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <LayersIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Índices Globales</h1>
          </div>
          <p className="text-slate-400">Mapa interactivo • Actualizado: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
              {top5[0] ? config.format((top5[0] as any).score || 0) + config.unit : '-'}
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
            <h2 className="font-bold text-white">Mapa interactivo</h2>
            {activeLayer === 'sismo' && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                  <Zap className="w-3 h-3" /> Tiempo real
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {loadingQuakes ? 'Actualizando...' : lastUpdate ? new Date(lastUpdate).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                </span>
                <button
                  onClick={() => {
                    setLoadingQuakes(true);
                    fetch('/api/earthquakes?timeframe=month&minMagnitude=4&limit=50')
                      .then(res => res.json())
                      .then(data => {
                        setEarthquakes(data.earthquakes || []);
                        setLastUpdate(data.updated || new Date().toISOString());
                      })
                      .finally(() => setLoadingQuakes(false));
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingQuakes ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>
          
          <div className="h-[400px] rounded-xl overflow-hidden z-0">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                      weight: 1,
                    }}
                    radius={eq.magnitude * 3}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong className="text-red-600">{eq.place}</strong><br/>
                        Magnitud: {eq.magnitude}<br/>
                        Profundidad: {eq.depth} km<br/>
                        <a href={eq.url} target="_blank" rel="noopener" className="text-blue-500 underline">
                          Más información
                        </a>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))
              ) : (
                filteredData.map((item: any) => {
                  const coords = PAIS_COORDS[item.code];
                  if (!coords) return null;
                  const value = (item as any).score || (item as any).ipc ? parseFloat((item as any).ipc?.replace('%', '') || '0') : 0;
                  
                  return (
                    <CircleMarker
                      key={item.code}
                      center={coords}
                      pathOptions={{
                        color: config.getColor(value),
                        fillColor: config.getColor(value),
                        fillOpacity: 0.7,
                        weight: 1,
                      }}
                      radius={8}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong>{item.country}</strong><br/>
                          {currentLayerInfo?.shortName}: {config.format(value)} {config.unit}<br/>
                          Nivel: {config.getLabel(value)}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })
              )}
            </MapContainer>
          </div>

          {/* LEGEND */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-slate-700">
            {Object.entries(config.colorScale).map(([level, color]) => (
              <div key={level} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-400">{config.getLabel(parseFloat(level) || 0)}</span>
              </div>
            ))}
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
                    const value = (item as any).score || (item as any).ipc ? parseFloat((item as any).ipc?.replace('%', '') || '0') : 0;
                    const color = config.getColor(value);
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
                            style={{ backgroundColor: color }}
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
        </div>
      </div>
    </div>
  );
}