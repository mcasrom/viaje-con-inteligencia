'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Image, Settings, X } from 'lucide-react';

export default function PhotoSettings() {
  const [enabled, setEnabled] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dailyPhotosEnabled');
    setEnabled(saved !== 'false');
  }, []);

  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('dailyPhotosEnabled', String(newValue));
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 z-40 p-3 bg-slate-800 rounded-full border border-slate-700 text-slate-400 hover:text-white transition-colors md:hidden"
        title="Configurar fotos"
      >
        <Image className="w-5 h-5" alt="" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center">
          <div className="bg-slate-800 rounded-t-2xl md:rounded-2xl w-full md:max-w-sm p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-400" alt="" />
                Fotos del día
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Mostrar una foto diferente cada día en el blog.
            </p>

            <button
              onClick={toggle}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-colors ${
                enabled 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-slate-700 border-slate-600 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                {enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                {enabled ? 'Fotos activadas' : 'Fotos desactivadas'}
              </span>
              <span className="text-xs opacity-60">
                {enabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}