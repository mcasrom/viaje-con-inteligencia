'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CARTO_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const CARTO_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const RISK_COLORS: Record<string, string> = {
  'sin-riesgo': '#22c55e',
  'bajo': '#84cc16',
  'medio': '#f59e0b',
  'alto': '#ef4444',
  'muy-alto': '#991b1b',
};

const RISK_ORDER = ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'];

function getColor(level: string): string {
  return RISK_COLORS[level] || '#64748b';
}

function getRadius(score: number): number {
  return 5 + score * 3;
}

interface CountryRisk {
  code: string;
  name: string;
  flag: string;
  region: string;
  riskLevel: string;
  riskScore: number;
  lat: number;
  lng: number;
  color: string;
}

function riskLabel(level: string): string {
  const map: Record<string, string> = {
    'sin-riesgo': 'Sin riesgo',
    'bajo': 'Bajo',
    'medio': 'Medio',
    'alto': 'Alto',
    'muy-alto': 'Crítico',
  };
  return map[level] || level;
}

export default function PremiumRiskMapInner({
  countries,
  compareCountries,
  loading,
}: {
  countries: CountryRisk[];
  compareCountries: CountryRisk[] | null;
  loading: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const compareMarkersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(CARTO_DARK, {
      attribution: CARTO_ATTRIBUTION,
      maxZoom: 6,
      minZoom: 1,
    }).addTo(map);

    // Fix alt text on tile images for SEO
    const fixTileAlt = () => {
      mapRef.current?.querySelectorAll<HTMLImageElement>('.leaflet-tile').forEach(img => {
        if (img.alt === '') img.alt = 'Mapa de riesgos';
      });
    };
    map.on('tileload', fixTileAlt);
    fixTileAlt();

    const markers = L.layerGroup().addTo(map);
    const compareMarkers = L.layerGroup().addTo(map);
    markersRef.current = markers;
    compareMarkersRef.current = compareMarkers;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update primary markers
  useEffect(() => {
    const markers = markersRef.current;
    if (!markers || loading) return;
    markers.clearLayers();

    for (const c of countries) {
      if (!c.lat || !c.lng) continue;

      const radius = getRadius(c.riskScore);
      const color = getColor(c.riskLevel);

      const circle = L.circleMarker([c.lat, c.lng], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1,
        opacity: 0.6,
        fillOpacity: 0.8,
      });

      circle.bindTooltip(
        `<div style="font-family:monospace;font-size:11px;">
          <strong>${c.flag} ${c.name}</strong><br/>
          <span style="color:${color};">${riskLabel(c.riskLevel).toUpperCase()}</span>
          <span style="color:#64748b;"> | ${c.region}</span>
        </div>`,
        { direction: 'top', offset: [0, -8] }
      );

      circle.bindPopup(
        `<div style="font-family:monospace;font-size:12px;background:#0f172a;color:#e2e8f0;min-width:180px;">
          <div style="font-size:16px;font-weight:bold;margin-bottom:4px;">${c.flag} ${c.name}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};"></span>
            <span style="font-weight:bold;color:${color};">${riskLabel(c.riskLevel).toUpperCase()}</span>
          </div>
          <div style="color:#64748b;">${c.region}</div>
          <div style="color:#64748b;font-size:10px;margin-top:4px;">${c.code}</div>
        </div>`,
        { closeButton: true, className: 'premium-map-popup' }
      );

      markers.addLayer(circle);
    }
  }, [countries, loading]);

  // Update comparison markers
  useEffect(() => {
    const compareMarkers = compareMarkersRef.current;
    const map = mapInstanceRef.current;
    if (!compareMarkers || !map || loading) return;
    compareMarkers.clearLayers();

    if (!compareCountries) return;

    // Build a map of compare risk levels
    const compareMap = new Map<string, string>();
    for (const c of compareCountries) {
      compareMap.set(c.code, c.riskLevel);
    }

    for (const c of countries) {
      if (!c.lat || !c.lng) continue;

      const compareLevel = compareMap.get(c.code);
      if (!compareLevel || compareLevel === c.riskLevel) continue;

      const diff = RISK_ORDER.indexOf(c.riskLevel) - RISK_ORDER.indexOf(compareLevel);
      const baseRadius = getRadius(c.riskScore);

      // Outer ring showing delta
      const outerRadius = diff > 0 ? baseRadius + diff * 3 : baseRadius - Math.abs(diff) * 2;
      const ring = L.circleMarker([c.lat, c.lng], {
        radius: Math.max(baseRadius + 4, outerRadius + 2),
        fillColor: 'transparent',
        color: diff > 0 ? '#ef4444' : '#22c55e',
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0,
        dashArray: '4,4',
      });

      ring.bindTooltip(
        `<div style="font-family:monospace;font-size:11px;">
          <strong>${c.flag} ${c.name}</strong><br/>
          <span style="color:${diff > 0 ? '#ef4444' : '#22c55e'};">${diff > 0 ? '▲ +' : '▼ '}${Math.abs(diff)} nivel${Math.abs(diff) > 1 ? 'es' : ''}</span>
          <span style="color:#64748b;"> (${riskLabel(compareLevel)} → ${riskLabel(c.riskLevel)})</span>
        </div>`,
        { direction: 'bottom', offset: [0, 8] }
      );

      compareMarkers.addLayer(ring);
    }
  }, [countries, compareCountries, loading]);

  if (loading) {
    return (
      <div className="h-[500px] bg-slate-900 rounded-xl flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <p className="text-slate-600 text-sm">Cargando mapa interactivo...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-[500px] w-full rounded-none z-0" />;
}
