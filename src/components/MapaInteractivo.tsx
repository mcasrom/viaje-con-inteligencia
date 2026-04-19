'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { paisesData, NivelRiesgo } from '@/data/paises';
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

export default function MapaInteractivo() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

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
  }, []);

  if (!mounted) {
    return <div className="h-[600px] bg-slate-800 animate-pulse rounded-xl" />;
  }

  const paises = Object.values(paisesData);

  return (
    <div className="relative">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: '600px', width: '100%', borderRadius: '12px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {paises.map((pais) => (
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
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
        <div className="font-medium mb-2">Leyenda</div>
        {Object.entries(riskLabels).map(([level, label]) => (
          <div key={level} className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: riskColors[level as NivelRiesgo] }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}