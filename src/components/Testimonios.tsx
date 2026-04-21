'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, MessageSquare } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  country?: string;
}

export default function Testimonios() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      const allReviews: ReviewItem[] = data.reviews || [];
      const shuffled = [...allReviews].sort(() => Math.random() - 0.5).slice(0, 10);
      setReviews(shuffled);
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-slate-800/50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="bg-slate-800/50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Comparte tu experiencia
            </h2>
            <p className="text-slate-300 text-lg">
              Tu opinión ayuda a otros viajeros a viajar más seguros
            </p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-slate-300">
              Sé el primero en compartir tu experiencia de viaje
            </p>
          </div>
        </div>
      </section>
    );
  }

  const next = () => setCurrent((prev) => (prev + 1) % reviews.length);
  const prev = () => setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <section className="bg-slate-800/50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            Experiencias compartidas por viajeros reales
          </h2>
          <p className="text-slate-300 text-lg">
            Reseñas verificadas de viajeros que ya han usado Viaje con Inteligencia
          </p>
        </div>

        <div className="relative">
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 min-h-[280px] flex flex-col justify-center">
            <Quote className="w-10 h-10 text-blue-500 mb-4" />
            
            <div className="text-center">
              <p className="text-xl text-slate-200 mb-6 leading-relaxed">
                {reviews[current].comment.length > 200 
                  ? reviews[current].comment.slice(0, 200) + '...' 
                  : reviews[current].comment}
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={
                      star <= reviews[current].rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-600'
                    }
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {reviews[current].author.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">{reviews[current].author}</p>
                  <p className="text-slate-400 text-sm">
                    {reviews[current].country || 'Viajero verificado'} • {new Date(reviews[current].date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
              disabled={reviews.length <= 1}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
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
              disabled={reviews.length <= 1}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}