'use client';
import { useState, useEffect } from 'react';
import { Download, X, Bell, BellOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): any {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0))) as unknown as Uint8Array<ArrayBuffer>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle' | 'subscribed' | 'denied' | 'loading'>('idle');

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Verificar si ya está suscrito
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setPushStatus('subscribed');
        });
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

  const handlePushSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setPushStatus('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushStatus('denied');
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });
      setPushStatus('subscribed');
    } catch (err) {
      console.error('[PWA] Push subscribe error:', err);
      setPushStatus('idle');
    }
  };

  const handlePushUnsubscribe = async () => {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setPushStatus('idle');
  };

  // Banner de instalación (igual que antes)
  if (showBanner && !isInstalled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl flex items-center gap-4">
          <div className="text-3xl hidden md:block">📱</div>
          <div className="flex-1">
            <p className="text-white font-medium">Añadir a pantalla inicio</p>
            <p className="text-slate-400 text-sm">Acceso rápido sin navegador</p>
          </div>
          <button
            onClick={handleInstall}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Instalar</span>
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Botón de notificaciones (visible cuando está instalada o sin banner)
  if (!('PushManager' in window)) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {pushStatus === 'subscribed' ? (
        <button
          onClick={handlePushUnsubscribe}
          title="Desactivar alertas de viaje"
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg flex items-center gap-2"
        >
          <Bell className="w-5 h-5" />
        </button>
      ) : pushStatus === 'denied' ? null : (
        <button
          onClick={handlePushSubscribe}
          disabled={pushStatus === 'loading'}
          title="Activar alertas de viaje"
          className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-full shadow-lg flex items-center gap-2"
        >
          {pushStatus === 'loading'
            ? <span className="w-5 h-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
            : <BellOff className="w-5 h-5" />
          }
        </button>
      )}
    </div>
  );
}
