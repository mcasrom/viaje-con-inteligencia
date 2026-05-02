'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const RutasClient = dynamic(() => import('./RutasClient'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  ),
});

export default function RutasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <RutasClient />
    </Suspense>
  );
}
