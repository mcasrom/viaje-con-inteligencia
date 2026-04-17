'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonios = [
  {
    id: 1,
    name: 'María González',
    avatar: 'MG',
    country: 'Japón',
    flag: '🇯🇵',
    rating: 5,
    text: 'Viajamos a Tokio con mi familia y gracias a Viaje con Inteligencia supimos qué zonas eran seguras y qué precauciones tomar. El checklist de viaje fue fundamental.',
    role: 'Viajera frecuente',
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    avatar: 'CR',
    country: 'Australia',
    flag: '🇦🇺',
    rating: 5,
    text: 'El bot de Telegram me salvó cuando tuve problemas en el aeropuerto de Sídney. Pude contactar rápidamente con la embajada española. Excelente servicio.',
    role: 'Viajero de negocios',
  },
  {
    id: 3,
    name: 'Ana Martínez',
    avatar: 'AM',
    country: 'Portugal',
    flag: '🇵🇹',
    rating: 5,
    text: 'La información sobre requisitos de visado y seguros de viaje me ahorró mucho tiempo. Todo estaba actualizado y fue muy fácil de consultar.',
    role: 'Primera vez viajando al extranjero',
  },
  {
    id: 4,
    name: 'Pedro Sánchez',
    avatar: 'PS',
    country: 'Marruecos',
    flag: '🇲🇦',
    rating: 4,
    text: 'Muy útil para planificar mi viaje a Marrakech. Los consejos sobre qué hacer y qué no hacer fueron muy prácticos y me ayudaron a respetar la cultura local.',
    role: 'Viajero solitario',
  },
  {
    id: 5,
    name: 'Laura Fernández',
    avatar: 'LF',
    country: 'Italia',
    flag: '🇮🇹',
    rating: 5,
    text: 'El mapa de riesgos me dio tranquilidad para viajar a Roma con los niños. Saber de antemano las zonas a evitar hizo que disfrutáramos mucho más.',
    role: 'Madre de familia',
  },
];

export default function Testimonios() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonios.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonios.length) % testimonios.length);

  return (
    <section className="bg-slate-800/50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            Lo que dicen nuestros viajeros
          </h2>
          <p className="text-slate-300 text-lg">
            Miles de viajeros confían en Viaje con Inteligencia para viajar seguros
          </p>
        </div>

        <div className="relative">
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 min-h-[280px] flex flex-col justify-center">
            <Quote className="w-10 h-10 text-blue-500 mb-4" />
            
            <div className="text-center">
              <p className="text-xl text-slate-200 mb-6 leading-relaxed">
                "{testimonios[current].text}"
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < testimonios[current].rating ? 'text-yellow-400' : 'text-slate-600'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonios[current].avatar}
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">{testimonios[current].name}</p>
                  <p className="text-slate-400 text-sm">
                    {testimonios[current].flag} {testimonios[current].country} • {testimonios[current].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-2">
              {testimonios.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === current ? 'bg-blue-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={next}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
