'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function TileAltFixer() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const el = container.querySelector<HTMLImageElement>('.leaflet-tile');
    if (el) el.alt = 'Mapa OpenStreetMap';

    const observer = new MutationObserver(() => {
      container.querySelectorAll<HTMLImageElement>('.leaflet-tile').forEach(img => {
        if (img.alt === '') img.alt = 'Mapa OpenStreetMap';
      });
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [map]);

  return null;
}
