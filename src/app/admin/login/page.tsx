import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import LoginForm from './LoginForm';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const IS_DEV = process.env.NODE_ENV !== 'production';
  const from = params.from || '/admin/dashboard';

  if (IS_DEV) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'dev', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    redirect(from);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-10 h-10 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
        </div>
        <p className="text-slate-400 mb-6">Introduce la contraseña para acceder</p>
        <LoginForm from={from} />
      </div>
    </div>
  );
}
