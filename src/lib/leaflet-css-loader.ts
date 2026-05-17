'use client';

let loaded = false;
let loading: Promise<void> | null = null;

export function ensureLeafletCSS(): Promise<void> {
  if (loaded) return Promise.resolve();

  if (loading) return loading;

  loading = new Promise((resolve) => {
    const existing = document.querySelector<HTMLLinkElement>(
      'link[href*="leaflet@1.9.4/dist/leaflet.css"]'
    );

    if (existing) {
      // Check if already loaded
      try {
        for (const sheet of document.styleSheets) {
          if (sheet.href?.includes('leaflet@1.9.4/dist/leaflet.css')) {
            loaded = true;
            resolve();
            return;
          }
        }
      } catch {}
      // Wait for load
      const onLoad = () => {
        loaded = true;
        resolve();
      };
      if (existing.sheet) {
        onLoad();
        return;
      }
      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onLoad, { once: true });
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.onload = () => {
      document.body.offsetHeight; // force reflow
      loaded = true;
      resolve();
    };
    link.onerror = () => {
      loaded = true;
      resolve();
    };
    document.head.appendChild(link);
  });

  return loading;
}
