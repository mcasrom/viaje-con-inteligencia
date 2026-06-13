'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

const ExplorerMap = dynamic(() => import('./ExplorerMap'), { ssr: false, loading: () => (
  <div className="w-full h-96 bg-slate-900 rounded-xl flex items-center justify-center">
    <span className="text-slate-500 font-mono text-sm animate-pulse">CARGANDO MAPA...</span>
  </div>
)});

interface Explorer {
  id: string;
  name: string;
  country_code: string;
  message: string;
  website?: string;
  city?: string;
  founding: boolean;
  explorer_number: number;
  created_at: string;
}

const COUNTRY_COORDS: Record<string, [number, number]> = {
  ES:[40.4,-3.7],FR:[46.2,2.2],DE:[51.2,10.4],IT:[41.9,12.5],PT:[39.4,-8.2],
  GB:[51.5,-0.1],US:[37.1,-95.7],MX:[23.6,-102.5],AR:[-38.4,-63.6],BR:[-14.2,-51.9],
  JP:[36.2,138.2],CN:[35.8,104.1],AU:[-25.3,133.7],IN:[20.6,79.0],CA:[56.1,-106.3],
  MA:[31.8,-7.1],EG:[26.8,30.8],ZA:[-30.6,22.9],NG:[9.1,8.7],KE:[-0.0,37.9],
  CL:[-35.7,-71.5],CO:[4.6,-74.1],PE:[-9.2,-75.0],TH:[15.9,100.9],VN:[14.1,108.2],
  ID:[-0.8,113.9],PH:[12.9,121.8],MY:[4.2,108.0],SG:[1.4,103.8],NZ:[-40.9,174.9],
  NL:[52.1,5.3],BE:[50.5,4.5],CH:[46.8,8.2],AT:[47.5,14.6],PL:[51.9,19.1],
  SE:[60.1,18.6],NO:[60.5,8.5],DK:[56.3,9.5],FI:[61.9,25.7],GR:[39.1,21.8],
  TR:[38.9,35.2],SA:[23.9,45.1],AE:[23.4,53.8],IL:[31.0,34.8],RU:[61.5,105.3],
  UA:[48.4,31.2],RO:[45.9,24.9],CZ:[49.8,15.5],HU:[47.2,19.5],HR:[45.1,15.2],
};

export default function EarlyExplorersClient() {
  const [explorers, setExplorers] = useState<Explorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', country_code: '', city: '', message: '', website: '', consent: false });
  const [error, setError] = useState('');

  useEffect(() => {
    loadExplorers();
  }, []);

  async function loadExplorers() {
    const { data } = await supabase
      .from('explorers')
      .select('*')
      .order('explorer_number', { ascending: true });
    if (data) setExplorers(data);
    setLoading(false);
  }

  async function handleSubmit() {
    setError('');
    if (!form.consent) {
      setError('Debes aceptar el consentimiento para continuar.');
      return;
    }
    if (!form.name.trim() || !form.country_code.trim()) {
      setError('Nombre y país son obligatorios.');
      return;
    }
    if (form.message.length > 120) {
      setError('El mensaje no puede superar 120 caracteres.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from('explorers').insert([{
      name: form.name.trim(),
      country_code: form.country_code.toUpperCase().trim(),
      message: form.message.trim() || 'Smart travelers make better decisions.',
      website: form.website.trim() || null,
      city: form.city.trim() || null,
    }]);
    if (err) {
      setError('Error al unirte. Inténtalo de nuevo.');
    } else {
      setSubmitted(true);
      setShowForm(false);
      await loadExplorers();
    }
    setSubmitting(false);
  }

  const foundingCount = explorers.filter(e => e.founding).length;
  const spotsLeft = Math.max(0, 100 - foundingCount);
  const [resolvedCoords, setResolvedCoords] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    async function geocodeExplorers() {
      const updates: Record<string, [number, number]> = {};
      for (const e of explorers) {
        if (e.city) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(e.city)}&countrycodes=${e.country_code.toLowerCase()}&format=json&limit=1`,
              { headers: { 'User-Agent': 'viajeinteligencia.com' } }
            );
            const data = await res.json();
            if (data[0]) updates[e.id] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          } catch {}
        }
      }
      setResolvedCoords(updates);
    }
    if (explorers.length > 0) geocodeExplorers();
  }, [explorers]);

  const mapExplorers = explorers
    .filter(e => resolvedCoords[e.id] || COUNTRY_COORDS[e.country_code])
    .map(e => ({
      ...e,
      coords: resolvedCoords[e.id] ?? COUNTRY_COORDS[e.country_code],
    }));

  function handleShare(explorerNumber?: number) {
    const url = 'https://viajeinteligencia.com/early-explorers';
    const text = explorerNumber
      ? `Soy el Explorer #${String(explorerNumber).padStart(3,'0')} en Viaje Inteligencia 🌍 ¿Te unes al mapa?`
      : `Descubre el mapa de Early Explorers de Viaje Inteligencia 🌍`;
    if (navigator.share) {
      navigator.share({ title: 'Early Explorers – Viaje Inteligencia', text, url }).catch(() => {});
    } else {
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100">
      {/* Hero */}
      <div className="border-b border-white/5 px-6 py-12 text-center max-w-3xl mx-auto">
        <div className="font-mono text-xs text-emerald-400 tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
          <span className="w-8 h-px bg-emerald-400/40 block"/>
          global travel intelligence wall
          <span className="w-8 h-px bg-emerald-400/40 block"/>
        </div>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          Early <span className="text-emerald-400">Explorers</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-6">
          Los primeros 100 viajeros que apostaron por la inteligencia de viaje.<br/>
          Su marca en la historia del proyecto.
        </p>

        {/* Spots counter */}
        <div className="inline-flex items-center gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-6 py-3 mb-4">
          <div className="text-center">
            <div className="font-mono text-2xl text-emerald-400 font-bold">{foundingCount}</div>
            <div className="font-mono text-xs text-slate-500 tracking-widest">UNIDOS</div>
          </div>
          <div className="w-px h-10 bg-white/10"/>
          <div className="text-center">
            <div className="font-mono text-2xl text-amber-400 font-bold">{spotsLeft}</div>
            <div className="font-mono text-xs text-slate-500 tracking-widest">RESTANTES</div>
          </div>
          <div className="w-px h-10 bg-white/10"/>
          <div className="text-center">
            <div className="font-mono text-2xl text-slate-300 font-bold">100</div>
            <div className="font-mono text-xs text-slate-500 tracking-widest">FOUNDING</div>
          </div>
        </div>

        {/* Share link */}
        <div className="mb-6">
          <button
            onClick={() => handleShare()}
            className="text-xs font-mono text-slate-500 hover:text-emerald-400 transition underline underline-offset-4"
          >
            ↗ Compartir esta página
          </button>
        </div>

        {!submitted ? (
          !showForm ? (
            <div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-emerald-400 text-slate-900 font-mono font-bold text-sm tracking-widest uppercase px-8 py-3 rounded-lg hover:opacity-90 transition shadow-lg shadow-emerald-400/20"
              >
                {spotsLeft > 0 ? `RECLAMAR SPOT #${foundingCount + 1} →` : 'UNIRME AL MAPA →'}
              </button>
              {spotsLeft <= 10 && spotsLeft > 0 && (
                <p className="text-amber-400 font-mono text-xs mt-3 animate-pulse">
                  ⚠ Solo quedan {spotsLeft} spots founding
                </p>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-white/8 rounded-xl p-6 text-left max-w-md mx-auto mt-4">
              <h3 className="font-mono text-xs text-emerald-400 tracking-widest uppercase mb-4">Tu información</h3>
              <div className="space-y-3">
                <input
                  className="w-full bg-slate-800 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  placeholder="Tu nombre *"
                  value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  maxLength={50}
                />
                <input
                  className="w-full bg-slate-800 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 uppercase"
                  placeholder="País ISO (ej: ES, FR, JP) *"
                  value={form.country_code}
                  onChange={e => setForm(f => ({...f, country_code: e.target.value.toUpperCase().replace(/[^A-Z]/g,'')}))}
                  maxLength={2}
                />
                <input
                  className="w-full bg-slate-800 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  placeholder="Tu ciudad (opcional, mejora precisión del mapa)"
                  value={form.city}
                  onChange={e => setForm(f => ({...f, city: e.target.value}))}
                  maxLength={60}
                />
                <textarea
                  className="w-full bg-slate-800 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 resize-none"
                  placeholder="Tu mensaje (120 chars max)"
                  rows={2}
                  value={form.message}
                  onChange={e => setForm(f => ({...f, message: e.target.value}))}
                  maxLength={120}
                />
                <input
                  className="w-full bg-slate-800 border border-white/8 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  placeholder="Tu web (opcional)"
                  value={form.website}
                  onChange={e => setForm(f => ({...f, website: e.target.value}))}
                />
                {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={e => setForm(f => ({...f, consent: e.target.checked}))}
                    className="mt-1 accent-emerald-400"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Acepto que mi nombre y ubicación aparezcan públicamente en el mapa. Puedo solicitar mi baja en cualquier momento escribiendo a <a href="mailto:gestion@viajeinteligencia.com" className="text-emerald-400">gestion@viajeinteligencia.com</a>. Ver <a href="/legal" className="text-emerald-400">política de privacidad</a>.
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-emerald-400 text-slate-900 font-mono font-bold text-sm tracking-widest uppercase py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 transition"
                  >
                    {submitting ? 'PROCESANDO...' : 'DEJAR MI MARCA →'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-6 max-w-md mx-auto">
            <div className="text-3xl mb-2">🌍</div>
            <p className="text-emerald-400 font-mono font-bold text-sm tracking-widest uppercase">¡Estás en el mapa!</p>
            <p className="text-slate-400 text-sm mt-2 mb-4">Tu marca forma parte de la historia del proyecto.</p>
            <button
              onClick={() => handleShare(foundingCount)}
              className="inline-flex items-center gap-2 bg-slate-800 border border-white/10 text-slate-300 text-sm font-mono px-5 py-2 rounded-lg hover:border-emerald-400/40 hover:text-emerald-400 transition"
            >
              ↗ COMPARTIR MI SPOT
            </button>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="font-mono text-xs text-slate-500 tracking-widest uppercase mb-3">mapa de explorers</div>
        <ExplorerMap explorers={mapExplorers} />
      </div>

      {/* Grid de explorers */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="font-mono text-xs text-slate-500 tracking-widest uppercase mb-4">
          {loading ? 'CARGANDO...' : `${explorers.length} explorers`}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {explorers.map(e => (
            <div
              key={e.id}
              className={`bg-slate-900 border rounded-xl p-3 transition hover:border-emerald-400/40 ${e.founding ? 'border-emerald-400/20' : 'border-white/5'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{getFlagEmoji(e.country_code)}</span>
                <span className="font-mono text-xs text-emerald-400">#{String(e.explorer_number).padStart(3,'0')}</span>
              </div>
              <div className="font-semibold text-sm text-white truncate">{e.name}</div>
              <div className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">{e.message}</div>
              {e.website && (
                <a href={e.website} target="_blank" rel="noopener noreferrer"
                  className="text-emerald-400/70 text-xs font-mono mt-1 block truncate hover:text-emerald-400 transition">
                  {e.website.replace(/^https?:\/\//,'')}
                </a>
              )}
              {e.founding && (
                <span className="inline-block mt-2 font-mono text-xs bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full">
                  founding
                </span>
              )}
            </div>
          ))}
          {/* Slots vacíos */}
          {Array.from({length: Math.max(0, 100 - explorers.length)}).slice(0,20).map((_,i) => (
            <div key={`empty-${i}`} className="bg-slate-900/40 border border-white/3 rounded-xl p-3 flex items-center justify-center min-h-[80px]">
              <span className="font-mono text-xs text-slate-700">#{String(explorers.length + i + 1).padStart(3,'0')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div className="border-t border-white/5 px-6 py-8 text-center">
        <p className="text-slate-500 text-sm mb-4">¿Quieres más que solo estar en el mapa?</p>
        <a href="/free-trial" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition">
          7 días Premium gratis →
        </a>
      </div>
    </div>
  );
}

function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  ).join('');
}
