'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface TripStarRatingProps {
  tripId: string;
}

export default function TripStarRating({ tripId }: TripStarRatingProps) {
  const [avg, setAvg] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trip-ratings?tripId=${tripId}`)
      .then(r => r.json())
      .then(d => {
        setAvg(d.avg || 0);
        setCount(d.count || 0);
        setUserRating(d.userRating);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tripId]);

  const submitRating = async (rating: number) => {
    const res = await fetch('/api/trip-ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId, rating }),
    });
    if (res.ok) {
      setUserRating(rating);
      fetch(`/api/trip-ratings?tripId=${tripId}`)
        .then(r => r.json())
        .then(d => { setAvg(d.avg || 0); setCount(d.count || 0); });
    } else if (res.status === 401) {
      window.location.href = '/dashboard';
    }
  };

  if (loading) return <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 text-slate-700" />)}</div>;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const star = i + 1;
          const filled = (hover || userRating || avg) >= star;
          return (
            <button
              key={i}
              type="button"
              onClick={() => submitRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="cursor-pointer transition-transform hover:scale-110"
              title={`${star} estrella${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-5 h-5 ${filled ? 'text-amber-400' : 'text-slate-600'} transition-colors`}
                fill={filled ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      {count > 0 && (
        <span className="text-xs text-slate-400">
          {avg.toFixed(1)} ({count} {count === 1 ? 'valoración' : 'valoraciones'})
        </span>
      )}
      {!userRating && count === 0 && (
        <span className="text-xs text-slate-500">Sé el primero en valorar</span>
      )}
    </div>
  );
}
