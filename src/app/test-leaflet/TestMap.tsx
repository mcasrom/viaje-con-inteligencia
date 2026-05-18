'use client';

import { useEffect, useRef, useState } from 'react';

export default function TestMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [status, setStatus] = useState<string[]>([]);
  const [tileImgs, setTileImgs] = useState<number>(0);
  const [tileLoaded, setTileLoaded] = useState<number>(0);
  const [tileErrors, setTileErrors] = useState<number>(0);

  const addStatus = (msg: string) => setStatus(prev => [...prev, msg]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    addStatus('Iniciando...');

    // 1. Test direct tile fetch
    const tileUrl = 'https://a.tile.openstreetmap.org/2/1/1.png';
    addStatus(`Fetching test tile: ${tileUrl}`);
    fetch(tileUrl).then(r => {
      addStatus(`Tile fetch status: ${r.status} ${r.ok ? 'OK' : 'FAIL'} type: ${r.type} size: ${r.headers.get('content-length') || '?'}`);
    }).catch((e: any) => {
      addStatus(`Tile fetch ERROR: ${e.message}`);
    });

    // Also try CARTO tile
    const cartoTile = 'https://a.basemaps.cartocdn.com/dark_all/2/1/1.png';
    fetch(cartoTile).then(r => {
      addStatus(`CARTO fetch status: ${r.status} ${r.ok ? 'OK' : 'FAIL'}`);
    }).catch((e: any) => {
      addStatus(`CARTO fetch ERROR: ${e.message}`);
    });

    const init = async () => {
      addStatus('Importing leaflet...');
      const L = await import('leaflet');
      addStatus('Leaflet imported, creating map...');

      // Ensure CSS is loaded
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.onload = () => {
        addStatus('Leaflet CSS onload fired');
        // Check if CSS rules are applied
        const container = mapRef.current!;
        const style = getComputedStyle(container);
        addStatus(`Container display:${style.display} position:${style.position} height:${style.height} overflow:${style.overflow}`);

        document.body.offsetHeight;
        requestAnimationFrame(() => {
          addStatus('RAF fired, creating map...');
          const map = L.map(mapRef.current!, {
            center: [20, 0],
            zoom: 2,
          });

          const bounds = map.getBounds();
          addStatus(`Map bounds: ${bounds.getSouth()},${bounds.getWest()} - ${bounds.getNorth()},${bounds.getEast()}`);

          // Listen for tile events
          map.on('tileloadstart', () => {
            setTileImgs(prev => prev + 1);
          });
          map.on('tileload', () => {
            setTileLoaded(prev => prev + 1);
            // Count actual img elements
            const imgs = mapRef.current?.querySelectorAll('.leaflet-tile').length || 0;
            setTileImgs(imgs);
          });
          map.on('tileerror', (e: any) => {
            setTileErrors(prev => prev + 1);
            addStatus(`Tile error: ${e.tile?.src || 'unknown'}`);
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OSM',
            maxZoom: 19,
          }).addTo(map);

          addStatus('Map created, waiting for tiles...');

          // Check DOM after 2s
          setTimeout(() => {
            const imgs = mapRef.current?.querySelectorAll('.leaflet-tile').length || 0;
            const loaded = mapRef.current?.querySelectorAll('.leaflet-tile-loaded').length || 0;
            const leafletLayer = mapRef.current?.querySelector('.leaflet-layer');
            const tilePane = mapRef.current?.querySelector('.leaflet-tile-pane');
            const tileContainer = mapRef.current?.querySelector('.leaflet-tile-container');

            addStatus(`After 2s: tile <img> in DOM: ${imgs}, .leaflet-tile-loaded: ${loaded}`);
            addStatus(`leaflet-layer: ${leafletLayer ? 'exists' : 'MISSING'}`);
            addStatus(`tile-pane: ${tilePane ? 'exists' : 'MISSING'}`);
            addStatus(`tile-container: ${tileContainer ? 'exists' : 'MISSING'}`);

            if (imgs > 0) {
              const firstImg = mapRef.current!.querySelector('.leaflet-tile') as HTMLImageElement;
              addStatus(`First tile src: ${firstImg?.src || 'N/A'}`);
              addStatus(`First tile complete: ${firstImg?.complete}, natural: ${firstImg?.naturalWidth}x${firstImg?.naturalHeight}`);
              addStatus(`First tile CSS: position=${firstImg?.style.position} width=${firstImg?.style.width} display=${firstImg?.style.display} visibility=${firstImg?.style.visibility}`);
              addStatus(`First tile computed: ${firstImg ? getComputedStyle(firstImg).position : 'N/A'}`);
            }
          }, 2000);

          mapInstance.current = map;
        });
      };
      document.head.appendChild(link);
    };

    init();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div className="text-xs text-slate-400 mb-2 flex gap-4">
        <span>Tiles in DOM: {tileImgs}</span>
        <span>Loaded: {tileLoaded}</span>
        <span className={tileErrors > 0 ? 'text-red-400' : ''}>Errors: {tileErrors}</span>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '12px' }} />
      <div className="mt-2 text-xs font-mono text-slate-500 max-h-60 overflow-y-auto bg-slate-900 rounded p-2">
        {status.map((s, i) => (
          <div key={i} className={s.includes('ERROR') || s.includes('error') ? 'text-red-400' : ''}>{s}</div>
        ))}
      </div>
    </div>
  );
}
