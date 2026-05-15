'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, MessageSquare, Send, User, ImagePlus, Trash2, Loader2 } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  image_url?: string;
}

interface ReviewsProps {
  countryCode: string;
  countryName: string;
}

function StarRating({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          <Star
            size={interactive ? 24 : 16}
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

export default function Reviews({ countryCode, countryName }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ author: '', rating: 0, comment: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReviews();
  }, [countryCode]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?country=${countryCode}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating);
    } catch (error) {
      console.error('Error fetching reviews:', error);
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
          country: countryCode,
          ...formData,
          image_url: imageUrl || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(prev => [data.review, ...prev]);
        setSubmitted(true);
        setFormData({ author: '', rating: 0, comment: '' });
        setSelectedImage(null);
        setImagePreview(null);
        setTimeout(() => {
          setSubmitted(false);
          setShowForm(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Reviews de Viajeros</h3>
          {averageRating && (
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-bold">{averageRating}</span>
              <span className="text-slate-400 text-sm">({reviews.length})</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {showForm ? 'Cancelar' : 'Escribir Review'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-700 rounded-lg p-4 mb-6">
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-green-400 font-medium">¡Gracias por tu review! ✅</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-1">Tu nombre</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Tu rating</label>
                <StarRating
                  rating={formData.rating}
                  interactive
                  onChange={(r) => setFormData({ ...formData, rating: r })}
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Tu experiencia en {countryName}</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Comparte tu experiencia..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-1">Foto (opcional)</label>
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-500">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 p-2 bg-red-600/90 hover:bg-red-500 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Eliminar foto"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-500 hover:border-blue-500 rounded-lg p-4 text-center cursor-pointer transition-colors"
                  >
                    <ImagePlus className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                    <p className="text-slate-400 text-xs">Arrastra una imagen o haz clic</p>
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
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo imagen...
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publicar Review
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-400">Cargando reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">Aún no hay reviews para {countryName}</p>
          <p className="text-slate-500 text-sm">¡Sé el primero en compartir tu experiencia!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className="bg-slate-700/50 rounded-lg overflow-hidden">
              {review.image_url && (
                <img
                  src={review.image_url}
                  alt={`Foto de ${review.author}`}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{review.author}</p>
                      <p className="text-slate-400 text-xs">{review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-slate-300">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
