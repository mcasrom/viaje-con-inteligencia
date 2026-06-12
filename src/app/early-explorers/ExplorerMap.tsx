'use client';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

interface ExplorerWithCoords {
  id: string;
  name: string;
  country_code: string;
  message: string;
  website?: string;
  founding: boolean;
  explorer_number: number;
  coords: [number, number];
}

export default function ExplorerMap({ explorers }: { explorers: ExplorerWithCoords[] }) {
  useEffect(() => {
    const L = require('leaflet');
    const container = document.getElementById('explorer-map');
    if (!container) return;
    if ((container as any)._leaflet_id) return;

    const map = L.map('explorer-map', {
      center: [20, 10],
      zoom: 2,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 10,
    }).addTo(map);

    explorers.forEach(e => {
      const color = e.founding ? '#00d4aa' : '#0ea5e9';
      const marker = L.circleMarker(e.coords, {
        radius: e.founding ? 9 : 7,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7,
      }).addTo(map);

      marker.bindPopup(`
        <div style="background:#0f172a;color:#e2e8f0;border-radius:8px;padding:10px;min-width:160px;font-family:sans-serif">
          <div style="font-size:1.2rem;margin-bottom:4px">${getFlagEmoji(e.country_code)}</div>
          <div style="font-weight:700;font-size:.9rem;color:#fff">${e.name}</div>
          <div style="font-size:.75rem;color:#00d4aa;font-family:monospace;margin:2px 0">#${String(e.explorer_number).padStart(3,'0')}${e.founding ? ' · founding' : ''}</div>
          <div style="font-size:.8rem;color:#94a3b8;margin-top:4px">${e.message}</div>
          ${e.website ? `<a href="${e.website}" target="_blank" style="font-size:.75rem;color:#00d4aa;display:block;margin-top:4px">${e.website.replace(/^https?:\/\//,'')}</a>` : ''}
        </div>
      `, { className: 'explorer-popup' });
    });

    return () => { map.remove(); };
  }, [explorers]);

  return (
    <div
      id="explorer-map"
      style={{ height: '420px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}
    />
  );
}

function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  ).join('');
}
