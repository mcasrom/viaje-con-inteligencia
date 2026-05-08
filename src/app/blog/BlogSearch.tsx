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
        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
      />
      {category && <input type="hidden" name="category" value={category} />}
      <button type="submit" className="sr-only">Buscar</button>
    </form>
  );
}
