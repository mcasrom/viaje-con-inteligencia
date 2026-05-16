'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PlaceResult } from './RadiusExplorer';

// Fix Leaflet default icon issue - only runs on client
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const POI_MARKER_COLORS: Record<string, string> = {
  museum: '#8b5cf6',
  attraction: '#f59e0b',
  viewpoint: '#06b6d4',
  artwork: '#ec4899',
  castle: '#ef4444',
  monument: '#6366f1',
  archaeological: '#14b8a6',
  beach: '#22c55e',
  park: '#22c55e',
  library: '#a855f7',
};

function PoiMarker({ poi }: { poi: any }) {
  const color = POI_MARKER_COLORS[poi.category] || '#94a3b8';
  return (
    <CircleMarker
      center={[poi.lat, poi.lon]}
      radius={5}
      pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 1.5 }}
    >
      <Popup>
        <div className="text-xs">
          <strong>{poi.name}</strong>
          <br />
          <span className="text-slate-500">{poi.category} · {poi.distance} km</span>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface POIDisplay {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  distance: number;
}

interface RadiusMapProps {
  center: [number, number];
  radius: number;
  zoom: number;
  places: PlaceResult[];
  pois?: POIDisplay[];
  onPlaceClick: (place: PlaceResult) => void;
}

export default function RadiusMap({ center, radius, zoom, places, pois = [], onPlaceClick }: RadiusMapProps) {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.leaflet-tile').forEach(el => {
        if (!el.hasAttribute('role')) el.setAttribute('role', 'presentation');
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <Circle
        center={center}
        radius={radius * 1000}
        pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.1 }}
      />
      <MapController center={center} zoom={zoom} />

      {pois.map((poi) => (
        <PoiMarker key={poi.id} poi={poi} />
      ))}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lon]}
          eventHandlers={{
            click: () => onPlaceClick(place),
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>{place.name}</strong>
              <br />
              {place.distance} km · Score: {place.score}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
