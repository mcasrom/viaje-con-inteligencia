'use client';

import { useEffect, useRef } from 'react';

export default function TestMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

    const init = async () => {
      const L = await import('leaflet');
      const map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 2,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM',
      }).addTo(map);
      map.on('tileload', () => console.log('tile loaded'));
      map.on('tileerror', (e: any) => console.error('tile error', e));
      // Also try CARTO
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 18,
      }).addTo(map);
      mapInstance.current = map;
    };

    link.onload = () => { setTimeout(init, 100); };
    link.onerror = () => { setTimeout(init, 100); };
    document.head.appendChild(link);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div className="text-xs text-slate-400 mb-2">Test: both OSM + CARTO tile layers added</div>
      <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '12px' }} />
    </div>
  );
}
