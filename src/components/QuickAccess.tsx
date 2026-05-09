'use client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bell, BellOff } from 'lucide-react';
import LoginButton from './LoginButton';

function QuickAccessInner() {
  const [showPanel, setShowPanel] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle'|'subscribed'|'denied'|'loading'>('idle');
  const searchParams = useSearchParams();

  useEffect(() => {
    const urgent = searchParams.get('leaving');
    if (urgent) setShowPanel(true);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('PushManager' in window)) return;
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => {
        if (sub) setPushStatus('subscribed');
      })
    );
  }, []);

  const handlePush = async () => {
    if (typeof window === 'undefined' || !('PushManager' in window)) return;
    if (pushStatus === 'subscribed') {
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
      return;
    }
    setPushStatus('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setPushStatus('denied'); return; }
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      const padding = '='.repeat((4 - (vapidKey.length % 4)) % 4);
      const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const key = new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });
      setPushStatus('subscribed');
    } catch(e) {
      console.error('[Push]', e);
      setPushStatus('idle');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end gap-3">
      <div className="bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700 w-72 mb-16 mr-2" style={{ display: showPanel ? 'block' : 'none' }}>
        <h3 className="text-white font-bold mb-3">⚡ Acceso Rápido</h3>
        <div className="space-y-2">
          <Link href="/comparar" className="block p-2 bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30">⚖️ Comparar países</Link>
          <Link href="/checklist" className="block p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30">📋 Checklist viaje</Link>
          <Link href="/relojes" className="block p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30">🌍 Horario Global</Link>
          <Link href="/blog" className="block p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30">📖 Blog recomendaciones</Link>
          <Link href="https://t.me/ViajeConInteligenciaBot" target="_blank" rel="noopener noreferrer" className="block p-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30">🤖 Bot Telegram</Link>
          <Link href="/chat" className="block p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30">💬 Chat IA</Link>
          <Link href="/rutas?route=vino" className="block p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30">🍷 Rutas del Vino</Link>
          <Link href="/dashboard" className="block p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30">📊 Mi Dashboard</Link>
          <Link href="/reclamaciones" className="block p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30">📝 Reclamaciones</Link>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <LoginButton variant="icon" />
        {pushStatus !== 'denied' && (
          <button
            onClick={handlePush}
            disabled={pushStatus === 'loading'}
            title={pushStatus === 'subscribed' ? 'Desactivar alertas' : 'Activar alertas de viaje'}
            className={`p-4 rounded-full shadow-lg transition-colors ${pushStatus === 'subscribed' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
          >
            {pushStatus === 'loading'
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block animate-spin" />
              : pushStatus === 'subscribed'
                ? <Bell className="w-5 h-5" />
                : <BellOff className="w-5 h-5" />
            }
          </button>
        )}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black p-4 rounded-full shadow-lg transition-colors"
          title="Accesos rápidos"
        >
          <span className="text-2xl">⚡</span>
        </button>
      </div>
    </div>
  );
}

export default function QuickAccess() {
  return (
    <Suspense fallback={null}>
      <QuickAccessInner />
    </Suspense>
  );
}
