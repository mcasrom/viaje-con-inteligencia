'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface DataRatingProps {
  entityType: string;
  entityId: string;
  size?: 'sm' | 'md';
  showCount?: boolean;
  showLabel?: boolean;
}

export default function DataRating({ entityType, entityId, size = 'sm', showCount = true, showLabel = true }: DataRatingProps) {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    fetch(`/api/data-ratings?type=${entityType}&id=${entityId}`)
      .then(r => r.json())
      .then(d => {
        setRating(d.average || 0);
        setCount(d.count || 0);
      })
      .catch(() => {});
  }, [entityType, entityId]);

  const handleRate = async (value: number) => {
    if (rated) return;
    await fetch('/api/data-ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, rating: value }),
    });
    setRating(value);
    setCount(prev => prev + 1);
    setRated(true);
  };

  const starSize = size === 'sm' ? 14 : 18;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={rated}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !rated && setHover(star)}
            onMouseLeave={() => !rated && setHover(0)}
            className={`transition-transform ${rated ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              size={starSize}
              className={star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
            />
          </button>
        ))}
      </div>
      {showCount && count > 0 && (
        <span className="text-slate-500 text-xs">
          {rating.toFixed(1)} ({count})
        </span>
      )}
      {showLabel && rated && (
        <span className="text-green-400 text-xs">✓ Gracias</span>
      )}
    </div>
  );
}
