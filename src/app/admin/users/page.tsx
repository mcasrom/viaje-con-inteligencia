'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Crown, Loader2, Mail, Calendar, Clock, AlertTriangle, Shield } from 'lucide-react';

const MODULE_LOAD_TIME = Date.now();

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  is_premium: boolean;
  subscription_status: string | null;
  trial_end: string | null;
  telegram_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'premium' | 'trial' | 'none'>('all');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    if (filter === 'premium' && !u.is_premium) return false;
    if (filter === 'trial' && (!u.subscription_status?.includes('trial') && !u.trial_end)) return false;
    if (filter === 'none' && (u.is_premium || u.subscription_status === 'active')) return false;
    if (search && !u.email?.toLowerCase().includes(search.toLowerCase()) && !u.username?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-medium text-sm">Admin Usuarios</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Usuarios</h1>
        <p className="text-slate-400 mb-6">{users.length} usuarios registrados</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por email o username..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          {(['all', 'premium', 'trial', 'none'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'premium' ? 'Premium' : f === 'trial' ? 'Trial' : 'Free'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden sm:table-cell">Username</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase">Estado</th>
                    <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden md:table-cell">Trial</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase hidden lg:table-cell">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const trialActive = u.trial_end && new Date(u.trial_end) > new Date(MODULE_LOAD_TIME);
                    const trialDaysLeft = u.trial_end ? Math.ceil((new Date(u.trial_end).getTime() - MODULE_LOAD_TIME) / 86400000) : null;
                    return (
                      <tr key={u.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span className="text-white font-medium">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{u.username || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {u.is_premium ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                              <Crown className="w-3 h-3" /> Premium
                            </span>
                          ) : trialActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                              <Clock className="w-3 h-3" /> Trial
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full text-xs font-medium">
                              Free
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          {trialDaysLeft !== null && trialDaysLeft > 0 ? (
                            <span className="text-amber-400 text-xs">{trialDaysLeft}d restantes</span>
                          ) : u.trial_end ? (
                            <span className="text-red-400 text-xs">Expirado</span>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 text-xs hidden lg:table-cell">
                          {new Date(u.created_at).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
