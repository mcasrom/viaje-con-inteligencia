'use client';

import { useState, useEffect } from 'react';
import { Quote, Star, MessageSquare, Users, Globe, TrendingUp, CheckCircle } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  country?: string;
  verified?: boolean;
}

const socialProofStats = [
  { icon: <Globe className="w-5 h-5" />, value: '106', label: 'Países analizados', color: 'text-blue-400' },
  { icon: <Users className="w-5 h-5" />, value: '2.400+', label: 'Viajeros activos', color: 'text-green-400' },
  { icon: <Star className="w-5 h-5" />, value: '4.8', label: 'Valoración media', color: 'text-yellow-400' },
  { icon: <TrendingUp className="w-5 h-5" />, value: '365', label: 'Días de alertas', color: 'text-purple-400' },
];

export default function Testimonios() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length > 3) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 3) % reviews.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      const allReviews: ReviewItem[] = data.reviews || [];
      setReviews([...allReviews].sort(() => Math.random() - 0.5));
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-pulse h-48" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayReviews = reviews.slice(currentIndex, currentIndex + 3);

  return (
    <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {socialProofStats.map((stat, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
              <div className={`${stat.color} flex justify-center mb-2`}>{stat.icon}</div>
              <div className="text-white font-bold text-2xl">{stat.value}</div>
              <div className="text-slate-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium mb-3">
            <CheckCircle className="w-3 h-3" />
            Reseñas verificadas
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Lo que dicen nuestros viajeros</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Miles de viajeros confían en Viaje con Inteligencia para planificar sus viajes seguros
          </p>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-slate-400 text-lg mb-2">Sé el primero en compartir tu experiencia</p>
            <p className="text-slate-500 text-sm">Tu opinión ayuda a otros viajeros</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {displayReviews.map((review) => (
              <div key={review.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {review.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-semibold">{review.author}</p>
                        {review.verified && (
                          <span className="text-green-400" title="Viaje verificado">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs">
                        {review.country ? `Viajó a ${review.country.toUpperCase()}` : 'Viajero'} · {new Date(review.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={14} className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Quote className="w-5 h-5 text-purple-500/30 absolute -top-1 -left-1" />
                  <p className="text-slate-300 text-sm leading-relaxed pl-4 line-clamp-4">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show more indicator */}
        {reviews.length > 3 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 3)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / 3) === i ? 'bg-purple-500 w-6' : 'bg-slate-600'
                }`}
              />
            ))}
            <span className="text-slate-500 text-xs ml-2">{reviews.length} reseñas</span>
          </div>
        )}
      </div>
    </section>
  );
}
