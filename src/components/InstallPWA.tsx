'use client';
import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, Share, Tablet, Loader2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const tablet = /ipad|tablet|playbook|silk|android(?!.*mobile)/i.test(ua);
    setIsIOS(ios);
    setIsTablet(tablet);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Auto-dismiss on scroll
    const handleScroll = () => {
      if (window.scrollY > 100 && showBanner) {
        setShowBanner(false);
        setDismissed(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showBanner]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setShowBanner(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (typeof window === 'undefined') return null;
  if (isInstalled || dismissed) return null;

  const DeviceIcon = isTablet ? Tablet : Smartphone;

  return (
    <>
      {/* Banner Chrome/Android */}
      {showBanner && deferredPrompt && (
        <div className="fixed bottom-4 left-2 right-2 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="bg-slate-800/95 backdrop-blur-md border border-blue-500/40 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <DeviceIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Instalar ViajeIA</p>
                <p className="text-slate-400 text-xs mt-0.5 leading-tight">
                  Accede más rápido desde tu pantalla de inicio
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Instalar
                  </button>
                  <button
                    onClick={() => { setShowBanner(false); setDismissed(true); }}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-all active:scale-95"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
              <button
                onClick={() => { setShowBanner(false); setDismissed(true); }}
                className="text-slate-500 hover:text-white p-1"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante iOS */}
      {isIOS && !showBanner && !dismissed && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="fixed bottom-20 right-4 z-40 bg-blue-600 text-white p-3.5 rounded-full shadow-lg hover:bg-blue-500 active:scale-95 transition-all"
            aria-label="Instalar app en iPhone/iPad"
          >
            <DeviceIcon className="w-5 h-5" />
          </button>

          {/* Modal guía iOS */}
          {showIOSGuide && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
              <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                    <DeviceIcon className="w-5 h-5 text-blue-400" />
                    {isTablet ? 'Instalar en iPad' : 'Instalar en iPhone'}
                  </h3>
                  <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <ol className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">1</span>
                    <div>
                      <p className="text-white font-medium">Pulsa Compartir</p>
                      <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                        Icono <Share className="w-3 h-3 inline" /> en Safari
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">2</span>
                    <div>
                      <p className="text-white font-medium">Añadir a Inicio</p>
                      <p className="text-slate-400 text-xs mt-0.5">Desplázate y pulsa "Añadir a pantalla de inicio"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">3</span>
                    <div>
                      <p className="text-white font-medium">Pulsa "Añadir"</p>
                      <p className="text-slate-400 text-xs mt-0.5">La app aparecerá en tu Home con el icono ViajeIA</p>
                    </div>
                  </li>
                </ol>

                <div className="mt-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-300 text-xs">
                    ⚠️ Solo desde <strong>Safari</strong>. Chrome en iOS no soporta instalación PWA.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
