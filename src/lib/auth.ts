import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'elektro_admin_session';
const adminCookieSecret = process.env.ADMIN_COOKIE_SECRET || 'ElectroPanelSecret2026!';

interface AdminCredentials {
  login: string;
  password: string;
}

function getAdminCredentials(): AdminCredentials[] {
  return [
    { login: process.env.ADMIN_USER_1?.trim() ?? '', password: process.env.ADMIN_PASS_1?.trim() ?? '' },
    { login: process.env.ADMIN_USER_2?.trim() ?? '', password: process.env.ADMIN_PASS_2?.trim() ?? '' }
  ].filter((item) => item.login && item.password);
}

export function validateAdminCredentials(login: string, password: string): boolean {
  return getAdminCredentials().some((admin) => admin.login === login && admin.password === password);
}

function createSignature(login: string) {
  return crypto.createHmac('sha256', adminCookieSecret).update(login).digest('hex');
}

export function createAuthCookieValue(login: string): string {
  return `${login}:${createSignature(login)}`;
}

export function verifyAuthCookie(value: string | null): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const [login, signature] = value.split(':');
  if (!login || !signature) {
    return null;
  }

  if (!validateAdminCredentials(login, getAdminCredentials().find((item) => item.login === login)?.password ?? '')) {
    return null;
  }

  if (signature !== createSignature(login)) {
    return null;
  }

  return login;
}

export async function getLoggedInAdmin() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? null;
  return verifyAuthCookie(raw);
}
