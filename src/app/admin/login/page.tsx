'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/login')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/admin/dashboard');
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Password incorrecto');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-10 h-10 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
        </div>
        <p className="text-slate-400 mb-6">Introduce la contraseña para acceder</p>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 text-white pl-11 pr-4 py-3 rounded-xl border border-slate-600 focus:border-purple-500 focus:outline-none"
              placeholder="Contraseña..."
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}
