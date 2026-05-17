'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SentimentEntry {
  countryCode: string;
  countryName: string;
  coordinates: [number, number] | null;
  avgTone: number | null;
  signals: number;
  positive: number;
  negative: number;
  neutral: number;
  mood: 'positive' | 'negative' | 'neutral' | null;
  pinned: boolean;
}

interface HeatmapEntry {
  country: string;
  countryCode?: string;
  coordinates: [number, number] | null;
  level: number;
  label: string;
  signals24h: number;
  spike: number;
  reasons: string[];
  keywords: string[];
}

interface GlobalData {
  sentimentRanking: SentimentEntry[];
  heatmapAlerts: HeatmapEntry[];
  topDrops: any[];
  summary: { totalSignals: number; countriesTracked: number; criticalAlerts: number };
  timestamp: string;
}

const LEVEL_COLORS: Record<number, string> = {
  1: '#facc15', 2: '#fb923c', 3: '#f87171',
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#4ade80', neutral: '#facc15', negative: '#f87171',
};

function flagEmoji(code: string): string {
  if (code === 'uk') return '🇬🇧';
  const base = 127397;
  const chars = [...code.toUpperCase()];
  if (chars.length !== 2) return '🌍';
  return String.fromCodePoint(chars[0].charCodeAt(0) + base, chars[1].charCodeAt(0) + base);
}

export default function PulsoGlobalMap({ data, mode }: { data: GlobalData; mode: 'sentiment' | 'heatmap' }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const markers = L.layerGroup().addTo(map);

    if (mode === 'sentiment') {
      for (const entry of data.sentimentRanking) {
        if (!entry.coordinates) continue;
        if (entry.pinned && entry.signals === 0) {
          const circle = L.circleMarker(entry.coordinates, {
            radius: 4,
            fillColor: '#475569',
            color: '#64748b',
            weight: 0.5,
            opacity: 0.4,
            fillOpacity: 0.4,
          });
          circle.bindTooltip(`<div style="font-weight:600;font-size:13px;color:#94a3b8">🔍 ${entry.countryName} — en observación</div>`, { direction: 'top', offset: [0, -8] });
          markers.addLayer(circle);
          continue;
        }
        const color = entry.mood ? SENTIMENT_COLORS[entry.mood] : '#64748b';
        const r = Math.max(6, Math.min(14, Math.sqrt(entry.signals) * 2));
        const circle = L.circleMarker(entry.coordinates, {
          radius: r,
          fillColor: color,
          color: '#ffffff',
          weight: 0.5,
          opacity: 0.6,
          fillOpacity: 0.7,
        });
        const moodLabel = entry.mood === 'positive' ? '😊' : entry.mood === 'negative' ? '😟' : '😐';
        circle.bindTooltip(`<div style="font-weight:600;font-size:13px">${flagEmoji(entry.countryCode)} ${entry.countryName}</div>`, { direction: 'top', offset: [0, -8] });
        circle.bindPopup(`
          <div style="min-width:180px;font-family:system-ui,sans-serif">
            <h3 style="font-weight:700;font-size:16px;margin:0 0 4px">${flagEmoji(entry.countryCode)} ${entry.countryName}</h3>
            <div style="font-size:24px;margin:4px 0">${moodLabel}</div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#334155">
              <span>Sentimiento: <strong>${entry.avgTone != null ? (entry.avgTone > 0 ? '+' : '') + entry.avgTone : '—'}</strong></span>
              <span>Señales: <strong>${entry.signals}</strong></span>
            </div>
            <div style="display:flex;gap:8px;margin-top:6px;font-size:12px">
              <span style="color:#16a34a">😊 ${entry.positive}</span>
              <span style="color:#ca8a04">😐 ${entry.neutral}</span>
              <span style="color:#dc2626">😟 ${entry.negative}</span>
            </div>
            <a href="/pais/${entry.countryCode}" style="display:inline-block;margin-top:8px;padding:4px 12px;background:#1e293b;color:#fff;border-radius:6px;text-decoration:none;font-size:12px">Ver país →</a>
          </div>
        `, { closeButton: true, className: 'pulso-popup' });
        markers.addLayer(circle);
      }
    } else {
      for (const alert of data.heatmapAlerts) {
        if (!alert.coordinates) continue;
        const fill = LEVEL_COLORS[alert.level] || LEVEL_COLORS[1];
        const lvlEmoji = alert.level === 3 ? '🔴' : alert.level === 2 ? '🟠' : '🟡';
        const lvlLabel = alert.level === 3 ? 'Alerta temprana' : alert.level === 2 ? 'Monitorizar' : 'Leve';
        const circle = L.circleMarker(alert.coordinates, {
          radius: 10,
          fillColor: fill,
          color: '#ffffff',
          weight: 0.5,
          opacity: 0.6,
          fillOpacity: 0.7,
        });
        circle.bindTooltip(`<div style="font-weight:600;font-size:13px">${lvlEmoji} ${alert.country}</div>`, { direction: 'top', offset: [0, -8] });
        circle.bindPopup(`
          <div style="min-width:200px;font-family:system-ui,sans-serif">
            <h3 style="font-weight:700;font-size:16px;margin:0 0 4px">${lvlEmoji} ${alert.country}</h3>
            <div style="font-weight:600;font-size:13px;color:${fill}}">${lvlLabel}</div>
            <div style="display:flex;gap:12px;margin:6px 0;font-size:13px;color:#334155">
              <span>📊 ${alert.signals24h} señales / 24h</span>
              <span>📈 x${alert.spike}</span>
            </div>
            ${alert.reasons.length ? `<div style="font-size:12px;color:#64748b">${alert.reasons.map((r: string) => '• ' + r).join('<br>')}</div>` : ''}
            ${alert.keywords.length ? `<div style="margin-top:4px;font-size:11px;color:#94a3b8">${alert.keywords.join(', ')}</div>` : ''}
            ${alert.countryCode ? `<a href="/pais/${alert.countryCode}" style="display:inline-block;margin-top:8px;padding:4px 12px;background:#1e293b;color:#fff;border-radius:6px;text-decoration:none;font-size:12px">Ver país →</a>` : ''}
          </div>
        `, { closeButton: true });
        markers.addLayer(circle);
      }
    }

    return () => { map.removeLayer(markers); };
  }, [data, mode]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />;
}
