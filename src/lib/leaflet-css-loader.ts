'use client';

let loaded = false;
let loading: Promise<void> | null = null;

const CRITICAL_CSS = `
.leaflet-pane,
.leaflet-tile,
.leaflet-marker-icon,
.leaflet-marker-shadow,
.leaflet-tile-container,
.leaflet-pane > svg,
.leaflet-pane > canvas,
.leaflet-zoom-box,
.leaflet-image-layer,
.leaflet-layer {
  position: absolute;
  left: 0;
  top: 0;
}
.leaflet-container {
  overflow: hidden;
}
.leaflet-tile {
  position: absolute;
  width: 256px;
  height: 256px;
  max-width: none !important;
  pointer-events: none;
}
.leaflet-tile-container {
  position: absolute;
  left: 0;
  top: 0;
}
.leaflet-pane > svg {
  position: absolute;
  left: 0;
  top: 0;
}
`;

export function ensureLeafletCSS(): Promise<void> {
  if (loaded) return Promise.resolve();

  if (loading) return loading;

  loading = new Promise((resolve) => {
    // Inject critical inline styles immediately (no network dependency)
    const styleId = 'leaflet-critical';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = CRITICAL_CSS;
      document.head.appendChild(style);
    }

    // Also load full Leaflet CSS from CDN
    const existing = document.querySelector<HTMLLinkElement>(
      'link[rel="stylesheet"][href*="leaflet@1.9.4/dist/leaflet.css"]'
    );

    const done = () => {
      document.body.offsetHeight;
      requestAnimationFrame(() => {
        loaded = true;
        resolve();
      });
    };

    if (existing) {
      for (const sheet of document.styleSheets) {
        if (sheet.href?.includes('leaflet@1.9.4/dist/leaflet.css')) {
          done();
          return;
        }
      }
      if (existing.sheet) {
        done();
        return;
      }
      existing.addEventListener('load', done, { once: true });
      existing.addEventListener('error', done, { once: true });
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.onload = done;
    link.onerror = done;
    document.head.appendChild(link);
  });

  return loading;
}
