import { createHmac, timingSafeEqual } from 'node:crypto';
import { requiredEnv } from './env';

export const SESSION_SECONDS = 60 * 60 * 8;
export type AdminUser = { userId: string; email: string };

function signature(body: string, purpose: string) {
  const secret = requiredEnv('ADMIN_SESSION_SECRET');
  if (secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must have at least 32 characters');
  return createHmac('sha256', secret).update(`${purpose}:${body}`).digest('base64url');
}

export function signCookie(value: object, purpose: string, seconds: number, now = Date.now()) {
  const body = Buffer.from(JSON.stringify({ ...value, expires: Math.floor(now / 1000) + seconds })).toString('base64url');
  return `${body}.${signature(body, purpose)}`;
}

export function readCookie<T>(token: string | undefined, purpose: string, seconds: number, now = Date.now()): T | null {
  if (!token || token.length > 4096) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const expected = Buffer.from(signature(parts[0], purpose));
    const supplied = Buffer.from(parts[1]);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    const value = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const current = Math.floor(now / 1000);
    if (!Number.isInteger(value.expires) || value.expires <= current || value.expires > current + seconds) return null;
    return value as T;
  } catch { return null; }
}

export function createSession(user: AdminUser, now = Date.now()) {
  return signCookie(user, 'admin-session', SESSION_SECONDS, now);
}

export function readSession(token: string | undefined, now = Date.now()): AdminUser | null {
  const user = readCookie<AdminUser>(token, 'admin-session', SESSION_SECONDS, now);
  const allowed = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowed || !user || typeof user.userId !== 'string' || !user.userId || typeof user.email !== 'string' || user.email.toLowerCase() !== allowed) return null;
  return { userId: user.userId, email: user.email };
}
