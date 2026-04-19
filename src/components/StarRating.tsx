'use client';

import { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';

interface RatingProps {
  initialRating?: number;
  readonly?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ initialRating = 0, readonly = false, onRate, size = 'md' }: RatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const sizes = {
    sm: 14,
    md: 20,
    lg: 28,
  };

  const handleRate = async (value: number) => {
    if (readonly) return;
    setRating(value);
    onRate?.(value);
    
    if (onRate) {
      setSubmitting(true);
      try {
        await fetch('/api/posts/rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: value }),
        });
      } catch (e) {
        console.error('Error submitting rating:', e);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform p-0.5`}
          onClick={() => handleRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            size={sizes[size]}
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

export function RatingDisplay({ rating }: { rating: number }) {
  return <StarRating initialRating={rating} readonly size="sm" />;
}