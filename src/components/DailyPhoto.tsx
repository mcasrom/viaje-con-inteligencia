'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const photos = [
  { src: '/photos/1.jpg', alt: 'Australia', place: 'Australia' },
  { src: '/photos/2.jpg', alt: 'Paisaje', place: 'España' },
  { src: '/photos/3.jpg', alt: 'Naturaleza', place: 'España' },
  { src: '/photos/4.jpg', alt: 'España', place: 'Europa' },
];

const MAX_PHOTOS = 4;

function getDailyPhoto(): typeof photos[0] {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return photos[dayOfYear % photos.length];
}

interface DailyPhotoProps {
  type?: 'hero' | 'card' | 'footer';
  opacity?: number;
  grayscale?: boolean;
}

export default function DailyPhoto({ 
  type = 'hero', 
  opacity = 0.5,
  grayscale = true 
}: DailyPhotoProps) {
  const [photo, setPhoto] = useState(photos[0]);
  const [enabled, setEnabled] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('dailyPhotosEnabled');
    setEnabled(saved !== 'false');
    setPhoto(getDailyPhoto());
  }, []);

  if (!isClient) return <div className="h-48 md:h-64 bg-slate-800 rounded-2xl animate-pulse" />;

  const sizes = {
    hero: '100vw',
    card: '100%',
    footer: '100%',
  };

  const heights = {
    hero: 'h-48 md:h-64',
    card: 'h-32',
    footer: 'h-20',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent z-10" />
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        unoptimized
        className={`object-cover ${grayscale ? 'grayscale-[30%]' : ''}`}
        style={{ opacity }}
        sizes={sizes[type]}
      />
      <div className="absolute bottom-2 right-2 z-20 text-xs text-slate-400/60">
        {photo.place}
      </div>
    </div>
  );
}

export function useDailyPhotoSettings() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('dailyPhotosEnabled');
    setEnabled(saved !== 'false');
  }, []);

  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('dailyPhotosEnabled', String(newValue));
  };

  return { enabled, toggle };
}