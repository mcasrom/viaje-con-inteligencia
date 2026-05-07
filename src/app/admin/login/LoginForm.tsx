'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Lock, Loader2 } from 'lucide-react';

function SubmitButton({ loading }: { loading: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || loading}
      className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending || loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Verificando...
        </>
      ) : (
        'Acceder'
      )}
    </button>
  );
}

export default function LoginForm({ from }: { from: string }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = data.redirect;
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          required
        />
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  );
}
