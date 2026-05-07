'use server';

import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const COOKIE_NAME = 'admin_session';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function loginAction(prevState: any, formData: FormData) {
  if (!ADMIN_PASSWORD) {
    return { error: 'Servidor no configurado' };
  }

  const password = formData.get('password') as string;

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, '1', {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'lax',
      maxAge: IS_PROD ? 60 * 60 * 8 : 60 * 60 * 24,
      path: '/',
    });

    const from = formData.get('from') as string || '/admin/dashboard';
    return { success: true, redirect: from };
  }

  return { error: 'Password incorrecto' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return { redirect: '/admin/login' };
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value === '1';
}
