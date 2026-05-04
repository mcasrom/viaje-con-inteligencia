'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Lock } from 'lucide-react';
import { loginAction } from '@/lib/admin-auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
    >
      {pending ? 'Verificando...' : 'Acceder'}
    </button>
  );
}

export default function LoginForm({ from }: { from: string }) {
  const [state, action] = useActionState(loginAction, null);

  return (
    <form action={action}>
      <input type="hidden" name="from" value={from} />
      <div className="relative mb-4">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="password"
          name="password"
          className="w-full bg-slate-700 text-white pl-11 pr-4 py-3 rounded-xl border border-slate-600 focus:border-purple-500 focus:outline-none"
          placeholder="Contraseña..."
          autoFocus
          required
        />
      </div>
      {state?.error && <p className="text-red-400 text-sm mb-4">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
