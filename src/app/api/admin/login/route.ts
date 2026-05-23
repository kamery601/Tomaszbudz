import { NextRequest, NextResponse } from 'next/server';
import { createAuthCookieValue, validateAdminCredentials, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const login = String(body?.login ?? '').trim();
  const password = String(body?.password ?? '');

  if (!login || !password) {
    return NextResponse.json({ success: false, error: 'Podaj login i hasło.' }, { status: 400 });
  }

  if (!validateAdminCredentials(login, password)) {
    return NextResponse.json({ success: false, error: 'Nieprawidłowy login lub hasło.' }, { status: 401 });
  }

  const cookieValue = createAuthCookieValue(login);
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  });

  return response;
}
