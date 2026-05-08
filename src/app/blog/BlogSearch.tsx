'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface Props {
  initialSearch: string;
  category?: string;
  view: string;
}

export default function BlogSearch({ initialSearch, category, view }: Props) {
  const [value, setValue] = useState(initialSearch);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (value.trim()) qs.set('search', value.trim());
    if (category) qs.set('category', category);
    if (view === 'grid') qs.set('view', 'grid');
    router.push(`/blog${qs.toString() ? '?' + qs.toString() : ''}`);
  };

  return (
    <form className="flex-1 relative" onSubmit={handleSubmit}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar artículos..."
        className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
      />
      {category && <input type="hidden" name="category" value={category} />}
      <button type="submit" className="sr-only">Buscar</button>
    </form>
  );
}
