'use client';

import dynamic from 'next/dynamic';

const TestMap = dynamic(() => import('./TestMap'), { ssr: false });

export default function TestLeafletPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <h1 className="text-white text-xl mb-4">Leaflet Test</h1>
      <TestMap />
    </div>
  );
}
