'use client';

import { useState, useEffect } from 'react';
import StarRating from '@/components/StarRating';

export default function PostRating({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/rate?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        setRating(data.average || 0);
        setCount(data.count || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRate = async (value: number) => {
    await fetch('/api/posts/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, rating: value }),
    });
    setRating(value);
    setCount(prev => prev + 1);
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-3">
      <StarRating 
        initialRating={rating} 
        onRate={handleRate}
        size="md"
      />
      {count > 0 && (
        <span className="text-slate-400 text-sm">
          ({count} valoración{count !== 1 ? 'es' : ''})
        </span>
      )}
    </div>
  );
}