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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar artículos..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-500 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:bg-slate-600 transition-all"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        Buscar
      </button>
    </form>
  );
}
