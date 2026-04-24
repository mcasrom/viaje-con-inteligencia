'use client';

import { MapPin, AlertTriangle, Clock, DollarSign, Globe, Phone } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-5 h-5 bg-slate-700 rounded animate-pulse" />
            <div className="w-24 h-4 bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="w-32 h-10 bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-2xl p-8 mb-8 border border-slate-700 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-slate-700 rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="w-48 h-8 bg-slate-700 rounded" />
              <div className="w-64 h-4 bg-slate-700 rounded" />
            </div>
            <div className="w-32 h-12 bg-slate-700 rounded-xl" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-6 h-6 bg-slate-700 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-700 rounded" />
                <div className="w-3/4 h-4 bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="w-48 h-6 bg-slate-700 rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="w-32 h-4 bg-slate-700 rounded" />
                <div className="w-40 h-4 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}