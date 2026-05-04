import { loginAction } from '@/lib/admin-auth';
import { Shield, Lock } from 'lucide-react';
import LoginForm from './LoginForm';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-10 h-10 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
        </div>
        <p className="text-slate-400 mb-6">Introduce la contraseña para acceder</p>
        <LoginForm from={params.from || '/admin/dashboard'} />
      </div>
    </div>
  );
}
