'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, DollarSign, Users, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

interface Price {
  id: string;
  product: string;
  unit_amount: number | null;
  currency: string;
  interval?: string;
  created: string;
}

export default function AdminStripePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/stripe')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-slate-900 text-white text-center py-20">Error cargando datos</div>;

  const subs = data.subscriptions || {};
  const prices = data.prices || [];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al admin
          </Link>
          <button onClick={fetchData} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Subscriptions Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-xs">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{subs.total || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-xs">Activas</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{subs.active || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 text-xs">Trial</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">{subs.trialing || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-slate-400 text-xs">Past Due</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{subs.past_due || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400 text-xs">Canceladas</span>
            </div>
            <div className="text-2xl font-bold text-slate-400">{subs.canceled || 0}</div>
          </div>
        </div>

        {/* Prices - los IDs que necesitas */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Precios Stripe (Price IDs)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Price ID</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Producto</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">Precio</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium">Intervalo</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p: Price) => (
                  <tr key={p.id} className="border-b border-slate-700/50">
                    <td className="py-2 px-3 font-mono text-xs text-blue-400">{p.id}</td>
                    <td className="py-2 px-3 text-white">{p.product}</td>
                    <td className="py-2 px-3 text-right text-white">
                      {p.unit_amount ? `${(p.unit_amount / 100).toFixed(2)} ${p.currency.toUpperCase()}` : '—'}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-400">{p.interval || 'one-time'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products */}
        {data.products?.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Productos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.products.map((prod: any) => (
                <div key={prod.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="font-mono text-xs text-blue-400 mb-1">{prod.id}</div>
                  <div className="text-white font-semibold">{prod.name}</div>
                  {prod.description && <div className="text-slate-400 text-xs mt-1">{prod.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Balance */}
        {data.balance && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Balance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-slate-400 text-xs mb-1">Disponible</div>
                {data.balance.available?.map((b: any) => (
                  <div key={b.currency} className="text-green-400 font-bold text-xl">
                    {b.amount.toLocaleString()} {b.currency.toUpperCase()}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Pendiente</div>
                {data.balance.pending?.map((b: any) => (
                  <div key={b.currency} className="text-amber-400 font-bold text-xl">
                    {b.amount.toLocaleString()} {b.currency.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Env vars needed */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Variables de entorno</h2>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-slate-300">STRIPE_SECRET_KEY</span>
              <span className="text-slate-500">= sk_live_51TMtv... (configurada)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-slate-300">STRIPE_PRICE_MONTHLY</span>
              <span className="text-slate-500">= price_1TNvdo... (configurada)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-slate-300">STRIPE_PRICE_YEARLY</span>
              <span className="text-slate-500">= price_1TQ0Ng... (configurada)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
