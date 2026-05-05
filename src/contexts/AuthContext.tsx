'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;

interface User {
  id: string;
  email?: string;
  telegram_id?: string;
  user_metadata?: {
    username?: string;
    telegram_id?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  signInWithTelegram: (userId: string, username?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let cancelled = false;
    const timeout = setTimeout(() => { if (!cancelled) setLoading(false); }, 5000);
    const loadUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!cancelled) setUser(data.user as User | null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeout);
      }
    };
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
    });
    return () => { cancelled = true; clearTimeout(timeout); subscription.unsubscribe(); };
  }, []);

  const signInWithEmail = async (email: string) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    return { error: error?.message };
  };

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signUpWithPassword = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    return { error: error?.message };
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard&reset=true`,
    });
    return { error: error?.message };
  };

  const updatePassword = async (password: string) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message };
  };

  const signInWithTelegram = async (userId: string, username?: string) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.signInWithOtp({
      email: `telegram_${userId}@viaje-inteligencia.app`,
      options: { data: { telegram_id: userId, username } },
    });
    return { error: error?.message };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signInWithPassword, signUpWithPassword, resetPassword, updatePassword, signInWithTelegram, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
