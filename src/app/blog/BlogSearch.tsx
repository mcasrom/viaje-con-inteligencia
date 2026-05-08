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
    <form className="flex-1 flex gap-2" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar artículos..."
          className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        Buscar
      </button>
    </form>
  );
}
