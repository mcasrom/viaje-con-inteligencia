'use client';
import { useState, useCallback } from 'react';
import { AlertTriangle, X, MapPin, Phone, Shield, ExternalLink, Loader2, ChevronDown } from 'lucide-react';
import { paisesData, getEmergenciasPorPais, getTodosLosPaises, type NivelRiesgo } from '@/data/paises';

interface SOSData {
  countryCode: string;
  countryName: string;
  risk: NivelRiesgo;
  embassy: { nombre: string; telefono: string; direccion: string; email?: string } | null;
  emergencies: { general: string; policia: string; bomberos: string; ambulancia: string } | null;
  hospitals: { nombre: string; telefono?: string; direccion?: string }[];
  emoji: string;
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
  sa: '🇸🇦', ir: '🇮🇷', iq: '🇮🇶', sy: '🇸🇾', ye: '🇾🇪', af: '🇦🇫', pk: '🇵🇰',
  id: '🇮🇩', my: '🇲🇾', sg: '🇸🇬', ph: '🇵🇭', vn: '🇻🇳', gr: '🇬🇷', pl: '🇵🇱',
  nl: '🇳🇱', be: '🇧🇪', ch: '🇨🇭', at: '🇦🇹', se: '🇸🇪', no: '🇳🇴', dk: '🇩🇰',
  fi: '🇫🇮', hu: '🇭🇺', bg: '🇧🇬', hr: '🇭🇷', ro: '🇷🇴', cz: '🇨🇿',
  sk: '🇸🇰', si: '🇸🇮', lt: '🇱🇹', lv: '🇱🇻', ee: '🇪🇪', is: '🇮🇸', mt: '🇲🇹',
  cy: '🇨🇾', ly: '🇱🇾', dz: '🇩🇿', tn: '🇹🇳', sd: '🇸🇩', et: '🇪🇹', tz: '🇹🇿',
  gh: '🇬🇭', sn: '🇸🇳', mz: '🇲🇿', ao: '🇦🇴', ci: '🇨🇮', cm: '🇨🇲', ug: '🇺🇬',
  zm: '🇿🇲', zw: '🇿🇼', bw: '🇧🇼', na: '🇳🇦', ht: '🇭🇹', mm: '🇲🇲', kh: '🇰🇭',
  la: '🇱🇦', np: '🇳🇵', bd: '🇧🇩', lk: '🇱🇰', kz: '🇰🇿', uz: '🇺🇿', jo: '🇯🇴',
  lb: '🇱🇧', ps: '🇵🇸', so: '🇸🇴', ss: '🇸🇸', cf: '🇨🇫', ml: '🇲🇱', bf: '🇧🇫',
  ne: '🇳🇪', ga: '🇬🇦', cg: '🇨🇬', cd: '🇨🇩', mg: '🇲🇬', mu: '🇲🇺', sc: '🇸🇨',
  mv: '🇲🇻', bn: '🇧🇳', tl: '🇹🇱', fj: '🇫🇯', pg: '🇵🇬', sb: '🇸🇧', ws: '🇼🇸',
  ge: '🇬🇪', am: '🇦🇲', az: '🇦🇿', al: '🇦🇱', ba: '🇧🇦', me: '🇲🇪', rs: '🇷🇸',
  mk: '🇲🇰', xk: '🇽🇰', kp: '🇰🇵',
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
  const [step, setStep] = useState<'idle' | 'locating' | 'manual' | 'ready'>('idle');
  const [data, setData] = useState<SOSData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

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
      setStep('manual');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=es`,
            { headers: { 'User-Agent': 'ViajeInteligencia/1.0' } }
          );
          const geo = await res.json();
          const cc = (geo.address?.country_code || '').toLowerCase();
          if (!cc || !COUNTRY_BY_NOMINATIM[cc]) {
            setError('No pudimos determinar tu país desde tu ubicación.');
            setStep('manual');
            return;
          }
          const code = COUNTRY_BY_NOMINATIM[cc];
          buildSOSData(code);
        } catch {
          setError('Error al determinar ubicación. Selecciona manualmente.');
          setStep('manual');
        }
      },
      () => {
        setStep('manual');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  const buildSOSData = async (code: string) => {
    const pais = paisesData[code];
    if (!pais) {
      setError(`País "${code}" no disponible en la base de datos.`);
      setStep('manual');
      return;
    }
    const emergencies = getEmergenciasPorPais(code);
    const embassy = pais.contactos?.find(c => c.tipo === 'Embajada') || null;

    let hospitals: SOSData['hospitals'] = [];
    try {
      const res = await fetch(`/api/pois?country=${code}&type=hospital&limit=5`);
      const poiData = await res.json();
      if (poiData?.pois?.length) {
        hospitals = poiData.pois.slice(0, 3).map((p: any) => ({
          nombre: p.nombre || p.name || 'Hospital',
          telefono: p.telefono || p.phone,
          direccion: p.direccion || p.address,
        }));
      }
    } catch {}

    setData({
      countryCode: code,
      countryName: pais.nombre,
      risk: pais.nivelRiesgo,
      embassy,
      emergencies,
      hospitals,
      emoji: FLAG_EMOJI[code] || pais.bandera || '🌍',
    });
    setStep('ready');
  };

  const handleManualSubmit = () => {
    const code = manualCode.toLowerCase().trim();
    if (code && paisesData[code]) {
      buildSOSData(code);
    }
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
                  <p className="text-slate-500 text-sm">Usamos tu posición para mostrarte los riesgos y contactos locales.</p>
                </div>
              )}

              {step === 'manual' && (
                <div className="space-y-4">
                  <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-4 text-sm text-yellow-300">
                    <p className="font-medium mb-1">📍 No pudimos obtener tu ubicación</p>
                    <p className="text-yellow-400/70">Selecciona tu país manualmente para ver la información de emergencia.</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Tu país actual</label>
                    <div className="flex gap-2">
                      <select
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                      >
                        <option value="">Selecciona un país...</option>
                        {getTodosLosPaises().map(p => (
                          <option key={p.codigo} value={p.codigo}>
                            {FLAG_EMOJI[p.codigo] || '🌍'} {p.nombre}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleManualSubmit}
                        disabled={!manualCode}
                        className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
              )}

              {step === 'ready' && data && (
                <>
                  {/* Country & Risk */}
                  <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{data.emoji}</span>
                      <div>
                        <h3 className="text-white text-xl font-bold">{data.countryName}</h3>
                        <p className="text-slate-400 text-sm">Ubicación actual detectada</p>
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

                  {/* Hospitals */}
                  {data.hospitals.length > 0 && (
                    <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4">
                      <h4 className="text-white font-bold flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-green-400" /> Hospitales cercanos
                      </h4>
                      <div className="space-y-2">
                        {data.hospitals.map((h, i) => (
                          <div key={i} className="bg-slate-800/60 rounded-lg p-3">
                            <p className="text-white font-medium text-sm">{h.nombre}</p>
                            {h.direccion && <p className="text-slate-400 text-xs mt-0.5">{h.direccion}</p>}
                            {h.telefono && (
                              <a href={`tel:${h.telefono.replace(/[^+\d]/g, '')}`} className="text-green-400 text-xs hover:underline mt-1 inline-block">
                                {h.telefono}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
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
