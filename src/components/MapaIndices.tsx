'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getTodosLosPaises } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';

import { Shield, DollarSign, Globe, Loader2 } from 'lucide-react';

type MapLayer = 'maec' | 'gpi' | 'tci';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="h-[70vh] bg-slate-800 animate-pulse rounded-xl flex items-center justify-center"><Loader2 className="w-8 h-8 text-slate-500 animate-spin" /></div> }
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
const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);

const LAYERS: { id: MapLayer; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'maec', label: 'Riesgo MAEC', icon: <Shield className="w-4 h-4" />, color: 'text-orange-400' },
  { id: 'gpi', label: 'Índice Paz', icon: <Globe className="w-4 h-4" />, color: 'text-green-400' },
  { id: 'tci', label: 'Coste Viaje', icon: <DollarSign className="w-4 h-4" />, color: 'text-blue-400' },
];

const MAEC_COLORS: Record<string, string> = {
  'sin-riesgo': '#22c55e',
  'bajo': '#eab308',
  'medio': '#f97316',
  'alto': '#dc2626',
  'muy-alto': '#991b1b',
};

const MAEC_LABELS: Record<string, string> = {
  'sin-riesgo': 'Sin riesgo',
  'bajo': 'Riesgo bajo',
  'medio': 'Riesgo medio',
  'alto': 'Riesgo alto',
  'muy-alto': 'Riesgo muy alto',
};

function getGPIColor(score: number): string {
  if (score < 1.5) return '#22c55e';
  if (score < 2.0) return '#86efac';
  if (score < 2.5) return '#eab308';
  if (score < 3.0) return '#f97316';
  return '#dc2626';
}

function getTCIColor(tci: number): string {
  if (tci < 85) return '#22c55e';
  if (tci < 100) return '#86efac';
  if (tci < 115) return '#eab308';
  if (tci < 130) return '#f97316';
  return '#dc2626';
}

export default function MapaIndices() {
  const [layer, setLayer] = useState<MapLayer>('maec');
  const [countries, setCountries] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [gpiData, setGpiData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/indices?tipo=gpi')
      .then(r => r.json())
      .then(data => setGpiData(data))
      .catch(() => setGpiData([]));
  }, []);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then((L) => {
      delete (L as any).Default.prototype._initMapDefaults;
      (L as any).Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.leaflet-tile').forEach(el => {
        if (!el.hasAttribute('role')) el.setAttribute('role', 'presentation');
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const buildCountries = useCallback(() => {
    const paises = getTodosLosPaises();
    const result: any[] = [];

    if (layer === 'maec') {
      paises.forEach(p => {
        result.push({
          code: p.codigo,
          name: p.nombre,
          coords: p.mapaCoordenadas,
          color: MAEC_COLORS[p.nivelRiesgo] || '#888',
          label: MAEC_LABELS[p.nivelRiesgo] || '',
          description: `${p.nombre} — ${p.capital}`,
        });
      });
    } else if (layer === 'gpi') {
      const gpiMap: Record<string, any> = {};
      gpiData.forEach(g => { gpiMap[g.codigo_pais] = g; });
      paises.forEach(p => {
        const gpi = gpiMap[p.codigo];
        result.push({
          code: p.codigo,
          name: p.nombre,
          coords: p.mapaCoordenadas,
          color: gpi ? getGPIColor(gpi.valor) : '#475569',
          label: gpi ? `GPI: ${gpi.valor} (#${gpi.rank})` : 'Sin datos GPI',
          description: `${p.nombre} — ${p.capital}`,
        });
      });
    } else if (layer === 'tci') {
      paises.forEach(p => {
        const tci = calculateTCI(p.codigo);
        result.push({
          code: p.codigo,
          name: p.nombre,
          coords: p.mapaCoordenadas,
          color: getTCIColor(tci.tci),
          label: `TCI: ${tci.tci} (${tci.trend})`,
          description: `${p.nombre} — ${tci.recommendation.split('\n')[0]}`,
        });
      });
    }

    setCountries(result);
  }, [layer, gpiData]);

  useEffect(() => {
    if (!mounted) return;
    buildCountries();
  }, [mounted, buildCountries]);

  if (!mounted) {
    return <div className="h-[70vh] bg-slate-800 rounded-xl" />;
  }

  return (
    <div className="relative">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Layer selector */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-2 shadow-xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 mb-2">Capas</div>
          {LAYERS.map(l => (
            <button
              key={l.id}
              onClick={() => setLayer(l.id)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                layer === l.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className={layer === l.id ? l.color : ''}>{l.icon}</span>
              <span className="text-xs font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 shadow-xl max-w-[160px]">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Leyenda</div>
        {layer === 'maec' && (
          <div className="space-y-1">
            {Object.entries(MAEC_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: MAEC_COLORS[key] }} />
                <span className="text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        )}
        {layer === 'gpi' && (
          <div className="space-y-1">
            {[
              ['#22c55e', '<1.5 Muy pacífico'],
              ['#86efac', '1.5-2.0 Pacífico'],
              ['#eab308', '2.0-2.5 Medio'],
              ['#f97316', '2.5-3.0 Inestable'],
              ['#dc2626', '>3.0 Conflicto'],
            ].map(([color, label]) => (
              <div key={color} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        )}
        {layer === 'tci' && (
          <div className="space-y-1">
            {[
              ['#22c55e', '<85 Barato'],
              ['#86efac', '85-100 Económico'],
              ['#eab308', '100-115 Medio'],
              ['#f97316', '115-130 Caro'],
              ['#dc2626', '>130 Muy caro'],
            ].map(([color, label]) => (
              <div key={color} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: '70vh', width: '100%', borderRadius: '12px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {(layer === 'maec' || layer === 'gpi' || layer === 'tci') && countries.map(c => (
          <CircleMarker
            key={c.code}
            center={c.coords}
            pathOptions={{
              fillColor: c.color,
              fillOpacity: 0.75,
              color: c.color,
              weight: 1,
            }}
            radius={8}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <div className="text-slate-900 font-medium text-sm">{c.name}: {c.label}</div>
            </Tooltip>
            <Popup>
              <div className="text-slate-900 min-w-[200px]">
                <h3 className="font-bold text-base">{c.name}</h3>
                <p className="text-sm text-slate-600">{c.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm font-medium">{c.label}</span>
                </div>
                <Link
                  href={`/pais/${c.code}`}
                  className="block mt-3 text-blue-600 hover:underline text-sm font-medium"
                >
                  Ver ficha completa →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
