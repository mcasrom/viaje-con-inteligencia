'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Quote, Star, MessageSquare, Users, Globe, TrendingUp, CheckCircle, Send, X, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { getTodosLosPaises } from '@/data/paises';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  country?: string;
  verified?: boolean;
  image_url?: string;
}

const socialProofStats = [
  { icon: <Globe className="w-5 h-5" />, value: '106', label: 'Países analizados', color: 'text-blue-400' },
  { icon: <Users className="w-5 h-5" />, value: '2.400+', label: 'Viajeros activos', color: 'text-green-400' },
  { icon: <Star className="w-5 h-5" />, value: '4.8', label: 'Valoración media', color: 'text-yellow-400' },
  { icon: <TrendingUp className="w-5 h-5" />, value: '365', label: 'Días de alertas', color: 'text-purple-400' },
];

const ALL_COUNTRIES = getTodosLosPaises()
  .map(p => ({ code: p.codigo, name: p.nombre }))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author || !formData.rating || !formData.comment) return;

    setSubmitting(true);
    let imageUrl: string | null = null;

    try {
      if (selectedImage) {
        setUploading(true);
        const uploadForm = new FormData();
        uploadForm.append('image', selectedImage);

        const uploadRes = await fetch('/api/reviews/upload', {
          method: 'POST',
          body: uploadForm,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.imageUrl;
        }
        setUploading(false);
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: formData.country || null,
          author: formData.author.trim(),
          rating: formData.rating,
          comment: formData.comment.trim(),
          image_url: imageUrl || null,
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
        setSelectedImage(null);
        setImagePreview(null);
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
                <div key={review.id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                  {review.image_url && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={review.image_url}
                        alt={`Foto de ${review.author}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-800/60 to-transparent" />
                    </div>
                  )}
                  <div className={`flex items-start justify-between ${review.image_url ? 'p-4 pt-2' : 'p-6'}`}>
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

                  <div className={`relative ${review.image_url ? 'px-4 pb-4' : ''}`}>
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
                      {ALL_COUNTRIES.map(c => (
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

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Foto (opcional)</label>
                    {imagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-600">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors"
                      >
                        <ImagePlus className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">Arrastra una imagen o haz clic para seleccionar</p>
                        <p className="text-slate-500 text-xs mt-1">JPG, PNG o WebP · Máx 5MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || uploading || !formData.author || !formData.rating || !formData.comment}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Subiendo imagen...
                      </>
                    ) : submitting ? (
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
