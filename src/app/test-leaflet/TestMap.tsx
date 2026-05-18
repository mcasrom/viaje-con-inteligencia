'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type LogEntry = { msg: string; type: 'info' | 'error' | 'success' | 'warn' };

const CARTO_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

function flagEmoji(code: string): string {
  if (code === 'uk') return '🇬🇧';
  const base = 127397;
  const chars = [...code.toUpperCase()];
  if (chars.length !== 2) return '🌍';
  return String.fromCodePoint(chars[0].charCodeAt(0) + base, chars[1].charCodeAt(0) + base);
}

export default function TestMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tileStats, setTileStats] = useState({ dom: 0, loaded: 0, errors: 0, natural: 0 });

  const log = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { msg, type }]);
  }, []);

  const resetAndReload = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        for (const reg of regs) {
          reg.unregister().then(() => log('SW unregistered', 'success'));
        }
      });
    }
    caches.keys().then(keys => {
      for (const key of keys) {
        if (key.includes('viaje')) caches.delete(key);
      }
    });
    log('Cache cleared, reloading...', 'warn');
    setTimeout(() => window.location.reload(), 500);
  }, [log]);

  const checkTileDOM = useCallback(() => {
    if (!mapRef.current) return;
    const imgs = mapRef.current.querySelectorAll<HTMLImageElement>('.leaflet-tile');
    let loaded = 0, errors = 0, natural = 0;
    imgs.forEach(img => {
      if (img.classList.contains('leaflet-tile-loaded')) loaded++;
      if (img.naturalWidth > 0) natural++;
    });
    setTileStats({ dom: imgs.length, loaded, errors, natural });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;
    const el = mapRef.current;

    // --- Phase 1: Environment checks ---
    log('--- Leaflet Diagnostic ---', 'info');

    // SW status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        log(`SW registrations: ${regs.length}`, regs.length ? 'warn' : 'info');
        for (const r of regs) {
          log(`SW scope: ${r.scope}, active: ${r.active?.state || 'none'}`);
        }
      });
    } else {
      log('Service Worker: NOT SUPPORTED', 'error');
    }

    // Check preloaded CSS link
    const allLinks = document.querySelectorAll('link[href*="leaflet@1.9.4"]');
    log(`<link> elements matching leaflet: ${allLinks.length}`, 'info');
    allLinks.forEach((l, i) => {
      log(`  link[${i}]: rel="${l.getAttribute('rel')}" href="${l.getAttribute('href')}"`, 'info');
    });

    // Check if leaflet-critical style exists
    const criticalStyle = document.getElementById('leaflet-critical');
    log(`leaflet-critical inline style: ${criticalStyle ? 'EXISTS' : 'MISSING'}`, criticalStyle ? 'success' : 'error');

    // Check styleSheets for leaflet CSS
    let foundInSheets = false;
    for (const s of document.styleSheets) {
      if (s.href?.includes('leaflet@1.9.4')) {
        foundInSheets = true;
        log(`Leaflet CSS found in styleSheets: ${s.href}`, 'success');
        break;
      }
    }
    if (!foundInSheets) log('Leaflet CSS NOT in document.styleSheets (might be loading)', 'warn');

    // --- Phase 2: Tile URL fetch tests ---
    const testTile = async (url: string, label: string) => {
      try {
        const r = await fetch(url, { mode: 'no-cors' });
        log(`${label}: ${r.status} ${r.ok ? 'OK' : 'FAIL'} type=${r.type}`, r.ok ? 'success' : 'error');
      } catch (e: any) {
        log(`${label}: FETCH ERROR ${e.message}`, 'error');
      }
      try {
        const r2 = await fetch(url);
        log(`${label} (cors mode): ${r2.status} ${r2.ok ? 'OK' : 'FAIL'}`, r2.ok ? 'success' : 'error');
        if (r2.ok) {
          const blob = await r2.blob();
          log(`${label} blob type: ${blob.type}, size: ${blob.size}`, 'info');
        }
      } catch (e: any) {
        log(`${label} (cors mode): ERROR ${e.message}`, 'error');
      }
    };

    testTile('https://a.tile.openstreetmap.org/2/1/1.png', 'OSM tile');
    testTile('https://a.basemaps.cartocdn.com/dark_all/2/1/1.png', 'CARTO dark tile');

    // Also try image load test
    const imgTest = (url: string, label: string) => {
      return new Promise<void>(resolve => {
        const img = new Image();
        img.onload = () => {
          log(`${label} <img> loaded: ${img.naturalWidth}x${img.naturalHeight}`, img.naturalWidth > 0 ? 'success' : 'error');
          resolve();
        };
        img.onerror = () => {
          log(`${label} <img> ERROR`, 'error');
          resolve();
        };
        img.src = url;
      });
    };

    (async () => {
      await imgTest('https://a.tile.openstreetmap.org/2/1/1.png', 'OSM <img>');
      await imgTest('https://a.basemaps.cartocdn.com/dark_all/2/1/1.png', 'CARTO <img>');

      // --- Phase 3: Map initialization ---
      log('Importing leaflet...', 'info');
      try {
        const L = await import('leaflet');
        log(`Leaflet imported v${L.version}`, 'success');

        document.body.offsetHeight;
        requestAnimationFrame(() => {
          if (cancelled) return;

          log('Creating map...', 'info');
          const map = L.map(el, {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
          });

          setTimeout(() => {
            try { map.invalidateSize(); log('invalidateSize() called', 'success'); } 
            catch (e) { log(`invalidateSize error: ${e}`, 'error'); }
          }, 200);

          // Container styles
          const cs = getComputedStyle(el);
          log(`Container: display=${cs.display} height=${cs.height} width=${cs.width} position=${cs.position} overflow=${cs.overflow}`, 'info');
          log(`Container client rect: ${el.clientWidth}x${el.clientHeight}`, 'info');

          // Listen to tile events
          let tileCount = 0;
          map.on('tileloadstart', () => {
            tileCount++;
            checkTileDOM();
          });
          map.on('tileload', (e: any) => {
            const img = e.tile as HTMLImageElement;
            log(`Tile LOADED: ${img.src.split('/').slice(-4).join('/')} ${img.naturalWidth}x${img.naturalHeight}`, 'success');
            checkTileDOM();
            // Log computed style of this tile
            const ts = getComputedStyle(img);
            log(`  Tile CSS: pos=${ts.position} w=${ts.width} h=${ts.height} maxW=${ts.maxWidth} display=${ts.display} vis=${ts.visibility}`, 'info');
          });
          map.on('tileerror', (e: any) => {
            const img = e.tile as HTMLImageElement;
            log(`Tile ERROR: ${img.src}`, 'error');
            setTileStats(prev => ({ ...prev, errors: prev.errors + 1 }));
          });

          // Add CARTO tiles (same as PulsoGlobal map)
          log('Adding CARTO tile layer...', 'info');
          const cartoLayer = L.tileLayer(CARTO_URL, {
            attribution: '&copy; CARTO',
            maxZoom: 18,
            subdomains: 'abc',
          }).addTo(map);

          // Check if tileLayer has correct URL
          log(`Tile layer URL: ${(cartoLayer as any)._url || 'unknown'}`, 'info');

          mapInstance.current = map;

          // Periodic DOM checks
          const interval = setInterval(() => {
            if (cancelled) return;
            checkTileDOM();
            const tiles = el.querySelectorAll<HTMLImageElement>('.leaflet-tile');
            const tilePane = el.querySelector('.leaflet-tile-pane');
            const tileContainer = el.querySelector('.leaflet-tile-container');
            const leafletLayer = el.querySelector('.leaflet-layer');
            log(`[${tiles.length} tiles DOM, pane=${!!tilePane}, container=${!!tileContainer}, layer=${!!leafletLayer}]`, 'info');
            if (tiles.length > 0) {
              const first = tiles[0];
              log(`  first tile: complete=${first.complete} natural=${first.naturalWidth}x${first.naturalHeight}`, 'info');
              log(`  first tile class: ${first.className}`, 'info');
            }
          }, 3000);

          setTimeout(() => clearInterval(interval), 30000);
        });
      } catch (e: any) {
        log(`Leaflet import ERROR: ${e.message}`, 'error');
      }
    })();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [log, checkTileDOM]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-xl font-bold">Leaflet Diagnostic</h1>
            <p className="text-slate-400 text-xs mt-1">
              URL actual: <span className="font-mono text-blue-400">{CARTO_URL}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetAndReload}
              className="text-xs bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
            >
              Reset SW &amp; Reload
            </button>
          </div>
        </div>

        {/* Tile stats bar */}
        <div className="grid grid-cols-5 gap-2 mb-4 text-xs font-mono">
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Tiles DOM</div>
            <div className="text-white text-lg">{tileStats.dom}</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Loaded</div>
            <div className="text-green-400 text-lg">{tileStats.loaded}</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Errors</div>
            <div className="text-red-400 text-lg">{tileStats.errors}</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">Natural &gt;0</div>
            <div className="text-yellow-400 text-lg">{tileStats.natural}</div>
          </div>
          <div className="bg-slate-800 rounded p-2 text-center">
            <div className="text-slate-400">SW active</div>
            <div className="text-cyan-400 text-lg" id="sw-status">?</div>
          </div>
        </div>

        {/* Map container */}
        <div
          ref={mapRef}
          style={{ width: '100%', height: '500px', borderRadius: '12px' }}
          className="border border-slate-700"
        />

        {/* Log panel */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-sm font-semibold">Debug Log</h2>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded border border-slate-700"
            >
              Clear
            </button>
          </div>
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 max-h-96 overflow-y-auto font-mono text-xs">
            {logs.length === 0 && (
              <div className="text-slate-600 italic">Waiting for diagnostics...</div>
            )}
            {logs.map((entry, i) => (
              <div
                key={i}
                className={`py-0.5 border-b border-slate-800/50 last:border-0 ${
                  entry.type === 'error' ? 'text-red-400' :
                  entry.type === 'success' ? 'text-green-400' :
                  entry.type === 'warn' ? 'text-yellow-400' :
                  'text-slate-300'
                }`}
              >
                <span className="text-slate-600 mr-2">{i + 1}</span>
                {entry.msg}
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-[10px] mt-2">
            Abre DevTools &gt; Network &gt; filtro &quot;png&quot; para ver tiles individuales
          </p>
        </div>
      </div>
    </div>
  );
}
