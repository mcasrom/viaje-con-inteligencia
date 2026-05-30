'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  initialRating?: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

export default function StarRating({ initialRating = 0, onRate, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = (hover || initialRating) >= i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onRate?.(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className={`${onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`${sizeMap[size]} ${filled ? 'text-amber-400' : 'text-slate-600'} transition-colors`}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
