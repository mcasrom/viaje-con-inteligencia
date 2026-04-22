'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Sparkles, Loader2, Send, Plane } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTodosLosPaises } from '@/data/paises';
import { supabase } from '@/lib/supabase';

const paises = getTodosLosPaises();

const interestsList = [
  'Historia', 'Cultura', 'Gastronomía', 'Playas', 'Montaña',
  'Aventura', 'Arte', 'Vida nocturna', 'Naturaleza', 'Compras'
];

const budgetOptions = [
  { value: 'low', label: 'Económico (<50€/día)' },
  { value: 'moderate', label: 'Moderado (50-150€/día)' },
  { value: 'high', label: 'Alto (>150€/día)' },
];

export default function NuevoViajePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState('moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itinerary, setItinerary] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0) setDays(diff);
    }
  }, [startDate, endDate]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerateItinerary = async () => {
    if (!destination) {
      setError('Selecciona un destino');
      return;
    }

    setItineraryLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days,
          interests: selectedInterests,
        }),
      });

      const data = await res.json();
      setItinerary(data.itinerary || data.error || 'Error al generar');
    } catch {
      setItinerary('Error de conexión');
    } finally {
      setItineraryLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !name || !destination) {
      setError('Completa los campos requeridos');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error: err } = await supabase.from('trips').insert([{
        user_id: user.id,
        name,
        destination,
        country_code: countryCode,
        start_date: startDate || null,
        end_date: endDate || null,
        days,
        budget,
        interests: selectedInterests,
        itinerary_raw: itinerary || null,
        status: 'draft',
      }]);

      if (err) throw err;
      router.push('/viajes');
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/viajes" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a Mis Viajes</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <Plane className="w-10 h-10 mx-auto text-blue-500 mb-2" />
          <h1 className="text-2xl font-bold text-white">Nuevo Viaje Personalizado</h1>
          <p className="text-slate-400 mt-1">Paso {step} de 3</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s <= step ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-white font-medium mb-2">Nombre del viaje</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: escapada a Lisboa"
                  className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Destino
                </label>
                <select
                  value={destination}
                  onChange={e => {
                    setDestination(e.target.value);
                    const pais = paises.find(p => p.nombre === e.target.value);
                    setCountryCode(pais?.codigo || '');
                  }}
                  className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecciona un país...</option>
                  {paises.map(p => (
                    <option key={p.codigo} value={p.nombre}>
                      {p.nombre} ({p.capital})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Fecha inicio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Fecha fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-white font-medium mb-2">
                  <DollarSign className="inline w-4 h-4 mr-2" />
                  Presupuesto diario
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {budgetOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBudget(opt.value)}
                      className={`px-4 py-3 rounded-xl border transition-colors ${
                        budget === opt.value
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Intereses</label>
                <div className="flex flex-wrap gap-2">
                  {interestsList.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedInterests.includes(interest)
                          ? 'bg-yellow-500 text-slate-900 font-medium'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Días: {days}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={days}
                  onChange={e => setDays(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-slate-500 text-sm mt-1">
                  <span>1 día</span>
                  <span>30 días</span>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-white font-medium mb-2">
                  <Sparkles className="inline w-4 h-4 mr-2" />
                  Itinerario IA (opcional)
                </label>
                <button
                  onClick={handleGenerateItinerary}
                  disabled={itineraryLoading || !destination}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {itineraryLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generar con IA
                    </>
                  )}
                </button>
              </div>

              {itineraryLoading && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                  <p className="text-slate-400 mt-2">Creando tu itinerario personalizado...</p>
                </div>
              )}

              {itinerary && (
                <div className="bg-slate-700 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <pre className="text-slate-300 whitespace-pre-wrap text-sm">{itinerary}</pre>
                </div>
              )}

              <div className="pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Resumen:</p>
                <div className="text-white space-y-1">
                  <p><strong>{name || 'Sin nombre'}</strong> - {destination || 'Sin destino'}</p>
                  <p className="text-slate-400">{days} días · {budgetOptions.find(b => b.value === budget)?.label}</p>
                  {selectedInterests.length > 0 && (
                    <p className="text-slate-400">{selectedInterests.join(', ')}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-colors"
              >
                ← Atrás
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && (!name || !destination)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || !name || !destination}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plane className="w-5 h-5" />
                    Crear Viaje
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}