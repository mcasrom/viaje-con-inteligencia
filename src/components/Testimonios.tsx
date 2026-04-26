'use client';

import { useState, useEffect } from 'react';
import { Quote, Star, MessageSquare } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      const allReviews: ReviewItem[] = data.reviews || [];
      setReviews([...allReviews].sort(() => Math.random() - 0.5).slice(0, 6));
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-slate-800/50 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700 animate-pulse h-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="bg-slate-800/50 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Sé el primero en compartir tu experiencia</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-800/50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Experiencias de viajeros</h2>
            <p className="text-slate-400 text-sm">Reseñas verificadas de usuarios reales</p>
          </div>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
            {reviews.length} reseñas
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{review.author}</p>
                    <p className="text-slate-500 text-xs">
                      {review.country || 'Viajero'} · {new Date(review.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} size={12} className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
                  ))}
                </div>
              </div>
              <Quote className="w-4 h-4 text-blue-500/50 mb-1" />
              <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
