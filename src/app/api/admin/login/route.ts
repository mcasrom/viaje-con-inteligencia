import { NextRequest, NextResponse } from 'next/server';
import { getAdminPassword, verifyAdminPassword } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!getAdminPassword()) {
    return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
  }

  if (verifyAdminPassword(password)) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, getAdminPassword(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ error: 'Password incorrecto' }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = cookie === getAdminPassword();
  return NextResponse.json({ authenticated: isAuthenticated });
}
