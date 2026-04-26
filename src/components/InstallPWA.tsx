'use client';
import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): any {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {});
      });
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  if (typeof window === 'undefined') return null;
  if (isInstalled) return null;

  return (
    <>
      {/* Banner Android/Chrome automático */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
          <div className="bg-slate-800 border border-blue-500/50 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <Smartphone className="w-8 h-8 text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white font-medium text-sm">📱 Instalar app</p>
                <p className="text-slate-400 text-xs mt-0.5">Accede sin navegador, más rápido</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleInstall} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all">
                    <Download className="w-3 h-3" />
                    Instalar
                  </button>
                  <button onClick={() => setShowBanner(false)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all">
                    Ahora no
                  </button>
                </div>
              </div>
              <button onClick={() => setShowBanner(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guía iOS manual */}
      {isIOS && !showBanner && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="fixed bottom-20 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg"
            title="Instalar app en iPhone"
          >
            <Smartphone className="w-5 h-5" />
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
              <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    Instalar en iPhone/iPad
                  </h3>
                  <button onClick={() => setShowIOSGuide(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">1</span>
                    <div>
                      <p className="text-white font-medium">Pulsa el botón Compartir</p>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        Icono <Share className="w-3 h-3 inline" /> en la barra inferior de Safari
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">2</span>
                    <div>
                      <p className="text-white font-medium">Añadir a pantalla de inicio</p>
                      <p className="text-slate-400 text-xs mt-0.5">Desplázate hacia abajo en el menú</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">3</span>
                    <div>
                      <p className="text-white font-medium">Pulsa "Añadir"</p>
                      <p className="text-slate-400 text-xs mt-0.5">La app aparecerá en tu pantalla de inicio</p>
                    </div>
                  </li>
                </ol>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-xs">⚠️ Solo funciona desde <strong>Safari</strong>. Chrome en iOS no soporta instalación PWA.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
