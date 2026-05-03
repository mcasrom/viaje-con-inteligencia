'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
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

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface RadiusMapProps {
  center: [number, number];
  radius: number;
  zoom: number;
  places: PlaceResult[];
  onPlaceClick: (place: PlaceResult) => void;
}

export default function RadiusMap({ center, radius, zoom, places, onPlaceClick }: RadiusMapProps) {
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
