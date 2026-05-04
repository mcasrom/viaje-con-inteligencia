'use client';

import { useState, useEffect, useRef } from 'react';
import { Quote, Star, MessageSquare, Users, Globe, TrendingUp, CheckCircle, Send, X, Loader2 } from 'lucide-react';

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

const POPULAR_COUNTRIES = [
  { code: 'ES', name: 'España' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'JP', name: 'Japón' },
  { code: 'MA', name: 'Marruecos' },
  { code: 'MX', name: 'México' },
  { code: 'CO', name: 'Colombia' },
  { code: 'AR', name: 'Argentina' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'DE', name: 'Alemania' },
];

function StarSelector({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            size={24}
            className={
              star <= (hover || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-600'
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function Testimonios() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ author: '', rating: 0, comment: '', country: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowForm(false);
    };
    if (showForm) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [showForm]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author || !formData.rating || !formData.comment) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: formData.country || null,
          author: formData.author.trim(),
          rating: formData.rating,
          comment: formData.comment.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newReview: ReviewItem = {
          ...data.review,
          date: data.review.created_at,
          verified: false,
        };
        setReviews(prev => [newReview, ...prev]);
        setSubmitted(true);
        setFormData({ author: '', rating: 0, comment: '', country: '' });
        setTimeout(() => {
          setSubmitted(false);
          setShowForm(false);
        }, 2000);
      }
    } catch (e) {
      console.error('Error submitting review:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowForm(false);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {socialProofStats.map((stat, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
              <div className={`${stat.color} flex justify-center mb-2`}>{stat.icon}</div>
              <div className="text-white font-bold text-2xl">{stat.value}</div>
              <div className="text-slate-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

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

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-slate-400 text-lg mb-4">Sé el primero en compartir tu experiencia</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              Escribir Reseña
            </button>
          </div>
        ) : (
          <>
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

            <div className="flex items-center justify-center gap-4 mt-10">
              {reviews.length > 3 && (
                <div className="flex items-center gap-2">
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
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium transition-all"
              >
                <Send className="w-4 h-4" />
                Escribir Reseña
              </button>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div ref={modalRef} className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Comparte tu experiencia</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-green-400 font-bold text-lg">¡Gracias por tu reseña!</p>
                  <p className="text-slate-400 text-sm mt-2">Tu opinión ayuda a otros viajeros</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Tu nombre</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Ej: María García"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">País que visitaste</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option value="">Selecciona un país (opcional)</option>
                      {POPULAR_COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Tu valoración</label>
                    <StarSelector
                      rating={formData.rating}
                      onChange={(r) => setFormData({ ...formData, rating: r })}
                    />
                    {formData.rating === 0 && (
                      <p className="text-slate-500 text-xs mt-1">Selecciona de 1 a 5 estrellas</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Tu experiencia</label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="¿Qué te pareció el viaje? ¿Algún consejo para otros viajeros?"
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !formData.author || !formData.rating || !formData.comment}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Publicar Reseña
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
