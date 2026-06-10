'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Sparkles, Loader2, Shield, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRequirePremium } from '@/hooks/useRequirePremium';

const REGIONES = [
  'Andalucia','Aragon','Asturias','Baleares','Canarias',
  'Cantabria','Castilla-La Mancha','Castilla y Leon','Cataluna',
  'Extremadura','Galicia','La Rioja','Madrid','Murcia',
  'Navarra','Pais Vasco','Valencia','Camino de Santiago',
  'Costa del Sol','Picos de Europa','Sierra Nevada','Costa Brava',
];

const interestsList = [
  'Historia','Cultura','Gastronomia','Playas','Montana',
  'Aventura','Arte','Naturaleza','Senderismo','Enoturismo',
  'Patrimonio UNESCO','Pueblos blancos','Flamenco','Arquitectura',
];

const budgetOptions = [
  { value: 'low', label: 'Economico (<50/dia)' },
  { value: 'moderate', label: 'Moderado (50-150/dia)' },
  { value: 'high', label: 'Alto (>150/dia)' },
];

const travelerProfiles = [
  { value: 'mochilero', label: 'Mochilero', icon: '🎒' },
  { value: 'familiar', label: 'Familiar', icon: '👨‍👩‍👧' },
  { value: 'solo', label: 'Solo', icon: '🧳' },
  { value: 'pareja', label: 'Pareja', icon: '💑' },
  { value: 'lujo', label: 'Lujo', icon: '✨' },
];

export default function ItinerariosEspanaClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { isPremium, loading: premiumLoading } = useRequirePremium();
  const [region, setRegion] = useState('');
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState('moderate');
  const [travelerProfile, setTravelerProfile] = useState('pareja');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (premiumLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!isPremium) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Itinerarios España con IA</h2>
        <p className="text-slate-400 mb-6">Genera tu itinerario personalizado por España con analisis de seguridad, mejor epoca y coste real.</p>
        <Link href="/free-trial" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">
          Probar gratis 7 dias
        </Link>
      </div>
    </div>
  );

  const toggleInterest = (i: string) => setSelectedInterests(prev =>
    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!region) { setError('Selecciona una region'); return; }
    setLoading(true); setError(''); setItinerary('');
    try {
      const res = await fetch('/api/itinerario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: region + ', España',
          days,
          interests: selectedInterests,
          budget,
          travelerProfile,
          tripTypes: ['smart traveller', 'seguridad', 'riesgo bajo'],
          maxKm: 300,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar');
      if (user) {
        const saveRes = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Itinerario ' + region,
            destination: region + ', España',
            days, budget,
            interests: selectedInterests,
            itinerary_raw: data.itinerary,
            status: 'draft',
            traveler_profile: travelerProfile,
            trip_types: ['smart traveller'],
            max_km: 300,
          }),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          router.push('/viajes/' + saved.trip.id);
          return;
        }
      }
      setItinerary(data.itinerary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/rutas" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a rutas
        </Link>
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4">
            <Shield className="w-3 h-3" /> Smart Traveller · España
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Crea tu itinerario por España</h1>
          <p className="text-slate-400">Itinerario personalizado con IA: riesgo, seguridad, mejor epoca y coste real por region.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Region o destino en España</label>
            <select value={region} onChange={e => setRegion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none">
              <option value="">Selecciona una region...</option>
              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Duracion: {days} dias</label>
            <input type="range" min={3} max={21} value={days} onChange={e => setDays(Number(e.target.value))}
              className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>3 dias</span><span>21 dias</span></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Presupuesto</label>
            <div className="grid grid-cols-3 gap-3">
              {budgetOptions.map(b => (
                <button type="button" key={b.value} onClick={() => setBudget(b.value)}
                  className={`p-3 rounded-xl border text-sm transition-all ${budget === b.value ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Perfil viajero</label>
            <div className="flex flex-wrap gap-3">
              {travelerProfiles.map(p => (
                <button type="button" key={p.value} onClick={() => setTravelerProfile(p.value)}
                  className={`px-4 py-2 rounded-xl border text-sm transition-all ${travelerProfile === p.value ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Intereses</label>
            <div className="flex flex-wrap gap-2">
              {interestsList.map(i => (
                <button type="button" key={i} onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-all ${selectedInterests.includes(i) ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Generando...</> : <><Sparkles className="w-5 h-5" />Generar itinerario con IA</>}
          </button>
        </form>
        {itinerary && (
          <div className="mt-10 bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Tu itinerario por {region}</h2>
            <div className="text-slate-300 whitespace-pre-wrap text-sm">{itinerary}</div>
          </div>
        )}
      </div>
    </div>
  );
}
