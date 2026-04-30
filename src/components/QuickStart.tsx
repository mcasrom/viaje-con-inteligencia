'use client';
import { useState } from 'react';
import { MapPin, Calendar, Sparkles, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const POPULAR_DESTINATIONS = [
  { code: 'es', name: 'España', emoji: '🇪🇸' },
  { code: 'fr', name: 'Francia', emoji: '🇫🇷' },
  { code: 'it', name: 'Italia', emoji: '🇮🇹' },
  { code: 'pt', name: 'Portugal', emoji: '🇵🇹' },
  { code: 'jp', name: 'Japón', emoji: '🇯🇵' },
  { code: 'mx', name: 'México', emoji: '🇲🇽' },
  { code: 'us', name: 'EEUU', emoji: '🇺🇸' },
  { code: 'gb', name: 'Reino Unido', emoji: '🇬🇧' },
  { code: 'gr', name: 'Grecia', emoji: '🇬🇷' },
  { code: 'th', name: 'Tailandia', emoji: '🇹🇭' },
  { code: 'ma', name: 'Marruecos', emoji: '🇲🇦' },
  { code: 'ar', name: 'Argentina', emoji: '🇦🇷' },
];

export default function QuickStart() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [interest, setInterest] = useState('');

  const handleStart = () => {
    const params = new URLSearchParams();
    if (destination) params.set('destino', destination);
    if (dates) params.set('fechas', dates);
    if (interest) params.set('interes', interest);
    router.push(`/destinos?${params.toString()}`);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 group"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-sm">Planifica con IA</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
      <div
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Quick Start IA</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-4">Tu itinerario personalizado en 30 segundos</p>

        {/* Step 1: Destino */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            ¿A dónde quieres ir?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {POPULAR_DESTINATIONS.map((d) => (
              <button
                key={d.code}
                onClick={() => setDestination(d.code)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  destination === d.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span className="text-lg">{d.emoji}</span>
                <span className="block mt-1">{d.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Fechas */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            ¿Cuándo? (opcional)
          </label>
          <input
            type="month"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Step 3: Interés */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            ¿Qué te interesa?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'playa', emoji: '🏖️', label: 'Playa' },
              { id: 'cultural', emoji: '🏛️', label: 'Cultura' },
              { id: 'naturaleza', emoji: '🏔️', label: 'Naturaleza' },
              { id: 'gastronomia', emoji: '🍽️', label: 'Gastro' },
              { id: 'vino', emoji: '🍷', label: 'Vino' },
              { id: 'aventura', emoji: '🧗', label: 'Aventura' },
            ].map((i) => (
              <button
                key={i.id}
                onClick={() => setInterest(i.id)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  interest === i.id
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span className="text-lg">{i.emoji}</span>
                <span className="block mt-1">{i.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-500/25"
        >
          <span>Generar Itinerario</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
