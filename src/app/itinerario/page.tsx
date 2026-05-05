'use client';
import type { Metadata } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, DollarSign, Sparkles, Loader2, Send } from 'lucide-react';
import { getTodosLosPaises } from '@/data/paises';

export const metadata: Metadata = {
  title: 'Generador de Itinerarios IA | Planifica tu Viaje - Viaje con Inteligencia',
  description: 'Crea itinerarios personalizados con inteligencia artificial. Destino, días, presupuesto e intereses. Tu viaje perfecto en minutos.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/itinerario',
  },
};

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

export default function ItineraryPage() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState('moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) {
      setError('Selecciona un destino');
      return;
    }

    setLoading(true);
    setError('');
    setItinerary('');

    try {
      const res = await fetch('/api/itinerario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days,
          interests: selectedInterests,
          budget,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar');
      }
      setItinerary(data.itinerary);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            <Sparkles className="inline w-8 h-8 mr-2 text-yellow-400" />
            Generador de Itinerarios IA
          </h1>
          <p className="text-slate-400 text-lg">
            Crea tu viaje perfecto con inteligencia artificial
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-white font-medium mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              Destino
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 
                         focus:border-blue-500 focus:outline-none"
            >
              <option value="">Selecciona un país...</option>
              {paises.map(p => (
                <option key={p.codigo} value={p.nombre}>
                  {p.nombre} ({p.capital})
                </option>
              ))}
            </select>
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
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-slate-500 text-sm mt-1">
              <span>1 día</span>
              <span>30 días</span>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              <DollarSign className="inline w-4 h-4 mr-2" />
              Presupuesto
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {budgetOptions.map(opt => (
                <button
                  type="button"
                  key={opt.value}
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
                  type="button"
                  key={interest}
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium 
                       px-6 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando itinerario...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generar Itinerario con IA
              </>
            )}
          </button>
        </form>

        {itinerary && (
          <div className="mt-10 bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Tu Itinerario</h2>
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 whitespace-pre-wrap">{itinerary}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}