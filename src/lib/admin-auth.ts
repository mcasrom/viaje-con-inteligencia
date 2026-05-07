'use server';

import { cookies } from 'next/headers';
import { createHash } from 'crypto';

const PASSWORD_HASH = 'df7d515aba10266b67bcd9a5fa5fbe03dc433886c2aa2b8bf67e2dba0898ddb2';
const COOKIE_NAME = 'admin_session';
const IS_PROD = process.env.NODE_ENV === 'production';

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw).digest('hex');
}

export async function loginAction(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;

  if (hashPassword(password) === PASSWORD_HASH) {
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
