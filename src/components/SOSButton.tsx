'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, X, MapPin, Phone, Shield, ExternalLink, Loader2, Navigation, Search } from 'lucide-react';
import { paisesData, getEmergenciasPorPais, getTodosLosPaises, type NivelRiesgo } from '@/data/paises';

interface EmergencyPoi {
  name: string;
  type: string;
  typeName: string;
  icon: string;
  phone?: string;
  address?: string;
  distance_m?: number;
  lat: number;
  lon: number;
}

interface LocationResult {
  lat: number;
  lon: number;
  countryCode: string;
  displayName: string;
}

interface SOSData {
  countryCode: string;
  countryName: string;
  risk: NivelRiesgo;
  embassy: { nombre: string; telefono: string; direccion: string; email?: string } | null;
  emergencies: { general: string; policia: string; bomberos: string; ambulancia: string } | null;
  emergencyPois: EmergencyPoi[];
  emoji: string;
  locationLabel: string;
}

const RISK_LABELS: Record<NivelRiesgo, { label: string; color: string; bg: string }> = {
  'muy-alto': { label: 'MUY ALTO — No viajar', color: 'text-red-300', bg: 'bg-red-900/60 border-red-700' },
  'alto': { label: 'ALTO — Evitar viajes no esenciales', color: 'text-red-400', bg: 'bg-red-800/40 border-red-700/50' },
  'medio': { label: 'MEDIO — Precaución reforzada', color: 'text-orange-400', bg: 'bg-orange-800/40 border-orange-700/50' },
  'bajo': { label: 'BAJO — Precauciones habituales', color: 'text-yellow-400', bg: 'bg-yellow-800/30 border-yellow-700/40' },
  'sin-riesgo': { label: 'SIN RIESGO', color: 'text-green-400', bg: 'bg-green-800/30 border-green-700/40' },
};

const FLAG_EMOJI: Record<string, string> = {
  es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', it: '🇮🇹', pt: '🇵🇹', gb: '🇬🇧', ie: '🇮🇪',
  us: '🇺🇸', ca: '🇨🇦', mx: '🇲🇽', ar: '🇦🇷', br: '🇧🇷', cl: '🇨🇱', co: '🇨🇴',
  pe: '🇵🇪', uy: '🇺🇾', ec: '🇪🇨', gt: '🇬🇹', cu: '🇨🇺', do: '🇩🇴', ve: '🇻🇪',
  bo: '🇧🇴', py: '🇵🇾', pa: '🇵🇦', cr: '🇨🇷', jp: '🇯🇵', cn: '🇨🇳', kr: '🇰🇷',
  th: '🇹🇭', in: '🇮🇳', au: '🇦🇺', nz: '🇳🇿', ru: '🇷🇺', ua: '🇺🇦', tr: '🇹🇷',
  eg: '🇪🇬', ma: '🇲🇦', za: '🇿🇦', ke: '🇰🇪', ng: '🇳🇬', il: '🇮🇱', ae: '🇦🇪',
  sa: '🇸🇦', ir: '🇮🇷', iq: '🇮🇶', id: '🇮🇩', my: '🇲🇾', sg: '🇸🇬', ph: '🇵🇭',
  vn: '🇻🇳', gr: '🇬🇷', pl: '🇵🇱', nl: '🇳🇱', be: '🇧🇪', ch: '🇨🇭', at: '🇦🇹',
  se: '🇸🇪', no: '🇳🇴', dk: '🇩🇰', fi: '🇫🇮', hu: '🇭🇺', bg: '🇧🇬', hr: '🇭🇷',
  ro: '🇷🇴', cz: '🇨🇿', sk: '🇸🇰', si: '🇸🇮', lt: '🇱🇹', lv: '🇱🇻', ee: '🇪🇪',
  is: '🇮🇸', mt: '🇲🇹', cy: '🇨🇾', ly: '🇱🇾', dz: '🇩🇿', tn: '🇹🇳', sd: '🇸🇩',
  et: '🇪🇹', tz: '🇹🇿', gh: '🇬🇭', sn: '🇸🇳', mz: '🇲🇿', ao: '🇦🇴', ci: '🇨🇮',
  cm: '🇨🇲', ug: '🇺🇬', zm: '🇿🇲', zw: '🇿🇼', bw: '🇧🇼', na: '🇳🇦', ht: '🇭🇹',
  mm: '🇲🇲', kh: '🇰🇭', la: '🇱🇦', np: '🇳🇵', bd: '🇧🇩', lk: '🇱🇰', kz: '🇰🇿',
  uz: '🇺🇿', jo: '🇯🇴', lb: '🇱🇧', ps: '🇵🇸', so: '🇸🇴', ss: '🇸🇸', cf: '🇨🇫',
  ml: '🇲🇱', bf: '🇧🇫', ne: '🇳🇪', ga: '🇬🇦', cg: '🇨🇬', cd: '🇨🇩', mg: '🇲🇬',
  mu: '🇲🇺', sc: '🇸🇨', mv: '🇲🇻', bn: '🇧🇳', tl: '🇹🇱', fj: '🇫🇯', pg: '🇵🇬',
  sb: '🇸🇧', ws: '🇼🇸', ge: '🇬🇪', am: '🇦🇲', az: '🇦🇿', al: '🇦🇱', ba: '🇧🇦',
  me: '🇲🇪', rs: '🇷🇸', mk: '🇲🇰', kp: '🇰🇵', pk: '🇵🇰', af: '🇦🇫', sy: '🇸🇾',
  ye: '🇾🇪', xk: '🇽🇰',
};

const COUNTRY_BY_NOMINATIM: Record<string, string> = {
  es: 'es', fr: 'fr', de: 'de', it: 'it', pt: 'pt', gb: 'gb', ie: 'ie',
  us: 'us', ca: 'ca', mx: 'mx', ar: 'ar', br: 'br', cl: 'cl', co: 'co',
  pe: 'pe', uy: 'uy', ec: 'ec', ve: 've', bo: 'bo', py: 'py', pa: 'pa',
  cr: 'cr', cu: 'cu', do: 'do', gt: 'gt', jp: 'jp', cn: 'cn', kr: 'kr',
  th: 'th', in: 'in', au: 'au', nz: 'nz', ru: 'ru', ua: 'ua', tr: 'tr',
  eg: 'eg', ma: 'ma', za: 'za', ke: 'ke', ng: 'ng', il: 'il', ae: 'ae',
  sa: 'sa', ir: 'ir', iq: 'iq', id: 'id', my: 'my', sg: 'sg', ph: 'ph',
  vn: 'vn', gr: 'gr', pl: 'pl', nl: 'nl', be: 'be', ch: 'ch', at: 'at',
  se: 'se', no: 'no', dk: 'dk', fi: 'fi', hu: 'hu', bg: 'bg', hr: 'hr',
  ro: 'ro', cz: 'cz', sk: 'sk', si: 'si', lt: 'lt', lv: 'lv', ee: 'ee',
  is: 'is', mt: 'mt', cy: 'cy', ly: 'ly', dz: 'dz', tn: 'tn', sd: 'sd',
  et: 'et', tz: 'tz', gh: 'gh', sn: 'sn', ht: 'ht', mm: 'mm', kh: 'kh',
  la: 'la', np: 'np', bd: 'bd', lk: 'lk', kz: 'kz', uz: 'uz', jo: 'jo',
  lb: 'lb', pk: 'pk', af: 'af', sy: 'sy', ye: 'ye', so: 'so', ge: 'ge',
  am: 'am', az: 'az', al: 'al', ba: 'ba', me: 'me', rs: 'rs', mk: 'mk',
  kp: 'kp', ao: 'ao', ci: 'ci', cm: 'cm', ug: 'ug', zm: 'zm',
  zw: 'zw', bw: 'bw', na: 'na', ga: 'ga', cg: 'cg', cd: 'cd', mg: 'mg',
  mu: 'mu', sc: 'sc', mv: 'mv', bn: 'bn', tl: 'tl', fj: 'fj', pg: 'pg',
  sb: 'sb', ws: 'ws',
};

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'idle' | 'locating' | 'search' | 'ready'>('idle');
  const [data, setData] = useState<SOSData | null>(null);
  const [poisLoading, setPoisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const userCoords = useRef<{ lat: number; lon: number } | null>(null);


  useEffect(() => {
    const handler = () => {
      if (!isOpen) handleOpen();
    };
    globalThis.addEventListener?.('open-sos', handler);
    return () => globalThis.removeEventListener?.('open-sos', handler);
  }, [isOpen]);

  const loadEmergencyPois = async (code: string) => {
    setPoisLoading(true);
    try {
      const coords = userCoords.current;
      const url = coords
        ? `/api/pois?type=emergency&lat=${coords.lat}&lon=${coords.lon}&radius=5000&limit=8`
        : `/api/pois?country=${code}&type=emergency&limit=8`;
      const res = await fetch(url);
      const poiData = await res.json();
      if (poiData?.pois?.length) {
        const pois = poiData.pois.slice(0, 6).map((p: any) => ({
          name: p.name,
          type: p.type,
          typeName: p.typeName,
          icon: p.icon,
          phone: p.phone,
          address: p.address,
          distance_m: p.distance_m,
          lat: p.lat,
          lon: p.lon,
        }));
        setData(prev => prev ? { ...prev, emergencyPois: pois } : prev);
      }
    } catch {}
    setPoisLoading(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStep('locating');
    setError(null);
    getLocation();
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('idle');
    setData(null);
    setError(null);
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStep('search');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        userCoords.current = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=es`,
            { headers: { 'User-Agent': 'ViajeInteligencia/1.0' } }
          );
          const geo = await res.json();
          const cc = (geo.address?.country_code || '').toLowerCase();
          if (!cc || !COUNTRY_BY_NOMINATIM[cc]) {
            setStep('search');
            return;
          }
          const locationLabel = geo.display_name?.split(',')?.slice(0, 3)?.join(',') || 'Ubicación actual';
          buildSOSData(COUNTRY_BY_NOMINATIM[cc], locationLabel);
        } catch {
          setStep('search');
        }
      },
      () => { setStep('search'); },
      { timeout: 5000, enableHighAccuracy: false }
    );
  }, []);

  const geocodeSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=es`,
        { headers: { 'User-Agent': 'ViajeInteligencia/1.0' } }
      );
      const data = await res.json();
      const results: LocationResult[] = data
        .filter((r: any) => r.type !== 'country')
        .map((r: any) => ({
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          countryCode: '',
          displayName: r.display_name,
        }));

      // Enrich with country codes
      for (const result of results) {
        try {
          const rev = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${result.lat}&lon=${result.lon}&format=json&zoom=3&accept-language=es`,
            { headers: { 'User-Agent': 'ViajeInteligencia/1.0' } }
          );
          const geo = await rev.json();
          const cc = (geo.address?.country_code || '').toLowerCase();
          result.countryCode = COUNTRY_BY_NOMINATIM[cc] || cc;
        } catch {}
      }

      setSearchResults(results.filter(r => r.countryCode && paisesData[r.countryCode]));
    } catch {}
    setSearching(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => geocodeSearch(value), 400);
  };

  const handleSelectLocation = (loc: LocationResult) => {
    userCoords.current = { lat: loc.lat, lon: loc.lon };
    const label = loc.displayName.split(',').slice(0, 3).join(',');
    buildSOSData(loc.countryCode, label);
  };

  const buildSOSData = async (code: string, locationLabel?: string) => {
    const pais = paisesData[code];
    if (!pais) {
      setError(`País "${code}" no disponible en la base de datos.`);
      setStep('search');
      return;
    }
    const emergencies = getEmergenciasPorPais(code);
    const embassy = pais.contactos?.find(c => c.tipo === 'Embajada') || null;

    setData({
      countryCode: code,
      countryName: pais.nombre,
      risk: pais.nivelRiesgo,
      embassy,
      emergencies,
      emergencyPois: [],
      emoji: FLAG_EMOJI[code] || pais.bandera || '🌍',
      locationLabel: locationLabel || pais.nombre,
    });
    setStep('ready');

    loadEmergencyPois(code);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-4 left-4 z-[1030] w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 animate-pulse-slow"
          title="Modo Emergencia — Ayuda inmediata"
          aria-label="Modo Emergencia"
        >
          <AlertTriangle className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[1040] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-white font-bold text-lg">Modo Emergencia</h2>
              </div>
              <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {step === 'locating' && (
                <div className="text-center py-8 space-y-3">
                  <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
                  <p className="text-slate-300">Detectando tu ubicación...</p>
                  <p className="text-slate-500 text-sm">Intentando obtener tu posición por GPS.</p>
                  <button
                    onClick={() => { setStep('search'); setError(null); }}
                    className="text-sm text-slate-400 hover:text-white underline mt-2"
                  >
                    No tengo GPS — buscar manualmente
                  </button>
                </div>
              )}

              {step === 'search' && (
                <div className="space-y-4">
                  <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-4 text-sm text-yellow-300">
                    <p className="font-medium mb-1">📍 Busca tu ubicación</p>
                    <p className="text-yellow-400/70">Escribe una ciudad, aeropuerto o lugar para encontrar servicios de emergencia cercanos.</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Ej: Barcelona, Chiang Mai, Aeropuerto CDG..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                      autoFocus
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((loc, i) => {
                        const flag = FLAG_EMOJI[loc.countryCode] || '🌍';
                        const pais = paisesData[loc.countryCode];
                        const label = loc.displayName.split(',').slice(0, 4).join(',');
                        return (
                          <button
                            key={i}
                            onClick={() => handleSelectLocation(loc)}
                            className="w-full text-left bg-slate-700/50 hover:bg-slate-600/50 rounded-xl p-3 transition-colors border border-slate-600/30"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">{label}</p>
                                <p className="text-slate-400 text-xs">{flag} {pais?.nombre || loc.countryCode}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {searchQuery.length >= 3 && !searching && searchResults.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">
                      No encontramos resultados. Prueba con otra ciudad o lugar.
                    </p>
                  )}

                  {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
              )}

              {step === 'ready' && data && (
                <>
                  {/* Location & Risk */}
                  <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{data.emoji}</span>
                      <div>
                        <h3 className="text-white text-xl font-bold">{data.countryName}</h3>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {data.locationLabel}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-sm font-bold border ${RISK_LABELS[data.risk].bg} ${RISK_LABELS[data.risk].color}`}>
                      {RISK_LABELS[data.risk].label}
                    </div>
                  </div>

                  {/* Emergency Numbers */}
                  {data.emergencies && (
                    <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4">
                      <h4 className="text-white font-bold flex items-center gap-2 mb-3">
                        <Phone className="w-4 h-4 text-red-400" /> Emergencias — {data.countryName}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'General', num: data.emergencies.general },
                          { label: 'Policía', num: data.emergencies.policia },
                          { label: 'Bomberos', num: data.emergencies.bomberos },
                          { label: 'Ambulancia', num: data.emergencies.ambulancia },
                        ].map(e => (
                          <a
                            key={e.label}
                            href={`tel:${e.num}`}
                            className="flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition-colors"
                          >
                            <span className="text-slate-300 text-sm">{e.label}</span>
                            <span className="text-white font-bold text-lg">{e.num}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Embassy */}
                  {data.embassy && (
                    <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
                      <h4 className="text-white font-bold flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-blue-400" /> Asistencia consular
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-white font-medium">{data.embassy.nombre}</p>
                        {data.embassy.direccion && (
                          <p className="text-slate-400">{data.embassy.direccion}</p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {data.embassy.telefono && (
                            <a
                              href={`tel:${data.embassy.telefono.replace(/[^+\d]/g, '')}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-lg hover:bg-blue-600/50 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" /> {data.embassy.telefono}
                            </a>
                          )}
                          {data.embassy.email && (
                            <a
                              href={`mailto:${data.embassy.email}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-lg hover:bg-blue-600/50 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Email
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emergency POIs */}
                  {(data.emergencyPois.length > 0 || poisLoading) && (
                    <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4">
                      <h4 className="text-white font-bold flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-green-400" /> Puntos de interés cercanos
                      </h4>
                      {poisLoading && data.emergencyPois.length === 0 ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cargando puntos de interés...
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {data.emergencyPois.map((poi, i) => (
                            <div key={i} className="bg-slate-800/60 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{poi.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-sm truncate">{poi.name}</p>
                                  <p className="text-slate-400 text-xs">{poi.typeName}</p>
                                </div>
                                {poi.distance_m != null && (
                                  <span className="text-slate-400 text-xs shrink-0 flex items-center gap-1">
                                    <Navigation className="w-3 h-3" />
                                    {poi.distance_m < 1000
                                      ? `${poi.distance_m}m`
                                      : `${(poi.distance_m / 1000).toFixed(1)}km`}
                                  </span>
                                )}
                              </div>
                              {poi.phone && (
                                <a href={`tel:${poi.phone.replace(/[^+\d]/g, '')}`} className="text-green-400 text-xs hover:underline mt-1 inline-block">
                                  {poi.phone}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <p className="text-slate-500 text-xs text-center pt-2">
                    Datos MAEC · OpenStreetMap · Emergencias locales.
                    Verifica siempre con fuentes oficiales.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
